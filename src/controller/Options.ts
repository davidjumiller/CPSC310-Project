import {Columns} from "./Columns";
import {Key} from "./Key";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class Options {
    constructor(queryElement: any) {
        // Log.trace(queryElement);
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 2) {
            throw (new InsightError("More than 2 keys in Options"));
            // Log.trace("error in Options");
        }
        if (keys[0] === "COLUMNS") {
            // Log.trace(queryElement[keys[0]]);
            this.columns = new Columns(queryElement[keys[0]]);
        } else {
            throw (new InsightError("The first key in Options is not COLUMNS"));
            // Log.trace("bad Columns key in options");
        }

        // TODO make sure this works if someone inputs multiple orders
        // Make sure that there is an ORDER because its optional
        if (keys.length === 2) {
            if (keys[1] === "ORDER") {
                // Log.trace(keys[1]);
                let order: string = queryElement[keys[1]];
                this.key = new Key(order);
                // Log.trace(order);
            } else {
                throw (new InsightError("The second key in Options is not ORDER"));
            }
        }
        // else {
        //     this.key = new Key("courses_dept");
        // }
    }

    public columns: Columns;
    public key: Key;
}
