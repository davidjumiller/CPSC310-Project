import {IdString} from "./IdString";

export abstract class AnyKey {
    // constructor(keyString: string) {
    //     if (keyString.includes("_")) {
    //         this.key = new Key(keyString);
    //     } else {
    //         this.key = new ApplyKey(keyString);
    //     }
    // }

    // public key: Key | ApplyKey;

    public abstract getFullKeyString(): string;
    public abstract getKeyId(): string;
    public abstract getKeyField(): string;
    public abstract getKeyIdClass(): IdString; // This is needed in current query validation
}
