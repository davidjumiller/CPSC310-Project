import {MKey} from "./MKey";
import {SKey} from "./SKey";
import Log from "../Util";

export class Key {
    constructor(key: string) {
        // TODO this should throw any errors thrown by MKey or SKey
        let strs: string[] = key.split("_");
        if (strs.length > 2) {
            // TODO thrown an error because the key is invalid;
            Log.trace("invalid key");
        }
        if (strs[1] === "avg" || strs[1] === "pass" ||
            strs[1] === "fail" || strs[1] === "audit" || strs[1] === "year") {
            this.mKey = new MKey(key);
        } else {
            this.sKey = new SKey(key);
        }

    }

    public mKey: MKey;
    public sKey: SKey;
}
