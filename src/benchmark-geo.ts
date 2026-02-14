import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

interface BenchmarkResult {
    label: string;
    wallClockMs: number;
    mongoExecMs: number;
    indexUsed: string;
    docsExamined: number;
    docsReturned: number;
    stage: string;
}

async function runBenchmark() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
        console.log("Connected to MongoDB\n");

        const db = mongoose.connection.db;
        if (!db) throw new Error("Database not found");

        const collection = db.collection("restaurants");

        const totalDocs = await collection.countDocuments();
        console.log(`📊 Total documents in collection: ${totalDocs.toLocaleString()}\n`);

        const indexes = await collection.indexes();
        console.log("📋 Current indexes:");
        indexes.forEach((idx) => {
            console.log(`   ${idx.name}: ${JSON.stringify(idx.key)}`);
        });
        console.log("");

        const testCases = [
            {
                label: "Near Delhi (10km, no cuisine filter)",
                query: {
                    location: {
                        $nearSphere: {
                            $geometry: { type: "Point", coordinates: [77.1025, 28.7041] },
                            $maxDistance: 10000,
                        },
                    },
                },
            },
            {
                label: "Near Mumbai (10km, no cuisine filter)",
                query: {
                    location: {
                        $nearSphere: {
                            $geometry: { type: "Point", coordinates: [72.8777, 19.076] },
                            $maxDistance: 10000,
                        },
                    },
                },
            },
            {
                label: "Near Delhi (10km) + cuisine filter (Indian)",
                query: {
                    location: {
                        $nearSphere: {
                            $geometry: { type: "Point", coordinates: [77.1025, 28.7041] },
                            $maxDistance: 10000,
                        },
                    },
                    cuisines: { $all: ["Indian"] },
                },
            },
            {
                label: "Near Bangalore (5km) + cuisine filter (Chinese, Thai)",
                query: {
                    location: {
                        $nearSphere: {
                            $geometry: { type: "Point", coordinates: [77.5946, 12.9716] },
                            $maxDistance: 5000,
                        },
                    },
                    cuisines: { $all: ["Chinese", "Thai"] },
                },
            },
            {
                label: "Near Delhi (50km, large radius)",
                query: {
                    location: {
                        $nearSphere: {
                            $geometry: { type: "Point", coordinates: [77.1025, 28.7041] },
                            $maxDistance: 50000,
                        },
                    },
                },
            },
        ];

        console.log("=".repeat(80));
        console.log("🚀 BENCHMARK RESULTS");
        console.log("=".repeat(80));

        const results: BenchmarkResult[] = [];

        for (const tc of testCases) {
            const explainResult = await collection
                .find(tc.query)
                .limit(10)
                .explain("executionStats") as any;

            const execStats = explainResult.executionStats;

            const startTime = process.hrtime.bigint();
            const docs = await collection.find(tc.query).limit(10).toArray();
            const endTime = process.hrtime.bigint();

            const wallClockMs = Number(endTime - startTime) / 1_000_000;

            const winningPlan = execStats.executionStages || explainResult.queryPlanner?.winningPlan;
            const stage = winningPlan?.stage || winningPlan?.inputStage?.stage || "UNKNOWN";

            let indexName = "NONE (COLLSCAN)";
            const planStr = JSON.stringify(winningPlan);
            if (planStr.includes("GEO_NEAR_2DSPHERE")) {
                indexName = "2dsphere compound";
            } else if (planStr.includes("IXSCAN")) {
                indexName = "index scan";
            }

            const result: BenchmarkResult = {
                label: tc.label,
                wallClockMs: Math.round(wallClockMs * 100) / 100,
                mongoExecMs: execStats.executionTimeMillis,
                indexUsed: indexName,
                docsExamined: execStats.totalDocsExamined,
                docsReturned: execStats.nReturned,
                stage,
            };
            results.push(result);

            console.log(`\n🔍 ${tc.label}`);
            console.log(`   Stage:          ${result.stage}`);
            console.log(`   Index Used:     ${result.indexUsed}`);
            console.log(`   Mongo Exec:     ${result.mongoExecMs}ms`);
            console.log(`   Wall Clock:     ${result.wallClockMs}ms`);
            console.log(`   Docs Examined:  ${result.docsExamined}`);
            console.log(`   Docs Returned:  ${result.docsReturned}`);
            console.log(`   Sub-50ms?       ${result.mongoExecMs < 50 ? "✅ YES" : "❌ NO"}`);
        }

        console.log("\n" + "=".repeat(80));
        console.log("📊 SUMMARY TABLE");
        console.log("=".repeat(80));
        console.log(
            "Label".padEnd(50) +
            "Mongo(ms)".padEnd(12) +
            "Wall(ms)".padEnd(12) +
            "Examined".padEnd(10) +
            "Result"
        );
        console.log("-".repeat(94));

        for (const r of results) {
            console.log(
                r.label.padEnd(50) +
                String(r.mongoExecMs).padEnd(12) +
                String(r.wallClockMs).padEnd(12) +
                String(r.docsExamined).padEnd(10) +
                (r.mongoExecMs < 50 ? "✅ <50ms" : "❌ >=50ms")
            );
        }

        console.log("\n" + "=".repeat(80));
        console.log("🔬 DETAILED EXPLAIN for first query:");
        console.log("=".repeat(80));

        const detailedExplain = await collection
            .find(testCases[0].query)
            .limit(10)
            .explain("executionStats");

        console.log(JSON.stringify(detailedExplain, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

runBenchmark();
