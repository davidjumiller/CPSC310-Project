import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class InputString {
    constructor(input: string) {
        if (input.includes("*")) {
            // Log.trace("invalid InputString");
            throw (new InsightError("Invalid InputString"));
        }
        this.inputString = input;
    }

    public inputString: string; // This can't have any "*"
}
