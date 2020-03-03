import { Section } from "./Section";
import { Room } from "./Room";
import Log from "../Util";
import {InsightDataset} from "./IInsightFacade";

export class Dataset {
    // public id: string;
    public isd: InsightDataset;
    public sections: any;

    constructor(id: InsightDataset, sectionarr: any) {
        this.isd = id;
        this.sections = sectionarr;
    }
}
