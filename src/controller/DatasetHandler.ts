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
import { RoomFinder } from "./RoomFinder";

export class DatasetHandler {

    public static addRoom(id: string, content: string, reference: InsightFacade): Promise<string[]> {
        let zip: JSZip = new JSZip();
        let rooms: Room[] = [];
        let ids: string[] = [];

        for (let i in reference.datasets) {
            if (id === reference.datasets[i].isd.id) {
                return Promise.reject(new InsightError("Can't add two datasets with the same ID"));
            }
            ids.push(reference.datasets[i].isd.id);
        }

        let p1 = new Promise<string[]>((resolve, reject) => {
            zip.loadAsync(content, { base64: true})
                .then((files: JSZip) => {
                    let index: JSZip.JSZipObject = zip.file("rooms/index.htm");
                    if (index === null) {
                        return reject(new InsightError("No rooms folder or index.htm"));
                    } else {
                        index.async("text")
                            .then((indexContent: string) => {
                                let indexDocument: parse5.Document = parse5.parse(indexContent);
                                let buildings: Building[] = RoomFinder.findBuildings(indexDocument, id, ids, reference);
                                return resolve(RoomFinder.findRooms(id, ids, reference, buildings, zip));
                            })
                            .catch((err: any) => {
                                reject(new InsightError("Error finding rooms: " + err));
                            });
                    }
                });
        });
        return p1;
    }

    public static addCourse(id: string, content: string, reference: InsightFacade) {
        let zip: JSZip = new JSZip();
        let sections: Section[] = [];
        let rows: number = 0;
        let ids: string[] = [];
        for (let i in reference.datasets) {
            if (id === reference.datasets[i].isd.id) {
                return Promise.reject(new InsightError("Can't add two datasets with the same ID"));
            }
            ids.push(reference.datasets[i].isd.id);
        }

        let p1 = new Promise<string[]>((resolve, reject) => {
            zip.loadAsync(content, { base64: true})
                .then((files: JSZip) => {
                let promises: Array<Promise<any>> = [];
                files.forEach( (relativePath, file) => {
                    if (!relativePath.startsWith("courses/")) {
                        return reject(new InsightError("The dataset does not have a root folder of courses/"));
                    }

                    // I had to add this because for some reason the first iteration of the courses test was NULL
                    let openedFile: any = files.file(relativePath);
                    if (openedFile) {
                        promises.push(openedFile.async("text"));
                    }
                });
                // Once all of the files have finished being read continue
                this.CreateAllSectionsFromLoadedFiles(promises, sections, rows, id, reference, ids, resolve, reject);
                }).catch((error: any) => {

                // This should catch any bad ZIP files
                    return reject(new InsightError(error));
                });
        });
        return p1;
    }

    private static CreateAllSectionsFromLoadedFiles(promises: Array<Promise<any>>, sections: Section[], rows: number,
                                                    id: string,
                                                    reference: InsightFacade, ids: string[],
                                                    resolve: (value?: (PromiseLike<string[]> | string[])) => void,
                                                    reject: (reason?: any) => void) {
        Promise.all(promises).then((allFiles) => {
            allFiles.forEach((file) => {
                // Parse the file into a JSON object and if it is invalid throw an InsightError
                let json: any;
                try {
                    json = JSON.parse(file);
                } catch (e) {
                    throw new InsightError("invalid JSON");
                }
                // Get the array of files from the file
                let fileSections: any = json["result"];
                // Go through all of the sections in the file
                for (let section of fileSections) {
                    let curSection: Section = new Section();
                    // Go through all of the elements of a section
                    for (let fieldName in section) {
                        DatasetHandler.findValidFields(fieldName, curSection, section);
                    }
                    if (DatasetHandler.isSectionValid(curSection)) {
                        sections.push(curSection);
                        rows++;
                    }
                }
            });

            if (rows === 0) {
                return Promise.reject(new InsightError("no valid sections"));
            }
            const isd: InsightDataset = {id: id, kind: InsightDatasetKind.Courses, numRows: rows};
            const newDataset: Dataset = new Dataset(isd, sections);
            reference.datasets.push(newDataset);
            DatasetHandler.writeDatasetToDisk(newDataset);
            ids.push(newDataset.isd.id);
            return resolve(ids);
        }).catch((err: any) => {
            // I'm not sure how this will ever be hit
            return reject(new InsightError(err));
        });
    }

    private static findValidFields(fieldName: string, curSection: Section, section: any) {
        switch (fieldName) {
            case "Section":
                if (section[fieldName] === "overall") {
                    curSection.year = 1900;
                }
                curSection.section = section[fieldName];
                break;
            case "Subject":
                curSection.dept = section[fieldName];
                break;
            case "Course":
                curSection.id = section[fieldName];
                break;
            case "Avg":
                curSection.avg = section[fieldName];
                break;
            case "Professor":
                curSection.instructor = section[fieldName];
                curSection.instructorBlank = true;
                break;
            case "Title":
                curSection.title = section[fieldName];
                break;
            case "Pass":
                curSection.pass = section[fieldName];
                break;
            case "Fail":
                curSection.fail = section[fieldName];
                break;
            case "Audit":
                curSection.audit = section[fieldName];
                break;
            case "id":
                curSection.uuid = String(section[fieldName]);
                break;
            case "Year":
                // This if statement checks to make sure year was not
                // already set to 1900 because Section = "overall"
                if (!curSection.year) {
                    curSection.year = Number(section[fieldName]);
                }
                break;
        }
    }

    private static isSectionValid(curSection: Section): boolean {
        if (curSection.section === undefined || curSection.title === undefined ||
            curSection.instructorBlank === undefined || curSection.id === undefined
            || curSection.audit === undefined || curSection.avg === undefined || curSection.dept === undefined ||
            curSection.fail === undefined || curSection.pass === undefined || curSection.uuid === undefined ||
            curSection.year === undefined) {
            return false;
        }
        return true;
    }

    public static readSavedDatasets(datasets: Dataset[]) {
        // Ensures that there is a parsedDatasets dir
        fs.mkdirpSync("./data/");
        fs.readdirSync("./data/").forEach((file) => {
            Log.trace("File found: " + file);
            let Obj: any = fs.readJSONSync("./data/" + file);
            datasets.push(Obj);
            Log.trace("Dataset read from memory: " + Obj);
        });
    }

    public static writeDatasetToDisk(newDataset: Dataset) {
        fs.mkdirpSync("./data/");
        fs.writeJSONSync("./data/" + newDataset.isd.id + ".json", newDataset);
    }
}
