import {LogicComparison} from "./LogicComparison";
import {MComparison} from "./MComparison";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";

export class Filter {
    constructor(queryElement: any) {
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 1) {
            throw (new InsightError("Filter has more than one key"));
            // Log.trace("error in filter");
        }
        if (keys.length === 1) {
            switch (keys[0]) {
                case "AND":
                case "OR":
                    this.logicComparison = new LogicComparison(queryElement);
                    break;
                case "LT":
                case "GT":
                case "EQ":
                    this.mComparison = new MComparison(queryElement);
                    break;
                case "IS":
                    // Pretty sure this is what i want but gonna have to test
                    this.sComparison = new SComparison(queryElement[keys[0]]);
                    break;
                case "NOT":
                    this.negation = new Negation(queryElement[keys[0]]);
                    break;
                default:
                    throw (new InsightError("Invalid Filter"));
            }
        }
    }

    // If more than one of these is not undefined then this is not valid
    public logicComparison: LogicComparison;
    public mComparison: MComparison;
    public sComparison: SComparison;
    public negation: Negation;

}
