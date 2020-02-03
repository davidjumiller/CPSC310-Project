export class Section {
    // This lets us index with a variable Thanks lint!
    [index: string]: any;
    public dept: string;
    public id: string;
    public avg: number;
    public instructor: string;
    public title: string;
    public pass: number;
    public fail: number;
    public audit: number;
    public uuid: string;
    public year: number;
}
