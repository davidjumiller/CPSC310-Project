import {Course} from "./Course";
import Log from "../Util";
import {InsightDataset} from "./IInsightFacade";
export class Dataset {
    public id: string;
    // TODO implement the isd
    // public isd: InsightDataset;
    public courses: Course[];

    constructor(id: string, coursearr: Course[]) {
        this.id = id;
        this.courses = coursearr;
    }
}
