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
    this.timeout(15000);
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        fluff: "./test/data/courses.zip",
        foo_fum: "./test/data/courses.zip",
        avgtst: "./test/data/dataForAvgsTests.zip",
        emptyCourses: "./test/data/emptyCourses.zip",
        courses2: "./test/data/dataWithCoursesFolderRenamed.zip",
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

    describe("Courses", function () {

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
                    expect.fail(err, expected, "Should not have rejected" + err);
                });
        });

        it("Should remove a dataset that has been read from disk", function () {
            const id: string = "courses";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    let insightFacade2: InsightFacade = new InsightFacade();
                    return insightFacade2.removeDataset(id);
                })
                .then((result2: string) => {
                    expect(result2).to.deep.equal(id);
                })
                .catch((err: any) => {
                    expect.fail(err, expected, "Should not have rejected remove " + err);
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
                    expect.fail(err, expected, "Should not have rejected " + err);
                });
        });

        it("Mock test to help develop perform query", function () {
            // This should fail eventually because the dataset in the query is not avgtst
            const id: string = "courses";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    return insightFacade.performQuery({
                        WHERE: {
                            AND: [
                                {
                                    EQ: {
                                        courses_avg: 50
                                    }
                                },
                                {
                                    IS: {
                                        courses_dept: "busi"
                                    }
                                }
                            ]
                        },
                        OPTIONS: {
                            COLUMNS: [
                                "courses_dept",
                                "courses_id",
                                "courses_instructor",
                                "courses_title",
                                "courses_uuid",
                                "courses_avg",
                                "courses_pass",
                                "courses_fail",
                                "courses_audit",
                                "courses_year"
                            ]
                        }
                    });
                })
                .then((res: string[]) => {
                    expect(true).to.deep.equal(true);
                })
                .catch((error: any) => {
                    expect.fail(error, expected, "Should not have rejected " + error);
                });
        });

        it("Should fail to add an invalid dataset", function () {
            const id: string = "invalidDataSet";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    expect.fail(result, expected, "Should have rejected");
                })
                .catch((err: any) => {
                    expect(err).instanceOf(InsightError);
                });
        });

        it("Should fail to find a dataset that doesnt exist", function () {
            const id: string = "datasetThatDoesntExist";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    expect.fail(result, expected, "Should have rejected");
                })
                .catch((err: any) => {
                    expect(err).instanceOf(InsightError);
                });
        });

        it("Should fail to add a dataset with the inner courses folder changed to courses2", function () {
            const id: string = "courses2";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    expect.fail(result, expected, "Should have rejected");
                })
                .catch((err: any) => {
                    expect(err).instanceOf(InsightError);
                });
        });

        it("Should fail to add a zip with no valid courses", function () {
            const id: string = "emptyCourses";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    expect.fail(result, expected, "Should have rejected");
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
            const id: string = "avgtst";
            const id2: string = "oneBadFile";
            const expected: string[] = [id, id2];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((ignoredResult: string[]) => {
                    return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
                })
                .then((result: string[]) => {
                    expect(result)
                        .to.deep.include(id)
                        .to.deep.include(id2);
                })
                .catch((err: any) => {
                    expect.fail(err, expected, "Should not have rejected" + err);
                });
        });

        it("Should fail due to two of the same datasets", function () {
            const id: string = "avgtst";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((ignoredResult: string[]) => {
                    return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
                })
                .then((result: string[]) => {
                    expect.fail(result, expected, "Should have been rejected");
                    // return Promise.resolve((result));
                })
                .catch((err: any) => {
                    // Log.trace("why are we here. " + err);
                    expect(err).instanceOf(InsightError);
                    // return Promise.resolve((err));
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
                    return insightFacade.removeDataset(id);
                })
                .then((result: string) => {
                    expect(result).to.deep.equal(id);
                })
                .catch((error: any) => {
                    expect.fail(error, id, "Should not have rejected");
                });
        });

        it("Should remove one dataset and then fail to query the removed dataset", function () {
            let testQueries: ITestQuery[] = [];
            testQueries = TestUtil.readTestQueries();
            const id: string = "courses";
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((ignoreResult: string[]) => {
                    return insightFacade.removeDataset(id);
                })
                .catch((error: any) => {
                    expect.fail(error, id, "Should not have rejected");
                })
                .then((result: string) => {
                    return insightFacade.performQuery(testQueries[0].query);
                })
                .then(() => {
                    expect.fail("Should have rejected");
                })
                .catch((error: any) => {
                    expect(error).instanceOf(InsightError);
                });
        });

        it("should fail to remove one dataset because it hasn't been added yet", function () {
            const idToDelete: string = "courses";
            const id: string = "fluff";
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((ignoreResult: string[]) => {
                    return insightFacade.removeDataset(idToDelete);
                })
                .then((result: string) => {
                    expect.fail(result, "", "should have been rejected");
                })
                .catch((error: any) => {
                    expect(error).instanceOf(NotFoundError);
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

        it("should fail to remove dataset due to invalid id (empty string)", function () {
            const id: string = "";
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
                    return insightFacade.listDatasets();
                })
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
                .then(() => {
                    return insightFacade.addDataset(iddd, datasets[iddd], InsightDatasetKind.Courses);
                })
                .then(() => {
                    return insightFacade.listDatasets();
                })
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
        });
    });
    describe("Rooms", function () {
        it("Should add a valid dataset", function () {
            const id: string = "courses";
            const expected: string[] = [id];
            return insightFacade
                .addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    expect(result).to.deep.equal(expected);
                })
                .catch((err: any) => {
                    expect.fail(err, expected, "Should not have rejected" + err);
                });
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

    // Dynamically create and run a test for each query in testQueries.
    // Creates an extra "test" called "Should run test queries" as a byproduct.
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    const resultChecker = TestUtil.getQueryChecker(test, done);
                    insightFacade.performQuery(test.query)
                        .then(resultChecker)
                        .catch(resultChecker);
                });
            }
        });
    });
    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);
        const cacheDir = __dirname + "/../data";

        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }

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
        return Promise.all(loadDatasetPromises);
            // .catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * TODO For C1, remove this catch block (but keep the Promise.all)
             */
            // return Promise.resolve("HACK TO LET QUERIES RUN");
        // });
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
    // it("Should run test queries", function () {
    //     describe("Dynamic InsightFacade PerformQuery tests", function () {
    //         for (const test of testQueries) {
    //             it(`[${test.filename}] ${test.title}`, function (done) {
    //                 insightFacade
    //                     .performQuery(test.query)
    //                     .then((result) => {
    //                         TestUtil.checkQueryResult(test, result, done);
    //                     })
    //                     .catch((err) => {
    //                         TestUtil.checkQueryResult(test, err, done);
    //                     });
    //             });
    //         }
    //     });
//     });
});
