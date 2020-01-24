import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";
import {Course} from "./Course";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    // let datasets:
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let zip: JSZip = new JSZip();
        let courses: Course[] = [];
        let p1 = new Promise<string[]>((resolve, reject) => {
            zip.loadAsync(content, { base64: true}).then(function (files: JSZip) {
                let promises: Array<Promise<any>> = [];
                files.forEach( (relativePath, file) => {
                    // eslint-disable-next-line no-console
                    // console.log("iterating over", relativePath);
                    // let courses: Course[] = [];
                    // I had to add this because for some reason the first iteration of the courses test was NULL
                    let openedFile: any = files.file(relativePath);
                    if (openedFile) {
                        promises.push(openedFile.async("text"));
                    }
                });
                // Once all of the files have finished being read continue
                Promise.all(promises).then(function success( allFiles) {
                    allFiles.forEach(function (file) {
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
                            // TODO if the course is missing any fields don't add it
                            courses.push(curCourse);
                        }
                    });
                    for (let i in courses) {
                        // eslint-disable-next-line no-console
                        console.log(courses[i]);
                    }
                    // TODO build a proper dataset and then return all of the ids in the datasets lists
                    let ids: string[] = [id];
                    // datasets.push(new Dataset(id, courses));
                    // for (let i in datasets) {
                    //     ids.push(datasets[i].id);
                    // }
                    resolve(ids);
                }, function error(e) {
                    // TODO better reject message
                    reject("why?");
                    // handle the error
                });
            }).catch((error: any) => {
                reject(error);
            });
        });
        return p1;
        // return Promise.reject("Not implemented.");
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
                curCourse.instructor = section[fieldName];
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
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise<any[]> {
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
