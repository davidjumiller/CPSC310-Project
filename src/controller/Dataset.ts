import {Course} from "./Course";
import Log from "../Util";
import {InsightDataset} from "./IInsightFacade";
export class Dataset {
    // public id: string;
    public isd: InsightDataset;
    public courses: Course[];

    constructor(id: InsightDataset, coursearr: Course[]) {
        this.isd = id;
        this.courses = coursearr;
    }
}
