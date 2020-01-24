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
        let foo: JSZip = new JSZip();
        let courses: Course[] = [];
        let p1 = new Promise<string[]>((resolve, reject) => {
            foo.loadAsync(content, { base64: true}).then(function (result: JSZip) {
                foo.forEach(function (relativePath, file) {
                    // eslint-disable-next-line no-console
                    // console.log("iterating over", relativePath);
                    // let courses: Course[] = [];
                    foo.file(relativePath).async("text").then(function success( fum) {
                        // Parse the file into a JSON object
                        let json: any = JSON.parse(fum);
                        // Get the array of results from the file
                        let jjson: any = json["result"];
                        // Go through all of the sections in the file
                        for (let i in jjson) {
                            let curCourse: Course = new Course();
                            // Go through all of the elements of a section
                            for (let j in jjson[i]) {
                                InsightFacade.findValidFields(j, curCourse, jjson, i);
                            }
                            // TODO if the course is missing any fields don't add it
                            courses.push(curCourse);
                        }
                        for (let i in courses) {
                            // eslint-disable-next-line no-console
                            console.log(courses[i]);
                        }
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

                });
                // eslint-disable-next-line no-console
                console.log("here");
            });
        });
        return p1;
        // return Promise.reject("Not implemented.");
    }

    private static findValidFields(j: string, curCourse: Course, jjson: any, i: string) {
        switch (j) {
            case "Subject":
                curCourse.dept = jjson[i][j];
                break;
            case "Course":
                curCourse.id = jjson[i][j];
                break;
            case "Avg":
                curCourse.avg = jjson[i][j];
                break;
            case "Professor":
                curCourse.instructor = jjson[i][j];
                break;
            case "Title":
                curCourse.title = jjson[i][j];
                break;
            case "Pass":
                curCourse.pass = jjson[i][j];
                break;
            case "Fail":
                curCourse.fail = jjson[i][j];
                break;
            case "Audit":
                curCourse.audit = jjson[i][j];
                break;
            case "id":
                curCourse.uuid = jjson[i][j];
                break;
            case "Year":
                curCourse.year = jjson[i][j];
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
