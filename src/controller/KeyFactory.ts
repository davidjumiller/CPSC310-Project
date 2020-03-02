import {Key} from "./Key";
import {ApplyKey} from "./ApplyKey";
import {AnyKey} from "./AnyKey";

export class KeyFactory {
    public static generateKey(str: string): AnyKey {
        if (str.includes("_")) {
            return new Key(str);
        } else {
            return new ApplyKey(str);
        }
    }
}
