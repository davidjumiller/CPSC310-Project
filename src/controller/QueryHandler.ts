import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";
import {Query} from "./Query";
import {Section} from "./Section";

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

    public static executeBody(body: Body): Section[] {
        return [];
    }

    public static executeOptions(options:  Options): string[] {
        return [];
    }

    public static filterWithOptions(selectedSections: Section[], selectedFields: string[]): any[] {
        return [];
    }
}
