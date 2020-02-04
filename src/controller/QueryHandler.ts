import {Options} from "./Options";
import {Query} from "./Query";
import {Section} from "./Section";
import {Dataset} from "./Dataset";
import {Logic, LogicComparison} from "./LogicComparison";
import {MComparison} from "./MComparison";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";
import {Filter} from "./Filter";
import {Key} from "./Key";
import {SKey} from "./SKey";
import {MKey} from "./MKey";
import {Columns} from "./Columns";
import {InsightError} from "./IInsightFacade";
import { IdString } from "./IdString";
import Log from "../Util";

export class QueryHandler {

    public static parseQuery(query: any): Query {
        let q: Query = new Query(query);
        // Log.trace("foo");
        // Log.trace(q);
        return q;
    }

    public static validQuery(parsedQuery: Query): boolean {
        // hack for now by Alex
        return true;
        // Should work for now, .key.key probably need to be changed
        let key: SKey | MKey = parsedQuery.options.key.key;
        let columnKeys: Key[] = parsedQuery.options.columns.keys;
        let validKey = false;

        // Checks for if 'Order': key is in columns
        for (let i in columnKeys) {
            if (columnKeys[i].key === key) {
                validKey = true;
                break;
            }
        }
        if (!validKey) {
            return false;
        }

        // Checks if Query is referencing more than one dataset
        // This part looks recursively looks for Key IdStrings and pushes them to keyIds
        let keyIds: IdString[] = [];
        this.findBodyKeyIds(keyIds, parsedQuery.body.filter);
        this.findOptionsKeyIds(keyIds, parsedQuery.options);

        // Every Id in keyIds should be the exact same
        for (let i in keyIds) {
            if (keyIds[0].idString !== keyIds[i].idString) {
                return false;
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
                retval.push(section);
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
        for (let section of selectedSections) {
            let curObj: any [];
            // {avgtst_avg: sdfsd,
            //     avgtst_dept: sdfsdf,
            // }
            for ( let i in section) {
                Log.trace(i);
                // TODO check if the current key is any of the keys in options.columns
                //  then add that keys value to curObj in the correct field
            }
            retval.push(curObj);
        }
        // TODO sort retval on options.key if there is one
        return retval;
    }

    private static findBodyKeyIds(ids: &IdString[], filter: Filter) {
        // Note: filter should not be valid if there is more than one of these, but this function does not check this
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

    private static findOptionsKeyIds(ids: &IdString[], options: Options) {
        for (let i in options.columns.keys) {
            ids.push(options.columns.keys[i].key.idString);
        }
        ids.push(options.key.key.idString);
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
