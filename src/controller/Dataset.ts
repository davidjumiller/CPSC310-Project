import {Course} from "./Course";
import Log from "../Util";
export class Dataset {
    public id: string;
    public courses: Course[];

    constructor(id: string, coursearr: Course[]) {
        this.id = id;
        this.courses = coursearr;
    }
}
