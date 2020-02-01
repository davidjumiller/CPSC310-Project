import {IdString} from "./IdString";
import Log from "../Util";

enum SField {
    dept = 0,
    id = 1,
    instructor = 2,
    title = 3,
    uuid = 4,
}

export class SKey {
    constructor(sKey: string) {
        // Log.trace("in Skey");
        let strs: string[] = sKey.split("_");
        if (strs.length > 2) {
            Log.trace("invalid SKey");
            // TODO thrown an error because invalid SKey
        }
        this.idString = new IdString(strs[0]);


        // Set the sField
        switch (strs[1]) {
            case "dept":
                this.sField = SField.dept;
                break;
            case "id":
                this.sField = SField.id;
                break;
            case "instructor":
                this.sField = SField.instructor;
                break;
            case "title":
                this.sField = SField.title;
                break;
            case "uuid":
                this.sField = SField.uuid;
                break;
            default:
                Log.trace("invalid SKey");
                // TODO thrown an error because invalid SKey
                break;
        }
    }

    public idString: IdString;
    public sField: SField;
}
