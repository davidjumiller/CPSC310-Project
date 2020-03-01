import {ApplyRule} from "./ApplyRule";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class Apply {
    constructor(queryElement: any) {
        this.applyRules = [];

        for (let i of queryElement) {
            this.applyRules.push(new ApplyRule(i));
        }
        if (this.applyRules.length === 0) {
            throw (new InsightError("Apply can't be empty"));
        }
    }

    public applyRules: ApplyRule[]; // this can have one or more but not 0
}
