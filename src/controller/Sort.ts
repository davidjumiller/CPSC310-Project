import {AnyKey} from "./AnyKey";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {KeyFactory} from "./KeyFactory";
import {IdString} from "./IdString";

export class Sort {
    constructor(queryElement: any) {
        // Log.trace(queryElement);
        this.sortKeys = [];
        let queryElementKeys: string[] = Object.keys(queryElement);
        if (queryElementKeys[0] === "dir") {

            let dir: string = queryElement[queryElementKeys[0]];
            if (dir === "UP" || dir === "DOWN") {
                this.direction = dir;
            } else {
                throw (new InsightError("invalid Direction: " + dir));
            }

            let keys: string[] = queryElement[queryElementKeys[1]];
            if (keys.length === 0) {
                throw (new InsightError("sort has no keys"));
            } else {
                for (let str of keys) {
                    this.sortKeys.push(KeyFactory.generateKey(str));

                }
            }
        } else {
            this.sortKeys.push(KeyFactory.generateKey(queryElement));
        }
        // Log.trace(this.sortKeys);
    }

    public sort(elements: any[]) {
        // TODO the sort implementation for if there is a direction
        let sortBy: string = this.sortKeys[0].getFullKeyString();
        let sortDept: string = this.sortKeys[0].getKeyId() + "_dept";
        elements.sort(function (a: any, b: any) {
            if (a[sortBy] < b[sortBy]) {
                return -1;
            }
            if (a[sortBy] > b[sortBy]) {
                return 1;
            }
            if (a[sortBy] === b[sortBy]) {
                if (a[sortDept] < b[sortDept]) {
                    return 1;
                }
                if (a[sortDept] > b[sortDept]) {
                    return -1;
                }
            }
            return 0;
        });
    }

    public direction: string; // either UP or DOWN or NULL
    public sortKeys: AnyKey[]; // can be one or more but if there is no direction it can only be one.
    public pushAllIdClasses(ids: IdString[])  {
        for (let i of this.sortKeys) {
            ids.push(i.getKeyIdClass());
        }
    }
}
