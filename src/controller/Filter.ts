import {LogicComparison} from "./LogicComparison";
import {MComparison} from "./MComparison";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";
import Log from "../Util";

export class Filter {
    constructor(queryElement: any) {
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 1) {
            // TODO throw an error there is more than one key in the filter
            Log.trace("error in filter");
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
                    // TODO throw an error invalid filter
            }
        }
    }

    // If more than one of these is not undefined then this is not valid
    public logicComparison: LogicComparison;
    public mComparison: MComparison;
    public sComparison: SComparison;
    public negation: Negation;

}
