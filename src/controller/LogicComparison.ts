import {Filter} from "./Filter";
enum Logic {
    AND = 0,
    OR= 1,
}
export class LogicComparison {
    public filters: Filter[]; // Can't be empty
    public logic: Logic;
}
