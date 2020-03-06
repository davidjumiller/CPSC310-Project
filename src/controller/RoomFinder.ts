import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";
import { Section } from "./Section";
import {Dataset} from "./Dataset";
import * as fs from "fs-extra";
import {Query} from "./Query";
import InsightFacade from "./InsightFacade";
import { Room } from "./Room";
import * as parse5 from "parse5";
import { Building } from "./Building";
import { DatasetHandler } from "./DatasetHandler";
import * as http from "http";
import {AgentOptions} from "https";

export class RoomFinder {

    public static findBuildings(document: any, id: string,
                                ids: string[], reference: InsightFacade, zip: JSZip): Promise<string[]> {
        let buildings: Building[] = [];
        let promises: Array<Promise<any>> = [];
        let table: any = RoomFinder.findNode(document, "table");
        if (table == null) {
            throw new InsightError("Can't find table");
        }
        let tbody: any = table.childNodes[3];
        if (tbody.nodeName === "tbody") {
            tbody.childNodes.forEach((tr: any) => {
                if (tr.childNodes !== undefined) {
                    let building: Building = new Building();
                    tr.childNodes.forEach((td: any) => {
                        RoomFinder.buildingSwitch(td, building);
                    });
                    promises.push(RoomFinder.findLatLon(building));
                    // Checks for duplicate buildings
                    if (buildings.filter((prevBuilding) => prevBuilding.fullname === building.fullname).length < 1) {
                        buildings.push(building);
                    }
                }
            });
        }
        let p1 = new Promise<string[]>((resolve, reject) => {
            Promise.all(promises).then(() => {
                return resolve(RoomFinder.findRooms(id, ids, reference, buildings, zip));
            });
        });
        return p1;
    }

    private static buildingSwitch(td: any, building: Building) {
        if (td.nodeName === "td" && td.attrs.length > 0) {
            let a: any = RoomFinder.findNode(td, "a");
            let value: any;
            let temp: any;
            // If "a" exists under td then search a for text
            if (a !== undefined) {
                temp = RoomFinder.findNode(a, "#text");
            } else {
                temp = RoomFinder.findNode(td, "#text");
            }
            // If findNode cant find "#text" within "a" then this is likely the image td
            if (temp !== undefined) {
                value = temp.value.trim();
            }
            switch (td.attrs[0].value) {
                case "views-field views-field-field-building-code":
                    building.shortname = value;
                    break;
                case "views-field views-field-title":
                    building.fullname = value;
                    break;
                case "views-field views-field-field-building-address":
                    building.address = value;
                    break;
                case "views-field views-field-nothing":
                    if (a.attrs.length > 0) {
                        building.path = a.attrs[0].value.slice(2);
                    }
                    break;
            }
        }
    }

    // Navigates to the room file and finds the number, furniture, type
    public static findRooms(id: string, ids: string[], reference: InsightFacade,
                            buildings: Building[], zip: JSZip): Promise<string[]> {
        let rows: number = 0;
        let rooms: Room[] = [];
        let promises: Array<Promise<any>> = [];

        let p1 = new Promise<string[]>((resolve, reject) => {
            buildings.forEach((building: Building) => {
                // Checks for valid building path, and valid building values (catches invalid lat lon)
                if (zip.file("rooms/" + building.path) != null && RoomFinder.isBuildingValid(building)) {
                    promises.push(zip.file("rooms/" + building.path).async("text")
                    .then((buildingFile: string) => {
                        if (buildingFile == null || buildingFile === undefined) {
                            return;
                        }
                        let document: parse5.Document = parse5.parse(buildingFile);
                        let table: any = RoomFinder.findNode(document, "table");
                        if (table != null && table !== undefined) {
                            let tbody: any = table.childNodes[3];
                            if (tbody.nodeName === "tbody") {
                                let roomsInBuilding: Room[] = [];
                                roomsInBuilding = RoomFinder.findRoomDetails(tbody, building);
                                rows += roomsInBuilding.length;
                                rooms = rooms.concat(roomsInBuilding);
                            }
                        }
                    }));
                }
            });

            Promise.all(promises).then(() => {
                if (rows === 0) {
                    return reject(new InsightError("no valid rooms"));
                }
                const isd: InsightDataset = {id: id, kind: InsightDatasetKind.Rooms, numRows: rows};
                const newDataset: Dataset = new Dataset(isd, rooms);
                reference.datasets.push(newDataset);
                DatasetHandler.writeDatasetToDisk(newDataset);
                ids.push(newDataset.isd.id);

                return resolve(ids);
            });
        });
        return p1;
    }

