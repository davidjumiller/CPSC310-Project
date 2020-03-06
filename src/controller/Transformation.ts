import {Group} from "./Group";
import {Apply} from "./Apply";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {AnyKey} from "./AnyKey";
import {IdString} from "./IdString";

export class Transformation {
    constructor(queryElement: any) {
        // Log.trace(queryElement);
        let queryElementKeys: string[] = Object.keys(queryElement);
        if (queryElementKeys[0] === "GROUP") {
            this.group = new Group(queryElement[queryElementKeys[0]]);
        } else {
            throw (new InsightError("invalid Transformation. No Group"));
        }
        if (queryElementKeys[1] === "APPLY") {
            this.apply = new Apply(queryElement[queryElementKeys[1]]);
        } else {
            throw (new InsightError("invalid Transformation. No Apply"));
        }
        if (queryElementKeys.length !== 2) {
            throw (new InsightError("invalid Transformation"));
        }
    }

    public group: Group;
    public apply: Apply;

    public applyTransformation(selectedSections: any[]): any[] {
        let groups: Map<string, any[]> = this.group.createGroups(selectedSections);
        let retVal: any[] = this.apply.doApplyRules(groups, this.group);
        return retVal;
    }

    public isValid(keys: AnyKey[]) {
        this.apply.isValid();
        let validKeys: string[] = [];
        for (let i of this.group.groupKeys) {
            validKeys.push(i.getKeyField());
        }
        for (let i of this.apply.applyRules) {
            validKeys.push(i.applyKey.getKeyField());
        }
        for (let key of keys) {
            if (!validKeys.includes(key.getKeyField())) {
                throw ( new InsightError("column keys must be either a group key or an apply key"));
            }
        }

    }

    public addKeyIds(keyIds: IdString[]) {
        this.group.addKeyIds(keyIds);
        this.apply.addKeyIds(keyIds);
    }

    public getDatasetID(): string {
        let temp: string = this.group.getDatasetID();
        if (!temp) {
            temp = this.apply.getDatasetID();
        }
        return temp;
    }
}
