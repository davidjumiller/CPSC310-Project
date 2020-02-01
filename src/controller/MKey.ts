import {IdString} from "./IdString";
import Log from "../Util";

enum MField {
    avg = 0,
    pass = 1,
    fail = 2,
    audit = 3,
    year = 4,
}

export class MKey {
    constructor(mkey: string) {
        Log.trace(mkey);
        let strs: string[] = mkey.split("_");
        if (strs.length > 2) {
            // TODO thrown an error because invalid MKey
            Log.trace("invalid MKey");
        }
        // Set the mField
        switch (strs[1]) {
            case "avg":
                this.mField = MField.avg;
                break;
            case "pass":
                this.mField = MField.pass;
                break;
            case "fail":
                this.mField = MField.fail;
                break;
            case "audit":
                this.mField = MField.audit;
                break;
            case "year":
                this.mField = MField.year;
                break;
            default:
                Log.trace("invalid MKey");
                // TODO thrown an error because invalid MKey
                break;
        }

        // Set the IDString
        this.idString = new IdString(strs[0]);
    }

    public idString: IdString;
    public mField: MField;
}
