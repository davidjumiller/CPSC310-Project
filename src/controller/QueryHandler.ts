import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";
import {Query} from "./Query";
import {Section} from "./Section";
import {Dataset} from "./Dataset";

export class QueryHandler {

    public static parseQuery(query: any): Query {
        let q: Query = new Query(query);
        // Log.trace("foo");
        // Log.trace(q);
        return q;
    }

    public static validQuery(parsedQuery: Query): boolean {
        return true;
    }

    public static executeBody(query: Query, datasets: Dataset[]): Section[] {
        let activeDataset: Dataset;
        for (let i of datasets) {
            if (i.isd.id === query.datasetID) {
                activeDataset = i;
            }
        }
        // Log.trace(activeDataset.sections);
        for (let section of activeDataset.sections) {
            // TODO check if the section meets the query

        }
        return [];
    }

    public static executeOptions(options:  Options): string[] {
        return [];
    }

    public static filterWithOptions(selectedSections: Section[], selectedFields: string[]): any[] {
        return [];
    }
}
