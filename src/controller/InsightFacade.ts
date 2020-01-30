import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";
import {Course} from "./Course";
import {Dataset} from "./Dataset";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    public datasets: Dataset[];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.datasets = [];
    }

    private validID(id: string): boolean {
        if (id.includes("_") || !(/\S/.test(id))) {
            return false;
        }
        return true;
    }
    private static isCourseValid(curCourse: Course): boolean {
        if (curCourse.title === undefined || curCourse.instructor === undefined || curCourse.id === undefined
            || curCourse.audit === undefined || curCourse.avg === undefined || curCourse.dept === undefined ||
            curCourse.fail === undefined || curCourse.pass === undefined || curCourse.uuid === undefined ||
            curCourse.year === undefined) {
            return false;
        }
        return true;
    }

    private  static writeDatasetToDisk(newDataset: Dataset) {
        // TODO write newDataset to disk
    }


    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        if (!this.validID(id) || kind === InsightDatasetKind.Rooms) {return Promise.reject(new InsightError()); }
        let zip: JSZip = new JSZip();
        let courses: Course[] = [];
        let rows: number = 0;
        // This feels hacky but had to be done so we have a way to access this in the promises
        let reference: InsightFacade = this;
        let ids: string[] = [];
        for (let i in reference.datasets) {
            if (id === reference.datasets[i].isd.id) { return Promise.reject(new InsightError()); }
            ids.push(reference.datasets[i].isd.id);
        }

        let p1 = new Promise<string[]>((resolve, reject) => {
            zip.loadAsync(content, { base64: true})
                .then((files: JSZip) => {
                let promises: Array<Promise<any>> = [];
                files.forEach( (relativePath, file) => {
                    // If we do have to then just check for more than one /
                    // Log.trace("iterating over", relativePath);

                    // This "accidentaly" stops situations like a courses dataset being added as a rooms dataset
                    //  This should be good for this sprint but it will need to be looked at more when we add rooms
                    if (!relativePath.startsWith("courses/")) {
                        return reject(new InsightError());
                    }
                    // let courses: Course[] = [];
                    // I had to add this because for some reason the first iteration of the courses test was NULL
                    let openedFile: any = files.file(relativePath);
                    if (openedFile) {
                        promises.push(openedFile.async("text"));
                    }
                    // if (file) { promises.push(file.async("text")); }
                });
                // Once all of the files have finished being read continue
                this.CreateAllSectionsFromLoadedFiles(promises, courses, rows, id, reference, ids, resolve, reject);
                }).catch((error: any) => {
                    Log.trace("Why mad");
                // This should catch any bad ZIP files
                    return reject(new InsightError(error));
                });
        });
        return p1;
    }

    private CreateAllSectionsFromLoadedFiles(promises: Array<Promise<any>>, courses: Course[], rows: number, id: string,
                                             reference: InsightFacade, ids: string[],
                                             resolve: (value?: (PromiseLike<string[]> | string[])) => void,
                                             reject: (reason?: any) => void) {
        Promise.all(promises).then((allFiles) => {
            allFiles.forEach((file) => {
                // Parse the file into a JSON object
                let json: any = JSON.parse(file);
                // Get the array of files from the file
                let sections: any = json["result"];
                // Go through all of the sections in the file
                for (let section of sections) {
                    let curCourse: Course = new Course();
                    // Go through all of the elements of a section
                    for (let fieldName in section) {
                        InsightFacade.findValidFields(fieldName, curCourse, section);
                    }
                    // TODO figure out if we should skip an entire file if one section is invalid
                    //  or if we just skip the section
                    if (InsightFacade.isCourseValid(curCourse)) {
                        courses.push(curCourse);
                        rows++;
                    }
                }
            });

            // Log.trace(courses);
            // Log.trace(reference);
            // Push the newly added dataset onto the list of datasets then walk
            // through all the added datasets and get their id's
            // let ids: string[] = [];
            const isd: InsightDataset = {id: id, kind: InsightDatasetKind.Courses, numRows: rows};
            const newDataset: Dataset = new Dataset(isd, courses);
            reference.datasets.push(newDataset);
            InsightFacade.writeDatasetToDisk(newDataset);
            // for (let i in reference.datasets) {
            //     ids.push(reference.datasets[i].id);
            // }
            ids.push(newDataset.isd.id);
            return resolve(ids);
            // }, function error(e) {
            // handle the error
        }).catch((err: any) => {
            // I'm not sure how this will ever be hit
            return reject(new InsightError(err));
        });
    }

    private static findValidFields(fieldName: string, curCourse: Course, section: any) {
        switch (fieldName) {
            case "Subject":
                curCourse.dept = section[fieldName];
                break;
            case "Course":
                curCourse.id = section[fieldName];
                break;
            case "Avg":
                curCourse.avg = section[fieldName];
                break;
            case "Professor":
                if (section[fieldName] === "") {
                    curCourse.instructor = " ";
                } else {
                    curCourse.instructor = section[fieldName];
                }
                break;
            case "Title":
                curCourse.title = section[fieldName];
                break;
            case "Pass":
                curCourse.pass = section[fieldName];
                break;
            case "Fail":
                curCourse.fail = section[fieldName];
                break;
            case "Audit":
                curCourse.audit = section[fieldName];
                break;
            case "id":
                curCourse.uuid = section[fieldName];
                break;
            case "Year":
                curCourse.year = section[fieldName];
                break;
        }
    }

    public removeDataset(id: string): Promise<string> {
        if (!this.validID(id)) {
            return Promise.reject(new InsightError("Invalid ID" + id));
        }
        for (let i in this.datasets) {
            if (id === this.datasets[i].isd.id) {
                // This should remove the array element
                this.datasets.splice(parseInt(i, 10) , 1);
                return Promise.resolve(id);
            }
        }
        return Promise.reject(new NotFoundError(id + " has not been added yet"));
    }

    public performQuery(query: any): Promise<any[]> {
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        let listData: InsightDataset[] = [];
        for (let dataset of this.datasets) {
            listData.push(dataset.isd);
        }
        return Promise.resolve(listData);
    }
}
