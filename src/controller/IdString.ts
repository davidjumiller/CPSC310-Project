import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class IdString {
    constructor(str: string) {
        if (str.includes("_")) {
            throw (new InsightError("Invalid IDString"));
        }
        this.idString = str;
    }

    public idString: string; // This cant have any "_"
}
