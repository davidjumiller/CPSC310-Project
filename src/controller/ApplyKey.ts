import {InsightError} from "./IInsightFacade";
import {AnyKey} from "./AnyKey";
import {IdString} from "./IdString";

export class ApplyKey extends AnyKey {
    constructor(keyString: string, addedApplyRuleKeys: string[]) {
        super();
        if (addedApplyRuleKeys && addedApplyRuleKeys.includes(keyString)) {
            throw( new InsightError("Duplicate Apply Key " + keyString));
        }
        if (keyString.includes("_")) {
            throw (new InsightError("Apply keys can't contain '_'"));
        } else {
            this.key = keyString;
            if (addedApplyRuleKeys) {
                addedApplyRuleKeys.push(keyString);
            }
        }
    }

    private readonly key: string; // can't have and underscore.

    public getFullKeyString(): string {
        return this.key;
    }

    public getKeyField(): string {
        return this.key;
    }

    public getKeyId(): string {
        return undefined;
    }

    public getKeyIdClass(): IdString {
        return undefined;
    }
}
