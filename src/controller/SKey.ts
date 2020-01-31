import {IdString} from "./IdString";

enum SField {
    dept = 0,
    id = 1,
    instructor = 2,
    title = 3,
    uuid = 4,
}

export class SKey {
    public idString: IdString;
    public sField: SField;
}
