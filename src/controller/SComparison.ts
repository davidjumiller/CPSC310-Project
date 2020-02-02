import {SKey} from "./SKey";
import {InputString} from "./InputString";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class SComparison {
    constructor(queryElement: any) {
        // Log.trace("sComp");
        // Log.trace(queryElement);

        let keys: string[] = Object.keys(queryElement);
        // Log.trace(keys);
        if (keys.length > 1) {
            throw (new InsightError("Too many keys in SComparison"));
            // Log.trace("error in SComparison");
        }

        this.sKey = new SKey(keys[0]);
        // Log.trace(queryElement[keys[0]]);
        let input: string = queryElement[keys[0]];
        if (input.charAt(0) === "*") {
            // Log.trace("first");
            this.firstWild = true;
            // Remove the first astrix
            input = input.slice(1);
        }
        if (input.charAt(input.length - 1) === "*") {
            // Log.trace("second");
            this.secondWild = true;
            input = input.slice(0, -1);
        }
        // Log.trace(input);

        if (input.includes("*")) {
            throw (new InsightError("Too many wildcards in SComparison"));
            // Log.trace("too many * in SComparison");
        }

        this.inputString = new InputString(input);
    }

    public sKey: SKey;
    public firstWild: boolean;
    public secondWild: boolean;
    public inputString: InputString;
}
