import {Key} from "./Key";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {strict} from "assert";
import {IdString} from "./IdString";

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
    public createGroups(selectedSections: any[]): Map<string, any[]> {
        let retval:  Map<string, any[]> = new Map();
        for (let i of selectedSections) {
            let groupKey: string = "";
            for (let j of this.groupKeys) {
                // Log.trace(i[j.getKeyField()]);
                groupKey = groupKey.concat(this.getUniqueKeyString(i[j.getKeyField()]));
            }
            // Log.trace(groupKey);
            if (retval.has(groupKey)) {
                let temp: any[] = retval.get(groupKey);
                temp.push(i);
                retval.set(groupKey, temp);
            } else {
                let temp: any[] = [];
                temp.push(i);
                retval.set(groupKey, temp);
            }

            // Log.trace(i);

        }
        // Log.trace(retval);
        return retval;
    }

    private getUniqueKeyString(field: any): string {
        if (field === undefined) {
            throw (new InsightError("Used a group key from the wrong type of dataset"));
        }
        let str: string = field.toString();
        let retVal: string = str.concat(str.length.toString());
        // Log.trace(str.concat(retVal));
        return retVal;
    }

    public setGroupFieldsOnObj(curObj: any, obj: any) {
        for (let i of this.groupKeys) {
            curObj[i.getKeyField()] = obj[i.getKeyField()];
        }
    }

    public addKeyIds(keyIds: IdString[]) {
        for (let i of this.groupKeys) {
            keyIds.push(i.getKeyIdClass());
        }
    }

    public getDatasetID(): string {
        for (let i of this.groupKeys) {
            return i.getKeyId();
        }
    }
}
