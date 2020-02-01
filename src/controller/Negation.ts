import {Filter} from "./Filter";
import Log from "../Util";

export class Negation {
    constructor(queryElement: any) {
        let keys: string[] = Object.keys(queryElement);
        // if the body has more than one key then it is not a valid query
        if (keys.length > 1) {
            // TODO throw an error there is more than just a filter in the NOT
            Log.trace("error in body");
        }
        if (keys.length === 1) {
            this.filter = new Filter(queryElement);
        } else {
            Log.trace("invalid NOT");
            // TODO thrown an error invalid NOT
        }
    }

    public filter: Filter;
}
