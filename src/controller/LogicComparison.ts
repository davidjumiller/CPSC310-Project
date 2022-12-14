import {Filter} from "./Filter";
import {InsightError} from "./IInsightFacade";
export enum Logic {
    AND = 0,
    OR= 1,
}
export class LogicComparison {
    constructor(queryElement: any) {
        this.filters = [];
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 1) {
            throw (new InsightError("Invalid LogicComparison too many keys"));
        }
        switch (keys[0]) {
            case "AND":
                this.logic = Logic.AND;
                break;
            case "OR":
                this.logic = Logic.OR;
                break;
            default:
                throw (new InsightError("invalid logic operator"));
        }
        let filters: any = queryElement[keys[0]];
        if (Object.keys(filters).length === 0) {
            throw (new InsightError("No filters in Logic Operator"));
        }
        for (let i of filters) {
            this.filters.push(new Filter(i));
        }
    }

    public filters: Filter[]; // Can't be empty
    public logic: Logic;
}
