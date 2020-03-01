import {Key} from "./Key";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class Group {
    constructor(queryElement: any) {
        this.groupKeys = [];
        for (let i of queryElement) {
            this.groupKeys.push(new Key(i));
        }
        if (this.groupKeys.length === 0) {
            throw (new InsightError("Group can't be empty"));
        }
    }

    public groupKeys: Key[]; // This can have one or more but not 0
}
