import {Key} from "./Key";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {AnyKey} from "./AnyKey";

export class Columns {
    public keys: AnyKey[];

    constructor(columnKeys: any[]) {
        this.keys = [];

        if (columnKeys.length === 0) {
            throw (new InsightError("No Column keys"));
            // Log.trace("error no column keys");
        }

        for (let i of columnKeys) {
            // Log.trace(i);
            this.keys.push(new Key(i));
        }
    }


}
