import {Options} from "./Options";
import {Query} from "./Query";
import {Section} from "./Section";
import {Dataset} from "./Dataset";
import {Logic, LogicComparison} from "./LogicComparison";
import {MComparator, MComparison} from "./MComparison";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";
import {Filter} from "./Filter";
import {InsightDatasetKind, InsightError, ResultTooLargeError} from "./IInsightFacade";
import {IdString} from "./IdString";

export class QueryHandler {

    public static parseQuery(query: any): Query {
        let q: Query = new Query(query);
        // Log.trace("foo");
        // Log.trace(q);
        return q;
    }

    public static validQuery(parsedQuery: Query): boolean {

        let keyIds: IdString[] = [];
        parsedQuery.options.checkAllSortKeysAreInColumns();

        if (parsedQuery.transformation) {
            parsedQuery.transformation.isValid(parsedQuery.options.columns.keys);
            parsedQuery.transformation.addKeyIds(keyIds);
        }

        // Checks if Query is referencing more than one dataset
        // This part looks recursively looks for Key IdStrings and pushes them to keyIds

        this.findBodyKeyIds(keyIds, parsedQuery.body.filter);
        this.findOptionsKeyIds(keyIds, parsedQuery.options);

        let referenceIdString: string;

        for (let i in keyIds) {
            if (keyIds[i]) {
                referenceIdString = keyIds[i].idString;
                break;
            }
        }

        // Every Id in keyIds should be the exact same
        for (let i in keyIds) {
            if (!keyIds[i] && !parsedQuery.transformation) {
                throw (new InsightError("Invalid keys"));
            }
            // KeyIds can have NULL elements because of AnyKeys
            if (keyIds[i]) {
                if (referenceIdString !== keyIds[i].idString) {
                    throw (new InsightError("Query references multiple datasets"));
                    // return false;
                }
            }
        }

        // Old logic
        // // Every Id in keyIds should be the exact same
        // for (let i in keyIds) {
        //     if (keyIds[0].idString !== keyIds[i].idString) {
        //         throw (new InsightError("Query references multiple datasets"));
        //         // return false;
        //     }
        // }
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
            throw (new InsightError("queried dataset is not loaded"));
        }
        // Log.trace(activeDataset.sections);
        for (let section of activeDataset.sections) {
            if (QueryHandler.matchesFilter(query.body.filter, section, activeDataset.isd.kind)) {
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


    public static filterWithOptions(selectedSections: Section[], options: Options): any[] {
        let retval: any[] = [];
        // Log.trace(options);

        let foo: any = {};

        for (let section of selectedSections) {
            let curObj: any = {};
            for (let i of options.columns.keys) {
                // This adds a key:value pair to the curObj
                curObj[i.getFullKeyString()] = section[i.getKeyField()];
            }
            retval.push(curObj);
        }

        options.doSort(retval);
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
            ids.push(options.columns.keys[i].getKeyIdClass());
        }

        if (options.sortOrder) {
            options.sortOrder.pushAllIdClasses(ids);
        }
    }

    private static matchesQueryLogicComp(logicComparison: LogicComparison, section: Section, kind: InsightDatasetKind):
        boolean {
        //  If its for an AND fail once one is false and pass if none are false
        //  If its or pass as soon as one is true and fail if none are true
        let sectionResult: boolean;
        for ( let i of logicComparison.filters) {
            sectionResult = QueryHandler.matchesFilter(i, section, kind);
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


    private static matchesQueryMComparison(mComparison: MComparison, section: Section, kind: InsightDatasetKind):
        boolean {
        let validRoomFields: string[] = ["lat", "lon", "seats"];
        let validCourseFields: string[] = ["avg", "pass", "fail", "audit", "year"];
        if (kind === InsightDatasetKind.Rooms && validCourseFields.includes(mComparison.mKey.field)) {
            throw (new InsightError("Invalid Room Mkey"));
        }
        if (kind === InsightDatasetKind.Courses && validRoomFields.includes(mComparison.mKey.field)) {
            throw (new InsightError("Invalid Courses Mkey"));
        }
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

    private static matchesQuerySComparison(sComparison: SComparison, section: Section, kind: InsightDatasetKind):
        boolean {
        let validRoomFields: string[] = ["fullname", "shortname", "number", "name",
            "address", "type", "furniture", "href"];
        let validCourseFields: string[] = ["dept", "id", "instructor", "title", "uuid"];
        if (kind === InsightDatasetKind.Rooms && validCourseFields.includes(sComparison.sKey.field)) {
            throw (new InsightError("Invalid Room Skey"));
        }
        if (kind === InsightDatasetKind.Courses && validRoomFields.includes(sComparison.sKey.field)) {
            throw (new InsightError("Invalid Courses Skey"));
        }
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

    private static matchesQueryNegation(negation: Negation, section: Section, kind: InsightDatasetKind): boolean {
        return !QueryHandler.matchesFilter(negation.filter, section, kind);
    }

    private static matchesFilter(filter: Filter, section: Section, kind: InsightDatasetKind): boolean {
        if (!filter) {
            return true;
        }
        // Log.trace(filter);
        if (filter.logicComparison) {
            return QueryHandler.matchesQueryLogicComp(filter.logicComparison, section, kind);
        } else if (filter.mComparison) {
            return QueryHandler.matchesQueryMComparison(filter.mComparison, section, kind);
        } else if (filter.sComparison) {
            return QueryHandler.matchesQuerySComparison(filter.sComparison, section, kind);
        } else if (filter.negation) {
            return QueryHandler.matchesQueryNegation(filter.negation, section, kind);
        }
        // Validation up to this point will have already thrown an error if this is the case
        return false;
    }
}
