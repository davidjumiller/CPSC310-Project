import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public recursion(obj: any) {
        for (let i in obj) {
            // console.log(item[i]);
            if (typeof obj[i] !== "object") {
                // eslint-disable-next-line no-console
                console.log(i + " " + obj[i]);
            } else if (typeof obj[i] === "object") {
                // eslint-disable-next-line no-console
                console.log(i );
                this.recursion(obj[i]);
            }
        }
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let foo: JSZip = new JSZip();
        foo.loadAsync(content, { base64: true}).then(function (result: JSZip) {
            foo.forEach(function (relativePath, file) {
                // eslint-disable-next-line no-console
                console.log("iterating over", relativePath);
                foo.file(relativePath).async("text").then(function success( fum) {
                    // At this point we have the contents of each file we just need to bring it into our datatype
                    // use the content
                    let json: any = JSON.parse(fum);
                    // eslint-disable-next-line no-console
                    // console.log(json["avg"]);
                    // for (let i in json["result"][0]) {
                    let keys: any = Object.entries(json["result"][0]);
                    /*for (let i in keys) {
                        let bar: any = keys[i];
                        // eslint-disable-next-line no-console
                        console.log(bar);
                    }*/

                    let flubber: InsightFacade = new InsightFacade();
                    flubber.recursion(json);

                    // }
                }, function error(e) {
                    // eslint-disable-next-line no-console
                    console.log("why");
                    // handle the error
                });

            });
            // eslint-disable-next-line no-console
            // console.log(result);
        });
        return Promise.reject("Not implemented.");
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
