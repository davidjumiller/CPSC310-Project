import { Section } from "./Section";
import Log from "../Util";
import {InsightDataset} from "./IInsightFacade";
export class Dataset {
    // public id: string;
    public isd: InsightDataset;
    public sections: Section[];

    constructor(id: InsightDataset, sectionarr: Section[]) {
        this.isd = id;
        this.sections = sectionarr;
    }
}
