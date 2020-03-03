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

    public static findBuildings(document: any, id: string, ids: string[], reference: InsightFacade): Building[] {
        let buildings: Building[] = [];
        let table: any = RoomFinder.findTable(document);
        if (table == null) {
            Log.trace("Can't find table: " + table);
            throw new InsightError("Can't find table");
        }
        // tbody is always the 4th (3) obj in the childNodes array
        let tbody: any = table.childNodes[3];
        if (tbody.nodeName === "tbody") {
            tbody.childNodes.forEach((tr: any) => {
                if (tr.childNodes !== undefined) {
                    // TODO Handle duplicate buildings
                    let building: Building = new Building();
                    let td1: any = tr.childNodes[1];
                    let td2: any = tr.childNodes[3];
                    let td3: any = tr.childNodes[5];
                    let td4: any = tr.childNodes[7];
                    // This searchs the td to find the first instance of "a"
                    let a: any = td1.childNodes.find((td1Child: any) => {
                        return td1Child.nodeName === "a";
                    });
                    if (a != null && a !== undefined) {
                        building.path = a.attrs[0].value.slice(2);
                    }
                    // TODO This is a little hacky, change this to find the specific attr.value
                    building.shortname = td2.childNodes[0].value.trim();
                    building.fullname = td3.childNodes[1].childNodes[0].value.trim();
                    building.address = td4.childNodes[0].value.trim();
                    RoomFinder.findLatLon(building);

                    buildings.push(building);
                }
            });
            return buildings;
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
                if (zip.file("rooms/" + building.path) != null) {
                    promises.push(zip.file("rooms/" + building.path).async("text")
                    .then((buildingFile: string) => {
                        if (buildingFile == null || buildingFile === undefined) {
                            return;
                        }
                        let document: parse5.Document = parse5.parse(buildingFile);
                        let table: any = RoomFinder.findTable(document);
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

    private static findTable(document: any): any {
        let children: any = document.childNodes;
        if (document.nodeName === "table") {
            return document;
        } else if (children != null && children !== undefined) {
            let potentialTable: any;
            children.find((child: any) => {
                potentialTable = RoomFinder.findTable(child);
                if (potentialTable !== undefined) {
                    return true;
                }
            });
            return potentialTable;
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
                room.number = tr.childNodes[1].childNodes[1].childNodes[0].value;
                room.seats = tr.childNodes[3].childNodes[0].value.trim();
                room.furniture = tr.childNodes[5].childNodes[0].value.trim();
                room.type = tr.childNodes[7].childNodes[0].value.trim();
                room.href = tr.childNodes[9].childNodes[1].attrs[0].value;
                room.name = room.shortname + " " + room.number;
                roomsInBuilding.push(room);
                // TODO Should make check if all parts of the Rooms class are filled
            }
        });

        return roomsInBuilding;
    }

    // TODO
    private static findLatLon(building: Building) {
        let url: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team131/";
        let URLEncodedAddress: string = building.address.replace(/\s/g, "%20");
        url = url.concat(URLEncodedAddress);
        // try {
        //     http.get(url, (res) => {
        //         Log.trace(res);
        //     });
        // } catch (e) {
        //     Log.trace("fluff");
        // }
    }
}
