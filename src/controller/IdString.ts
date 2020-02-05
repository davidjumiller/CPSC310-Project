import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class IdString {
    constructor(str: string) {
        // Log.trace(str);
        if (str.includes("_")) {
            throw (new InsightError("Invalid IDString"));
            // Log.trace("invalid idString");
        }
        this.idString = str;
        // Log.trace(this.idString);
    }

    public idString: string; // This cant have any "_"
}
