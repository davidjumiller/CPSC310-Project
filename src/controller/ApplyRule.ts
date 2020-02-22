import {Key} from "./Key";
import {ApplyKey} from "./ApplyKey";

export class ApplyRule {
    // TODO implement constructor
    public applyKey: ApplyKey; // this can't have underscores
    public applyToken: string; // must be MAX, MIN, AVG, COUNT, or SUM
    public applyTokenKey: Key;
}
