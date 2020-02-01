import Log from "../Util";

export class IdString {
    constructor(str: string) {
        // Log.trace(str);
        if (str.includes("_")) {
            // TODO throw an error invalid idString
            Log.trace("invalid idString");
        }
        this.idString = str;
        // Log.trace(this.idString);
    }

    public idString: string; // This cant have any "_"
}
