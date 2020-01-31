import {MKey} from "./MKey";

enum MComparator {
    LT = 0,
    GT = 1,
    EQ = 2,
}

export class MComparison {
    public mComparator: MComparator;
    public mKey: MKey;
    public num: number;
}
