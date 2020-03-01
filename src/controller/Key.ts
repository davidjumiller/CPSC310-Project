import {MKey} from "./MKey";
import {SKey} from "./SKey";
import {InsightError} from "./IInsightFacade";
import {AnyKey} from "./AnyKey";
import {IdString} from "./IdString";

export class Key extends AnyKey {
    constructor(key: string) {
        super();
        let strs: string[] = key.split("_");
        if (strs.length > 2) {
            throw (new InsightError("Invalid key"));
        }
        // TODO figure out how to handle the fact that "allowedKeys" should be split based on Database Type
        let allowedMkeys: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        // if (strs[1] === "avg" || strs[1] === "pass" ||
        //     strs[1] === "fail" || strs[1] === "audit" || strs[1] === "year")
        if (allowedMkeys.includes( strs[1])) {
            this.key = new MKey(key);
        } else {
            this.key = new SKey(key);
        }

    }

    // Changed this to have one singular key of either type
    public key: MKey | SKey;

    public getFullKeyString(): string {
        return this.key.idString.idString + "_" + this.key.field; // Still smells but ill fix later
    }

    public getKeyField(): string {
        return this.key.field; // Still smells but ill fix later
    }

    public getKeyId(): string {
        return this.key.idString.idString; // Still smells but ill fix later
    }

    public getKeyIdClass(): IdString {
        return this.key.idString;
    }
}
