import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";

export class Query {
    public body: Body;
    public options: Options;

    constructor(query: any) {
        // This feels silly im sure ill think of a way to do this not in a loop.
        let inum: number = 0;
        for (let i in query) {
            // Log.trace(query[i]);
            if (inum === 0) {
                if (i === "WHERE") {
                    // Log.trace("body added");
                    this.body = new Body(query[i]);
                    // Log.trace(query[i]);
                } else {
                    // TODO throw error
                }
            } else if (inum === 1) {
                if (i === "OPTIONS") {
                    // Log.trace("options added");
                    this.options = new Options(query[i]);
                    // Log.trace(query[i]);
                } else {
                    Log.trace("error in query const");
                    // TODO throw error
                }
            } else {
                Log.trace("error in query const");
                // TODO throw error
            }
            inum++;
            // switch ( i ) {
            //     case "WHERE":
            //         Log.trace("body added");
            //         this.body = new Body(query[i]);
            //         break;
            //     case "OPTIONS":
            //         Log.trace("options added");
            //         this.options = new Options(query[i]);
            //         break;
            //     default:
            //         Log.trace("invalid query at query stage");
            //         // TODO how do we want to set a query to invalid
            //         break;
            // }
        }
    }
}
