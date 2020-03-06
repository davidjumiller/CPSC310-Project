import {InsightError} from "./IInsightFacade";
import {AnyKey} from "./AnyKey";
import {KeyFactory} from "./KeyFactory";

export class Columns {
    public keys: AnyKey[];

    constructor(columnKeys: any[]) {
        this.keys = [];

        if (columnKeys.length === 0) {
            throw (new InsightError("No Column keys"));
        }

        for (let i of columnKeys) {
            this.keys.push(KeyFactory.generateKey(i));

        }
    }


}
