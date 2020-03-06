import {SKey} from "./SKey";
import {InputString} from "./InputString";
import {InsightError} from "./IInsightFacade";

export class SComparison {
    constructor(queryElement: any) {

        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 1) {
            throw (new InsightError("Too many keys in SComparison"));
        }

        if (keys.length === 0) {
            throw( new InsightError("Scomparison is empty"));
        }

        this.sKey = new SKey(keys[0]);
        if (typeof queryElement[keys[0]] !== "string") {
            throw (new InsightError("Scomparison was not given a string"));
        }
        let input: string = queryElement[keys[0]];
        if (input.charAt(0) === "*") {
            this.firstWild = true;
            // Remove the first astrix
            input = input.slice(1);
        }
        if (input.charAt(input.length - 1) === "*") {
            this.secondWild = true;
            input = input.slice(0, -1);
        }

        if (input.includes("*")) {
            throw (new InsightError("Too many wildcards in SComparison"));
        }

        this.inputString = new InputString(input);
    }

    public sKey: SKey;
    public firstWild: boolean;
    public secondWild: boolean;
    public inputString: InputString;
}
