import {InsightError} from "./IInsightFacade";

export class ApplyKey {
    constructor(keyString: string) {
        if (keyString.includes("_")) {
            throw (new InsightError("Apply keys can't contain '_'"));
        } else {
            this.key = keyString;
        }
    }

    public key: string; // can't have and underscore
}
