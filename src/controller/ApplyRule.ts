import {Key} from "./Key";
import {ApplyKey} from "./ApplyKey";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import Decimal from "decimal.js";

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

    public apply(value: any[]): number {
        switch (this.applyToken) {
            case "MAX":
                return this.max(value);
            case "MIN":
                return this.min(value);
            case "AVG":
                return this.avg(value);
            case "COUNT":
                return this.count(value);
            case "SUM":
                return this.sum(value);

        }
        return 0;
    }

    private sum(value: any[]) {
        let sum: Decimal = new Decimal(0);
        for (let i of value) {
            // sum += i[this.applyTokenKey.getKeyField()];
            sum = sum.add(new Decimal(i[this.applyTokenKey.getKeyField()]));
        }
        return Number(sum.toFixed(2));
    }

    private count(value: any[]): number {
        let uniqueValues: any[] = [];
        let count: number = 0;
        for (let i of value) {
            if (!uniqueValues.includes(i[this.applyTokenKey.getKeyField()])) {
                uniqueValues.push(i[this.applyTokenKey.getKeyField()]);
                count++;
            }
        }
        return count;
    }

    private avg(value: any[]): number {
        let total: Decimal = new Decimal(0);
        for (let i of value) {
            let temp: Decimal = new Decimal(i[this.applyTokenKey.getKeyField()]);
            total = total.add(temp);
            // Log.trace(total.toNumber());
        }
        return Number((total.toNumber() / value.length).toFixed(2));
    }

    private min(value: any[]): number {
        let min: number = value[0][this.applyTokenKey.getKeyField()];
        for (let i of value) {
            if (i[this.applyTokenKey.getKeyField()] < min) {
                min = i[this.applyTokenKey.getKeyField()];
            }
        }
        return Number(min);
    }

    private max(value: any[]): number {
        let max: number = value[0][this.applyTokenKey.getKeyField()];
        for (let i of value) {
            if (i[this.applyTokenKey.getKeyField()] > max) {
                max = i[this.applyTokenKey.getKeyField()];
            }
        }
        return Number(max);
    }
}
