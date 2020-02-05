import {Options} from "./Options";
import {Query} from "./Query";
import {Section} from "./Section";
import {Dataset} from "./Dataset";
import {Logic, LogicComparison} from "./LogicComparison";
import {MComparator, MComparison} from "./MComparison";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";
import {Filter} from "./Filter";
import {Key} from "./Key";
import {SKey} from "./SKey";
import {MKey} from "./MKey";
import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import {IdString} from "./IdString";
import Log from "../Util";

export class QueryHandler {

    public static parseQuery(query: any): Query {
        let q: Query = new Query(query);
        // Log.trace("foo");
        // Log.trace(q);
        return q;
    }

    public static validQuery(parsedQuery: Query): boolean {
        // Should work for now, .key.key probably need to be changed

        // TODO this should thrown an InsightError when its not valid to describe why it failed and then this
        //  will no longer need to return a bool at all
        let key: SKey | MKey ;
        // Make sure that there in an Order before setting key (rename)
        if (parsedQuery.options.key) {
            key =  parsedQuery.options.key.key;
        }
        let columnKeys: Key[] = parsedQuery.options.columns.keys;
        // Not sure if there is an Order key yet so set to true by default
        let validKey = true;

        // Make sure that there is an order key
        if (key) {
            // If there is an order key then set valid key to false by default
            validKey = false;
            // Checks for if 'Order': key is in columns
            for (let i in columnKeys) {
                if (columnKeys[i].key.field === key.field) {
                    validKey = true;
                    break;
                }
            }
        }
        if (!validKey) {
            throw (new InsightError("Order key is not in Columns"));
            // return false;
        }

        // Checks if Query is referencing more than one dataset
        // This part looks recursively looks for Key IdStrings and pushes them to keyIds
        let keyIds: IdString[] = [];
        this.findBodyKeyIds(keyIds, parsedQuery.body.filter);
        this.findOptionsKeyIds(keyIds, parsedQuery.options);

        // Every Id in keyIds should be the exact same
        for (let i in keyIds) {
            if (keyIds[0].idString !== keyIds[i].idString) {
                throw (new InsightError("Query references multiple datasets"));
                // return false;
            }
        }
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
                // Log.trace("yay matches");
                retval.push(section);
                // Make sure that there aren't too many matching sections
                if (retval.length > 5000) {
                    throw (new ResultTooLargeError("over 5000 sections match this query"));
                }
            }
            // TODO check if the section meets the query
        }

        return retval;
    }


    // TODO delete this method because its not needed. Columns already has all the info we need
    // public static executeOptions(options:  Options): string[] {
    //     return [];
    // }

    public static filterWithOptions(selectedSections: Section[], options: Options): any[] {
        let retval: any[] = [];
        // Log.trace(options);

        let foo: any = {};

        for (let section of selectedSections) {
            let curObj: any = {};
            for (let i of options.columns.keys) {
                // This adds a key:value pair to the curObj
                curObj[i.key.idString.idString + "_" + i.key.field] = section[i.key.field];
            }
            retval.push(curObj);
        }

        if (options.key) {
            let sortBy: string = options.key.key.idString.idString + "_" + options.key.key.field;
            let sortDept: string = options.key.key.idString.idString + "_dept";
            retval.sort(function (a: any, b: any) {
                if (a[sortBy] < b[sortBy]) {
                    return -1;
                }
                if (a[sortBy] > b[sortBy]) {
                    return 1;
                }
                if (a[sortBy] === b[sortBy]) {
                    if (a[sortDept] < b[sortDept]) {
                        return 1;
                    }
                    if (a[sortDept] > b[sortDept]) {
                        return -1;
                    }
                }
                return 0;
            });
        }
        return retval;
    }

    private static findBodyKeyIds(ids: &IdString[], filter: Filter) {
        if (filter) {
            // Note: filter should not be valid if there is more than one of these,
            // but this function does not check this
            if (filter.logicComparison !== undefined) {
                for (let i in filter.logicComparison.filters) {
                    this.findBodyKeyIds(ids, filter.logicComparison.filters[i]);
                }
            }
            if (filter.mComparison !== undefined) {
                ids.push(filter.mComparison.mKey.idString);
            }
            if (filter.sComparison !== undefined) {
                ids.push(filter.sComparison.sKey.idString);
            }
            if (filter.negation !== undefined) {
                this.findBodyKeyIds(ids, filter.negation.filter);
            }
        }
    }

    private static findOptionsKeyIds(ids: &IdString[], options: Options) {
        for (let i in options.columns.keys) {
            ids.push(options.columns.keys[i].key.idString);
        }
        // Make sure that there is an ORDER key
        if (options.key) {
            ids.push(options.key.key.idString);
        }
    }

    private static matchesQueryLogicComp(logicComparison: LogicComparison, section: Section): boolean {
        //  If its for an AND fail once one is false and pass if none are false
        //  If its or pass as soon as one is true and fail if none are true
        let sectionResult: boolean;
        for ( let i of logicComparison.filters) {
            // Log.trace("in Logic loop");
            // Log.trace(i);
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
        if (logicComparison.logic === Logic.AND) {
            return true;
        } else {
            return false;
        }

    }


    private static matchesQueryMComparison(mComparison: MComparison, section: Section): boolean {
        switch (mComparison.mComparator) {
            case MComparator.EQ:
                return section[mComparison.mKey.field] === mComparison.num;
            case MComparator.GT:
                return section[mComparison.mKey.field] > mComparison.num;
            case MComparator.LT:
                return section[mComparison.mKey.field] < mComparison.num;
            default:
                throw (new InsightError("invalid MComparator"));
        }
    }

    private static matchesQuerySComparison(sComparison: SComparison, section: Section): boolean {
        if (sComparison.firstWild && !sComparison.secondWild) {
            return section[sComparison.sKey.field].endsWith(sComparison.inputString.inputString);
        }
        if (!sComparison.firstWild && sComparison.secondWild) {
            return section[sComparison.sKey.field].startsWith(sComparison.inputString.inputString);
        }
        if (sComparison.firstWild && sComparison.secondWild) {
            return section[sComparison.sKey.field].includes(sComparison.inputString.inputString);
        }
        // If none of the above are hit then there are no wildcards and the sections string must equal the query input
        return section[sComparison.sKey.field] === sComparison.inputString.inputString;
    }

    private static matchesQueryNegation(negation: Negation, section: Section): boolean {
        return !QueryHandler.matchesFilter(negation.filter, section);
    }

    private static matchesFilter(filter: Filter, section: Section): boolean {
        if (!filter) {
            return true;
        }
        // Log.trace(filter);
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
