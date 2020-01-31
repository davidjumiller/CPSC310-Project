import {LogicComparison} from "./LogicComparison";
import {MComparison} from "./MComparison";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";

export class Filter {
    // If more than one of these is not undefined then this is not valid
    public logicComparison: LogicComparison;
    public mComparison: MComparison;
    public sComparison: SComparison;
    public negation: Negation;

}
