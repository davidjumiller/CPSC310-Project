import {Body} from "./Body";
import {Options} from "./Options";
import Log from "../Util";
import {Query} from "./Query";
import {Course} from "./Course";

export class QueryHandler {

    public static parseQuery(query: any): Query {
        return undefined;
    }

    public static validQuery(parsedQuery: Query): boolean {
        return false;
    }

    public static executeBody(body: Body): Course[] {
        return [];
    }

    public static executeOptions(options:  Options): string[] {
        return [];
    }

    public static filterWithOptions(selectedSections: Course[], selectedFields: string[]): any[] {
        return [];
    }
}
