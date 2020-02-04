import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {Filter} from "./Filter";

export class Query {
    public body: Body;
    public options: Options;
    public datasetID: string;

    private static  getDatasetId(filter: Filter): string {
        // TODO this has to check the Columns if there is no filter because an empty filter is valid
        // I am not 100% sure this works but it works for my one test case at least
        if (filter.negation) {
            return Query.getDatasetId(filter.negation.filter);
        } else if ( filter.sComparison) {
            return filter.sComparison.sKey.idString.idString;
        } else if (filter.mComparison) {
            return filter.mComparison.mKey.idString.idString;
        } else if (filter.logicComparison) {
            return Query.getDatasetId(filter.logicComparison.filters[0]);
        }
    }
    constructor(query: any) {
        // This feels silly im sure ill think of a way to do this not in a loop.
        let inum: number = 0;
        for (let i in query) {
            // Log.trace(query[i]);
            if (inum === 0) {
                if (i === "WHERE") {
                    // Log.trace("body added");
                    this.body = new Body(query[i]);
                    this.datasetID = Query.getDatasetId(this.body.filter);
                    // Log.trace(query[i]);
                } else {
                    throw( new InsightError("Invalid first key in Query"));
                }
            } else if (inum === 1) {
                if (i === "OPTIONS") {
                    // Log.trace("options added");
                    this.options = new Options(query[i]);
                    // Log.trace(query[i]);
                } else {
                    // Log.trace("error in query const");
                    throw (new InsightError("invalid second key in query"));
                }
            } else {
                Log.trace("error in query const");
                throw (new InsightError("Too many keys in Query"));
            }
            inum++;
        }
        if (!this.body || !this.options) {
            throw (new InsightError("invalid query"));
        }
    }
}
