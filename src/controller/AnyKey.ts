import {IdString} from "./IdString";

export abstract class AnyKey {

    public abstract getFullKeyString(): string;
    public abstract getKeyId(): string;
    public abstract getKeyField(): string;
    public abstract getKeyIdClass(): IdString; // This is needed in current query validation
}
