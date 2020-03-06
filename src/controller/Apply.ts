import {ApplyRule} from "./ApplyRule";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {Key} from "./Key";
import {Group} from "./Group";
import {AnyKey} from "./AnyKey";
import {SKey} from "./SKey";
import {MKey} from "./MKey";
import {IdString} from "./IdString";

export class Apply {
    constructor(queryElement: any) {
        this.applyRules = [];
        if (!(typeof Object(queryElement[Symbol.iterator]) === "function")) {
            throw(new InsightError("Apply must be an array"));
        }

        for (let i of queryElement) {
            this.applyRules.push(new ApplyRule(i));
        }
    }

    public applyRules: ApplyRule[];

    public doApplyRules(groups: Map<string, any[]>, group: Group): any[] {
        // Log.trace(groups);
        let retVal: any[] = [];
        groups.forEach((value: any[], key: string) => {
            let curObj: any = {};
            group.setGroupFieldsOnObj(curObj, value[0]);
            // Log.trace(curObj);

            for (let applyRule of this.applyRules) {
                curObj[applyRule.applyKey.getKeyField()] = applyRule.apply(value);
                if (!curObj[applyRule.applyKey.getKeyField()]) {
                    throw (new InsightError("bad apply rule. Used a key from the wrong dataset"));
                }
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

    public addKeyIds(keyIds: IdString[]) {
        for (let i of this.applyRules) {
            keyIds.push(i.applyTokenKey.getKeyIdClass());
        }
    }

    public getDatasetID(): string {
        for (let i of this.applyRules) {
            if (i.applyTokenKey.getKeyId()) {
                return i.applyTokenKey.getKeyId();
            }
        }
    }
}
