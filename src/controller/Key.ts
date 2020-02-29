import {MKey} from "./MKey";
import {SKey} from "./SKey";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class Key {
    constructor(key: string) {
        let strs: string[] = key.split("_");
        if (strs.length > 2) {
            throw (new InsightError("Invalid key"));
            // Log.trace("invalid key");
        }
        // TODO add room keys here
        if (strs[1] === "avg" || strs[1] === "pass" ||
            strs[1] === "fail" || strs[1] === "audit" || strs[1] === "year") {
            this.key = new MKey(key);
        } else {
            this.key = new SKey(key);
        }

    }

    // Changed this to have one singular key of either type
    public key: MKey | SKey;
}

// TODO after making this a child type of Apply key see if it is worth subtyping Mkey and Skey or will it be too much
