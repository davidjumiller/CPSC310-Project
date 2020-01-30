import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";

export class Query {
    public body: Body;
    public options: Options;

    constructor(query: any) {
        for (let i in query) {
            Log.trace(query[i]);
            switch ( i ) {
                case "WHERE":
                    this.body = new Body(query[i]);

            }
        }
    }
}
