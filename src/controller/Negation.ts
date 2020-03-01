import {Filter} from "./Filter";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class Negation {
    constructor(queryElement: any) {
        let keys: string[] = Object.keys(queryElement);
        // if the body has more than one key then it is not a valid query
        if (keys.length > 1) {
            throw (new InsightError("There is more than just one Filter in NOT"));
        }
        if (keys.length === 1) {
            this.filter = new Filter(queryElement);
        } else {
            throw (new InsightError("Invalid NOT"));
        }
    }

    public filter: Filter;
}
