import {Filter} from "./Filter";
import Log from "../Util";
enum Logic {
    AND = 0,
    OR= 1,
}
export class LogicComparison {
    constructor(queryElement: any) {
        this.filters = [];
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 1) {
            // TODO throw an error there is more than one key in the LogicComparisonr
            Log.trace("error in LogicComparison");
        }
        switch (keys[0]) {
            case "AND":
                this.logic = Logic.AND;
                break;
            case "OR":
                this.logic = Logic.OR;
                break;
            default:
                // TODO throw an error because the key is not a valid Logic operator
        }
        let filters: any = queryElement[keys[0]];
        if (Object.keys(filters).length === 0) {
            // TODO throw an error because Logic has 0 filters
            Log.trace("error no filters in LogicComparison");
        }
        for (let i of filters) {
            // Log.trace(i);
            this.filters.push(new Filter(i));
        }
    }

    public filters: Filter[]; // Can't be empty
    public logic: Logic;
}
