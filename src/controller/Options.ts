import {Columns} from "./Columns";
import {Key} from "./Key";
import Log from "../Util";
import {InsightError} from "./IInsightFacade";
import {Sort} from "./Sort";

export class Options {
    constructor(queryElement: any) {
        let keys: string[] = Object.keys(queryElement);
        if (keys.length > 2) {
            throw (new InsightError("More than 2 keys in Options"));
        }
        if (keys[0] === "COLUMNS") {
            this.columns = new Columns(queryElement[keys[0]]);
        } else {
            throw (new InsightError("The first key in Options is not COLUMNS"));
        }

        // Make sure that there is an ORDER because its optional
        if (keys.length === 2) {
            if (keys[1] === "ORDER") {
                this.sortOrder = new Sort(queryElement[keys[1]]);
            } else {
                throw (new InsightError("The second key in Options is not ORDER"));
            }
        }
    }

    public doSort(elements: any[]) {
        if (this.sortOrder) {
            this.sortOrder.sort(elements);
        }
    }

    public checkAllSortKeysAreInColumns() {
        if (this.sortOrder) {
            for (let i of this.sortOrder.sortKeys) {
                let valid: boolean = false;
                for (let j of this.columns.keys) {
                    if (j.getKeyField() === i.getKeyField()) {
                        valid = true;
                        break;
                    }
                }
                if (!valid) {
                    throw (new InsightError("At least one sortkey is not in Columns"));
                }
            }
        }
    }

    public getColumnKeysDatasetId(): string {
        for (let i of this.columns.keys) {
            if (i.getKeyId()) {
                return i.getKeyId();
            }
        }
    }

    public columns: Columns;
    public sortOrder: Sort; // can be NULL
}
