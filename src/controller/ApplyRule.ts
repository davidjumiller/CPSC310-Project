import {Key} from "./Key";
import {ApplyKey} from "./ApplyKey";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class ApplyRule {
    constructor(rule: any) {
        let applyKeyTemp: any[] = Object.keys(rule);
        if (applyKeyTemp.length > 1) {
            throw (new InsightError("Invalid apply key"));
        }
        this.applyKey = new ApplyKey(applyKeyTemp[0]);
        let applyTokenKeys: any[] = Object.keys(rule[applyKeyTemp[0]]);

        if (applyTokenKeys.length !== 1) {
            throw (new InsightError("Invalid apply Token"));
        }

        let applyTokenTemp: string = applyTokenKeys[0];
        let allowedTokens: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
        if (allowedTokens.includes(applyTokenTemp)) {
            this.applyToken = applyTokenTemp;
        } else {
            throw (new InsightError("Invalid apply token"));
        }
        let applyTokenKeyTemp: string = rule[applyKeyTemp[0]][applyTokenTemp];
        this.applyTokenKey = new Key(applyTokenKeyTemp);
    }

    public applyKey: ApplyKey; // this can't have underscores
    public applyToken: string; // must be MAX, MIN, AVG, COUNT, or SUM
    public applyTokenKey: Key;
}
