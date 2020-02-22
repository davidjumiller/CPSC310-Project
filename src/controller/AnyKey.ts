import {Key} from "./Key";
import {ApplyKey} from "./ApplyKey";

export class AnyKey {
    constructor(keyString: string) {
        if (keyString.includes("_")) {
            this.key = new Key(keyString);
        } else {
            this.key = new ApplyKey(keyString);
        }
    }

    // TODO implement constructor
    public key: Key | ApplyKey;
}
