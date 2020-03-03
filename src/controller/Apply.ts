import {ApplyRule} from "./ApplyRule";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {Key} from "./Key";
import {Group} from "./Group";
import {AnyKey} from "./AnyKey";
import {SKey} from "./SKey";
import {MKey} from "./MKey";

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

    public doApplyRules(groups: Map<string, any[]>, group: Group): any[] {
        // Log.trace(groups);
        let retVal: any[] = [];
        groups.forEach((value: any[], key: string) => {
            let curObj: any = {};
            group.setGroupFieldsOnObj(curObj, value[0]);
            // Log.trace(curObj);

            for (let applyRule of this.applyRules) {
                curObj[applyRule.applyKey.getKeyField()] = applyRule.apply(value);
            }
            retVal.push(curObj);
        });
        // Log.trace(retVal);
        return retVal;
    }

    public isValid() {
        let uniqueKeys: string[] = [];
        for (let i of this.applyRules) {
            if (uniqueKeys.includes(i.applyKey.getKeyField())) {
                throw (new InsightError("Apply rules must have unique apply keys"));
            } else {
                uniqueKeys.push(i.applyKey.getKeyField());
            }
            if (!(i.applyToken === "COUNT") && i.applyTokenKey.key instanceof SKey) {
                throw (new InsightError("SUM, MIN, MAX, AVG must be done on number only keys"));
            }
        }
    }
}
