import {IdString} from "./IdString";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

// enum MField {
//     avg = 0,
//     pass = 1,
//     fail = 2,
//     audit = 3,
//     year = 4,
// }

export class MKey {
    constructor(mkey: string) {
        // Log.trace(mkey);
        let strs: string[] = mkey.split("_");
        if (strs.length > 2) {
            throw (new InsightError("Invalid MKey"));
            // Log.trace("invalid MKey");
        }
        // Set the mField
        switch (strs[1]) {
            case "avg":
                this.mField = "avg";
                break;
            case "pass":
                this.mField = "pass";
                break;
            case "fail":
                this.mField = "fail";
                break;
            case "audit":
                this.mField = "audit";
                break;
            case "year":
                this.mField = "year";
                break;
            default:
                // Log.trace("invalid MKey");
                throw (new InsightError("Invalid MKey"));
                break;
        }

        // Set the IDString
        this.idString = new IdString(strs[0]);
    }

    public idString: IdString;
    public mField: string;
}
