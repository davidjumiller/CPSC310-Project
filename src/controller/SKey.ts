import {IdString} from "./IdString";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

enum SField {
    dept = 0,
    id = 1,
    instructor = 2,
    title = 3,
    uuid = 4,
}

export class SKey {
    constructor(sKey: string) {
        let strs: string[] = sKey.split("_");
        if (strs.length > 2) {
            throw (new InsightError("Invalid SKey"));
        }
        this.idString = new IdString(strs[0]);


        // TODO add new keys for Rooms
        // Set the sField
        switch (strs[1]) {
            case "dept":
                this.field = "dept";
                break;
            case "id":
                this.field = "id";
                break;
            case "instructor":
                this.field = "instructor";
                break;
            case "title":
                this.field = "title";
                break;
            case "uuid":
                this.field = "uuid";
                break;
            default:
                throw( new InsightError("Invalid Skey"));
                break;
        }
    }

    public idString: IdString;
    public field: string;
}
