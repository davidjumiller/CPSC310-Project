import {Columns} from "./Columns";
import {Key} from "./Key";
import Log from "../Util";

export class Options {
    constructor(queryElement: any) {
        // Log.trace(queryElement);
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 2) {
            // TODO throw an error there is more than one key in the LogicComparisonr
            Log.trace("error in Options");
        }
        if (keys[0] === "COLUMNS") {
            // Log.trace(queryElement[keys[0]]);
            this.columns = new Columns(queryElement[keys[0]]);
        } else {
            // TODO throw an error because first key is wrong in Options
            Log.trace("bad Columns key in options");
        }

        // TODO make sure this works if someone inputs multiple orders
        if ( keys[1] === "ORDER") {
            // Log.trace(keys[1]);
            let order: string = queryElement[keys[1]];
            this.key = new Key(order);
            // Log.trace(order);

        }


        // TODO implement
    }

    public columns: Columns;
    public key: Key;
}
