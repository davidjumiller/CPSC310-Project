import {MKey} from "./MKey";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export enum MComparator {
    LT = 0,
    GT = 1,
    EQ = 2,
}

export class MComparison {
    constructor(queryElement: any) {
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 1) {
            throw (new InsightError("too many keys in MComparison"));
        }
        if (keys.length === 0) {
            throw  (new InsightError("Mcomparison is empty"));
        }

        // Figure out which MComparator is used
        switch (keys[0]) {
            case "LT":
                this.mComparator = MComparator.LT;
                break;
            case "GT":
                this.mComparator = MComparator.GT;
                break;
            case "EQ":
                this.mComparator = MComparator.EQ;
                break;
            default:
                throw (new InsightError("Invalid MComparator"));
        }

        let mkeyNumPair: any = queryElement[keys[0]];

        let mKeys: string[] = Object.keys(mkeyNumPair);
        if (mKeys.length > 1) {
            throw (new InsightError("Too many MKey's in MComparison"));
        }
        // Make sure that the MComarison isn't empty
        if (mKeys.length === 0) {
            throw (new InsightError("there are no keys in Mcomparator"));
        }
        this.mKey = new MKey(mKeys[0]);
        if (typeof mkeyNumPair[mKeys[0]] === "number") {
            this.num = mkeyNumPair[mKeys[0]];
        } else {
            throw (new InsightError("Mcomparator was not given a number"));
        }
    }

    public mComparator: MComparator;
    public mKey: MKey;
    public num: number;
}
