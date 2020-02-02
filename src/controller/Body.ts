import {Filter} from "./Filter";
import Log from "../Util";
import {LogicComparison} from "./LogicComparison";
import {InsightError} from "./IInsightFacade";

export class Body {
    public filter: Filter; // Can be NULL
    constructor(queryElement: any) {
        // This feels kinda redundant to have a body class but for now lets keep it
        let keys: string[] = Object.keys(queryElement);
        // if the body has more than one key then it is not a valid query
        if (keys.length > 1) {
            throw (new InsightError("Filter has too many keys"));

            // Log.trace("error in body");
        }
        if (keys.length === 1) {
            this.filter = new Filter(queryElement);
        }
        // If the keys length is 0 then there is no filter
    }
}
