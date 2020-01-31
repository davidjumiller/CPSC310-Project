import {IdString} from "./IdString";

enum MField {
    avg = 0,
    pass = 1,
    fail = 2,
    audit = 3,
    year = 4,
}

export class MKey {
    public idString: IdString;
    public mField: MField;
}
