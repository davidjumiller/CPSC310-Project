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
        // Log.trace("mComp" );
        // Log.trace(queryElement);
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 1) {
            throw (new InsightError("too many keys in MComparison"));
            // Log.trace("error in MComparison");
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
                // Log.trace("invalid Mcomparator");
                throw (new InsightError("Invalid MComparator"));
        }

        let mkeyNumPair: any = queryElement[keys[0]];
        // Log.trace(mkeyNumPair);

        let mKeys: string[] = Object.keys(mkeyNumPair);
        if (mKeys.length > 1) {
            throw (new InsightError("Too many MKey's in MComparison"));
            // Log.trace("error in MComparison");
        }
        this.mKey = new MKey(mKeys[0]);
        if (typeof mkeyNumPair[mKeys[0]] === "number") {
            this.num = mkeyNumPair[mKeys[0]];
        }
    }

    public mComparator: MComparator;
    public mKey: MKey;
    public num: number;
}
