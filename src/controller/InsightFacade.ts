import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";
import { Section } from "./Section";
import {Dataset} from "./Dataset";
import * as fs from "fs-extra";
import {Query} from "./Query";
import {QueryHandler} from "./QueryHandler";
import {DatasetHandler} from "./DatasetHandler";


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
        DatasetHandler.readSavedDatasets(this.datasets);
    }

    private validID(id: string): boolean {
        if (id.includes("_") || !(/\S/.test(id))) {
            return false;
        }
        return true;
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        if (!this.validID(id)) {
            return Promise.reject(new InsightError());
        } else if (kind === InsightDatasetKind.Rooms) {
            return DatasetHandler.addRoom(id, content, this);
        } else if (kind === InsightDatasetKind.Courses) {
            return DatasetHandler.addCourse(id, content, this);
        }
    }

    public removeDataset(id: string): Promise<string> {
        if (!this.validID(id)) {
            return Promise.reject(new InsightError("Invalid ID" + id));
        }
        try {
            for (let i in this.datasets) {
                if (id === this.datasets[i].isd.id) {
                    fs.removeSync("./data/" + this.datasets[i].isd.id + ".json");
                    // This should remove the array element
                    this.datasets.splice(parseInt(i, 10), 1);
                    return Promise.resolve(id);
                }
            }
            return Promise.reject(new NotFoundError(id + " has not been added yet"));
        } catch (e) {
            return  Promise.reject(new InsightError("remove failed"));
        }
    }

    public performQuery(query: any): Promise<any[]> {
        // return Promise.reject("Not implemented.");
        let parsedQuery: Query;
        try {
            parsedQuery = QueryHandler.parseQuery(query);
            if (!QueryHandler.validQuery(parsedQuery)) {
                Promise.reject(new InsightError());
            }
            let selectedSections: any[] = QueryHandler.executeBody(parsedQuery, this.datasets);
            if (parsedQuery.transformation) {
                selectedSections = parsedQuery.transformation.applyTransformation(selectedSections);
            }
            // let selectedFields: string[] = QueryHandler.executeOptions(query.options);
            let retval: any[] = QueryHandler.filterWithOptions(selectedSections, parsedQuery.options);
            // Log.trace(retval);
            return Promise.resolve(retval);
        } catch (e) {
            // TODO why is this creating an unhandled promise rejection in the test
            return Promise.reject(e);
        }
    }

    public listDatasets(): Promise<InsightDataset[]> {
        let listData: InsightDataset[] = [];
        for (let dataset of this.datasets) {
            listData.push(dataset.isd);
        }
        return Promise.resolve(listData);
    }
}
