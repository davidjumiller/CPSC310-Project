import {expect} from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError, } from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any; // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string; // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        fluff: "./test/data/courses.zip",
        avgtst: "./test/data/dataForAvgsTests.zip",
        invalidDataSet: "./test/data/invalidData.zip",
        oneBadFile: "./test/data/oneBadFile.zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs
                .readFileSync(datasetsToLoad[id])
                .toString("base64");
        }
    });

    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // TODO add an invalid dataset example a directory with no files in it
    //  add an invalid dataset that has one file but it is invalid
    //  add a dataset with one valid and one invalid file and make sure it only has the valid file
    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect(result).to.deep.equal(expected);
            })
            .catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected");
            });
    });

    it("Should add a valid dataset but missing one file", function () {
        const id: string = "oneBadFile";
        const expected: string[] = ["oneBadFile"];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect(result).to.deep.equal(expected);
            })
            .catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected" + err);
            });
    });

    it("Should add a valid dataset my avgtst", function () {
        const id: string = "avgtst";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect(result).to.deep.equal(expected);
            })
            .catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected");
            });
    });

    it("Should fail to add an invalid dataset", function () {
        const id: string = "invalidDataSet";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect.fail(result, expected, "Should not have rejected");
            })
            .catch((err: any) => {
                expect(err).instanceOf(InsightError);
            });
    });

    it("Should fail to add a valid dataset but wrong kind", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((result: string[]) => {
                expect.fail(result, "", "This should have n=been rejected");
            })
            .catch((err: any) => {
                expect(err).instanceOf(InsightError);
            });
    });

    it("Should add 2 valid datasets", function () {
        const id: string = "courses";
        const id2: string = "fluff";
        const expected: string[] = [id, id2];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((ignoredResult: string[]) => {
                insightFacade
                    .addDataset(id2, datasets[id2], InsightDatasetKind.Courses)
                    .then((result: string[]) => {
                        expect(result)
                            .to.deep.include(id)
                            .to.deep.include(id2);
                    })
                    .catch((err: any) => {
                        expect.fail(err, expected, "Should not have rejected");
                    });
            })
            .catch((err: any) => {
                expect.fail(err, id, "Should not have rejected");
            });
    });

    it("Should fail due to two of the same datasets", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((ignoredResult: string[]) => {
                insightFacade
                    .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                    .then((result: string[]) => {
                        expect.fail(
                            result,
                            expected,
                            "Should have been rejected",
                        );
                    })
                    .catch((err: any) => {
                        expect(err).instanceOf(InsightError);
                    });
            })
            .catch((err: any) => {
                expect.fail(err, id, "Should not have rejected");
            });
    });

    // playing around with expectations
    /*
    it("test tests", function () {
        const strs: string[] = ["a", "b"];
        expect(strs).to.include("a").to.include("b");
    });

     */

    it("Should fail on a non valid dataset with a bad id (only white space)", function () {
        const id: string = "   ";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect.fail(
                    result,
                    "",
                    "this should have failed due to white space only id",
                );
            })
            .catch((err: any) => {
                // I want this to see if the error is an InsightError
                expect(err).instanceOf(InsightError);
            });
    });

    it("Should fail on a non valid dataset with a bad id (contains an underscore)", function () {
        const id: string = "foo_fum";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect.fail(
                    result,
                    "",
                    "this should have failed due to an id with an underscore",
                );
            })
            .catch((err: any) => {
                // I want this to see if the error is an InsightError
                expect(err).instanceOf(InsightError);
            });
    });

    it("Should fail due to invalid content", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, "fluff", InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect.fail(
                    result,
                    "",
                    "this should have failed due to invalid content",
                );
            })
            .catch((err: any) => {
                expect(err).instanceOf(InsightError);
            });
    });

    it("Should remove one dataset", function () {
        const id: string = "courses";
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((ignoreResult: string[]) => {
                insightFacade
                    .removeDataset(id)
                    .then((result: string) => {
                        expect(result).to.deep.equal(id);
                    })
                    .catch((error: any) => {
                        expect.fail(error, id, "Should not have rejected");
                    });
            })
            .catch((err: any) => {
                expect.fail(err, id, "Should not have rejected");
            });
    });

    it("should fail to remove one dataset because it hasn't been added yet", function () {
        const idToDelete: string = "courses";
        const id: string = "fluff";
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((ignoreResult: string[]) => {
                insightFacade
                    .removeDataset(idToDelete)
                    .then((result: string) => {
                        expect.fail(result, "", "should have been rejected");
                    })
                    .catch((error: any) => {
                        expect(error).instanceOf(NotFoundError);
                    });
            })
            .catch((err: any) => {
                expect.fail(err, id, "Should not have rejected");
            });
    });

    it("should fail to remove dataset due to invalid id (underscore)", function () {
        const id: string = "foo_fum";
        return insightFacade
            .removeDataset(id)
            .then((result: string) => {
                expect.fail(result, "", "should have been rejected");
            })
            .catch((err: any) => {
                expect(err).instanceOf(InsightError);
            });
    });

    it("should fail to remove dataset due to invalid id (all whitespace)", function () {
        const id: string = "   ";
        return insightFacade
            .removeDataset(id)
            .then((result: string) => {
                expect.fail(result, "", "should have been rejected");
            })
            .catch((err: any) => {
                expect(err).instanceOf(InsightError);
            });
    });

    it("should fail to remove dataset because the dataset doesn't exist", function () {
        const id: string = "foo";
        return insightFacade
            .removeDataset(id)
            .then((result: string) => {
                expect.fail(result, "", "should have been rejected");
            })
            .catch((err: any) => {
                expect(err).instanceOf(NotFoundError);
            });
    });

    it("Should return an empty array from listDatasets", function () {
        return insightFacade
            .listDatasets()
            .then((result: InsightDataset[]) => {
                // TODO maybe use length = zero
                let a = expect(result).to.be.an("array").that.is.empty;
            })
            .catch((err: any) => {
                expect.fail(err, "", "this should not have been rejected");
            });
    });

    it("should return a list of 1 InsightDatasets with 3 rows", function () {
        const idd: string = "avgtst";
        const expected: InsightDataset[] = [
            { id: idd, kind: InsightDatasetKind.Courses, numRows: 3 },
        ];

        return insightFacade
            .addDataset(idd, datasets[idd], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                insightFacade
                    .listDatasets()
                    .then((results: InsightDataset[]) => {
                        expect(results).to.deep.equal(expected);
                    })
                    .catch((err: any) => {
                        expect.fail(
                            err,
                            "",
                            "This should not have been rejected",
                        );
                    });
            })
            .catch((err: any) => {
                expect.fail(err, "", "This should not have been rejected");
            });
    });

    it("should return a list of 2 InsightDatasets with 3, 64612 rows", function () {
        const idd: string = "courses";
        const iddd: string = "avgtst";
        const expected: InsightDataset[] = [
            { id: idd, kind: InsightDatasetKind.Courses, numRows: 64612 },
            { id: iddd, kind: InsightDatasetKind.Courses, numRows: 3 },
        ];

        return insightFacade
            .addDataset(idd, datasets[idd], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                insightFacade.addDataset(iddd, datasets[iddd], InsightDatasetKind.Courses).then((res: string[]) => {
                    insightFacade
                        .listDatasets()
                        .then((results: InsightDataset[]) => {
                            expect(results).to.deep.equal(expected);
                        })
                        .catch((err: any) => {
                            expect.fail(
                                err,
                                "",
                                "This should not have been rejected",
                            );
                        });
                }).catch((err: any) => {
                    expect.fail(
                        err,
                        "",
                        "This should not have been rejected",
                    );
                });

            })
            .catch((err: any) => {
                expect.fail(err, "", "This should not have been rejected");
            });
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: {
        [id: string]: { path: string; kind: InsightDatasetKind };
    } = {
        courses: {
            path: "./test/data/courses.zip",
            kind: InsightDatasetKind.Courses,
        },
        avgtst: {
            path: "./test/data/dataForAvgsTests.zip",
            kind: InsightDatasetKind.Courses,
        },
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail(
                "",
                "",
                `Failed to read one or more test queries. ${err}`,
            );
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(
                insightFacade.addDataset(id, data, ds.kind),
            );
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * TODO For C1, remove this catch block (but keep the Promise.all)
             */
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // NOTE id is the name of the file minus the course dept
    // NOTE dept is the name of the file minus the course id
    // NOTE valid keys are dept, id, instructor, title, pass, fail, audit, uuid, and avg.

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    insightFacade
                        .performQuery(test.query)
                        .then((result) => {
                            TestUtil.checkQueryResult(test, result, done);
                        })
                        .catch((err) => {
                            TestUtil.checkQueryResult(test, err, done);
                        });
                });
            }
        });
    });
});
