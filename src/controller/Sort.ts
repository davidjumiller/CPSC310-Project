import {AnyKey} from "./AnyKey";

export class Sort {
    // TODO implement constructor. NOTE that if there is no direction sortKeys can only have one element
    public direction: string; // either UP or DOWN or NULL
    public sortKeys: AnyKey[]; // can be one or more but if there is no direction it can only be one.
}
