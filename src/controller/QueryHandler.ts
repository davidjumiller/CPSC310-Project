import {Options} from "./Options";
import {Query} from "./Query";
import {Section} from "./Section";
import {Dataset} from "./Dataset";
import {Logic, LogicComparison} from "./LogicComparison";
import {MComparison} from "./MComparison";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";
import {Filter} from "./Filter";
import {InsightError} from "./IInsightFacade";

export class QueryHandler {

    public static parseQuery(query: any): Query {
        let q: Query = new Query(query);
        // Log.trace("foo");
        // Log.trace(q);
        return q;
    }

    public static validQuery(parsedQuery: Query): boolean {
        return true;
    }

    public static executeBody(query: Query, datasets: Dataset[]): Section[] {
        let retval: Section[] = [];
        let activeDataset: Dataset;
        for (let i of datasets) {
            if (i.isd.id === query.datasetID) {
                activeDataset = i;
            }
        }
        if (!activeDataset) {
            // TODO figure out which exception to throw here based off of Spec
            throw (new InsightError("queried dataset is not loaded"));
        }
        // Log.trace(activeDataset.sections);
        for (let section of activeDataset.sections) {
            if (QueryHandler.matchesFilter(query.body.filter, section)) {
                retval.push(section);
            }
            // TODO check if the section meets the query
        }
        return retval;
    }

    public static executeOptions(options:  Options): string[] {
        return [];
    }

    public static filterWithOptions(selectedSections: Section[], selectedFields: string[]): any[] {
        return [];
    }

    private static matchesQueryLogicComp(logicComparison: LogicComparison, section: Section): boolean {
        //  If its for an AND fail once one is false and pass if none are false
        //  If its or pass as soon as one is true and fail if none are true
        let sectionResult: boolean;
        for ( let i of logicComparison.filters) {
            sectionResult = QueryHandler.matchesFilter(i, section);
            if (logicComparison.logic === Logic.AND) {
                if (!sectionResult) {
                    // If the logic is an AND then fail if any section is false
                    return false;
                }
            } else {
                if (sectionResult) {
                    // If the logic isn't AND then it must be OR so return true if any of the sections is true
                    return true;
                }
            }
        }
        return false;
    }


    private static matchesQueryMComparison(mComparison: MComparison, section: Section): boolean {

        // TODO switch on mComarator and do right thing
        // Below if is wrong look prev line
        if (section[mComparison.mKey.mField] === mComparison.num) {
            return true;
        } else {
            return false;
        }
    }

    private static matchesQuerySComparison(sComparison: SComparison, section: Section): boolean {
        // TODO implement
        return false;
    }

    private static matchesQueryNegation(negation: Negation, section: Section): boolean {
        return !QueryHandler.matchesFilter(negation.filter, section);
    }

    private static matchesFilter(filter: Filter, section: Section): boolean {
        if (filter.logicComparison) {
            return QueryHandler.matchesQueryLogicComp(filter.logicComparison, section);
        } else if (filter.mComparison) {
            return QueryHandler.matchesQueryMComparison(filter.mComparison, section);
        } else if (filter.sComparison) {
            return QueryHandler.matchesQuerySComparison(filter.sComparison, section);
        } else if (filter.negation) {
            return QueryHandler.matchesQueryNegation(filter.negation, section);
        }
        // Validation up to this point will have already thrown an error if this is the case
        return false;
    }
}