    private static findNode(document: any, key: string): any {
        let children: any = document.childNodes;
        if (document.nodeName === key) {
            return document;
        } else if (children != null && children !== undefined) {
            let potentialNode: any;
            children.find((child: any) => {
                potentialNode = RoomFinder.findNode(child, key);
                if (potentialNode !== undefined) {
                    return true;
                }
            });
            return potentialNode;
        }
    }

    private static findRoomDetails(tbody: any, building: Building): Room[] {
        let roomsInBuilding: Room[] = [];
        tbody.childNodes.forEach((tr: any) => {
            if (tr.childNodes !== undefined) {
                let room: Room = new Room();
                room.shortname = building.shortname;
                room.fullname = building.fullname;
                room.address = building.address;
                room.lat = building.lat;
                room.lon = building.lon;

                tr.childNodes.forEach((td: any) => {
                    RoomFinder.roomSwitch(td, room);
                });
                if (isNaN(room.seats) || room.seats === undefined) {
                    room.seats = 0;
                }
                room.name = room.shortname + "_" + room.number;
                if (RoomFinder.isRoomValid(room)) {
                    roomsInBuilding.push(room);
                }
            }
        });

        return roomsInBuilding;
    }

    private static roomSwitch(td: any, room: Room) {
        if (td.nodeName === "td" && td.attrs.length > 0) {
            let a: any = RoomFinder.findNode(td, "a");
            let value: any;
            let temp: any;
            // If "a" exists under td then search a for text
            if (a !== undefined) {
                temp = RoomFinder.findNode(a, "#text");
            } else {
                temp = RoomFinder.findNode(td, "#text");
            }
            // If findNode cant find "#text" within "a" then this is likely the image td
            if (temp !== undefined) {
                value = temp.value.trim();
            }
            switch (td.attrs[0].value) {
                case "views-field views-field-field-room-number":
                    room.number = value;
                    break;
                case "views-field views-field-field-room-capacity":
                    room.seats = Number(value);
                    break;
                case "views-field views-field-field-room-furniture":
                    room.furniture = value;
                    break;
                case "views-field views-field-field-room-type":
                    room.type = value;
                    break;
                case "views-field views-field-nothing":
                    if (a.attrs.length > 0) {
                        room.href = a.attrs[0].value;
                    }
                    break;
            }
        }
    }

    private static isBuildingValid(curBuilding: Building): boolean {
        if (curBuilding.fullname === undefined ||
            curBuilding.shortname === undefined ||
            curBuilding.address === undefined ||
            curBuilding.lat === undefined ||
            curBuilding.lon === undefined ||
            curBuilding.path === undefined) {
            return false;
        }
        return true;
    }

    private static isRoomValid(curRoom: Room): boolean {
        if (curRoom.fullname === undefined ||
            curRoom.shortname === undefined ||
            curRoom.number === undefined ||
            curRoom.name === undefined ||
            curRoom.address === undefined ||
            curRoom.lat === undefined ||
            curRoom.lon === undefined ||
            curRoom.seats === undefined ||
            curRoom.type === undefined ||
            curRoom.furniture === undefined ||
            curRoom.href === undefined) {
            return false;
        }
        return true;
    }

    private static findLatLon(building: Building): Promise<any> {
        let url: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team131/";
        let URLEncodedAddress: string = building.address.replace(/\s/g, "%20");
        url = url.concat(URLEncodedAddress);
        let p1: Promise<any> = new Promise<any>((resolve, reject) => {
            try {
                http.get(url, (res) => {
                    let data: string = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });
                    res.on("end", () => {
                        let responsJson: any = JSON.parse(data);
                        if (responsJson.lat) {
                            building.lat = responsJson.lat;
                            building.lon = responsJson.lon;
                            return resolve();
                        } else {
                            // The way we have implemented things makes this reject do nothing,
                            // we ignore the result of promise.all and simply rely on .then()
                            // invalid lat + lon is instead caught with an isBuildingValid check
                            return reject();
                        }
                    });
                });
            } catch (e) {
                throw (new InsightError("Invalid URL"));
            }
        });
        return p1;
    }
}
