import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";

export class Query {
    public body: Body;
    public options: Options;

    constructor(query: any) {
        for (let i in query) {
            // Log.trace(query[i]);
            switch ( i ) {
                case "WHERE":
                    Log.trace("body added");
                    this.body = new Body(query[i]);
                    break;
                case "OPTIONS":
                    Log.trace("options added");
                    this.options = new Options(query[i]);
                    break;
                default:
                    Log.trace("invalid query at query stage");
                    // TODO how do we want to set a query to invalid
                    break;
            }
        }
    }
}
