import {Key} from "./Key";
import Log from "../Util";

export class Columns {

    public keys: Key[];

    constructor(columnKeys: any[]) {
        this.keys = [];
        // TODO might have to check for a final ","

        if (columnKeys.length === 0) {
            // TODO thrown an error because there is no columns keys
            Log.trace("error no column keys");
        }

        for (let i of columnKeys) {
            // Log.trace(i);
            this.keys.push(new Key(i));
        }
    }


}
