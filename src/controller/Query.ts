import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {Filter} from "./Filter";
import {Transformation} from "./Transformation";

export class Query {
    public body: Body;
    public options: Options;
    public datasetID: string;
    public transformation: Transformation;

    private getDatasetId(filter: Filter): string {
        // I am not 100% sure this works but it works for my one test case at least
        if (filter) {
            if (filter.negation) {
                return this.getDatasetId(filter.negation.filter);
            } else if ( filter.sComparison) {
                return filter.sComparison.sKey.idString.idString;
            } else if (filter.mComparison) {
                return filter.mComparison.mKey.idString.idString;
            } else if (filter.logicComparison) {
                return this.getDatasetId(filter.logicComparison.filters[0]);
            }
        } else {
            return this.options.columns.keys[0].getKeyId();
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
            } else if (inum === 2) {
                if (i === "TRANSFORMATIONS") {
                    this.transformation = new Transformation(query[i]);
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
        this.datasetID = this.getDatasetId(this.body.filter);
    }
}
