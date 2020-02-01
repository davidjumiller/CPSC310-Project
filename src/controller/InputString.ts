import Log from "../Util";

export class InputString {
    constructor(input: string) {
        if (input.includes("*")) {
            Log.trace("invalid InputString");
            // TODO throw an error
        }
        this.inputString = input;
    }

    public inputString: string; // This can't have any "*"
}
