import {SKey} from "./SKey";
import {InputString} from "./InputString";
import Log from "../Util";

export class SComparison {
    constructor(queryElement: any) {
        Log.trace("sComp");
        // Log.trace(queryElement);
        // TODO implement
    }

    public sKey: SKey;
    public firstWild: boolean;
    public secondWild: boolean;
    public inputString: InputString;
}
