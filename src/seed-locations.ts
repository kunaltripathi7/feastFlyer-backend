import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const SAMPLE_LOCATIONS = [
    { city: "Delhi", coordinates: [77.1025, 28.7041] },
    { city: "Mumbai", coordinates: [72.8777, 19.0760] },
    { city: "Bangalore", coordinates: [77.5946, 12.9716] },
    { city: "Chennai", coordinates: [80.2707, 13.0827] },
    { city: "Hyderabad", coordinates: [78.4867, 17.3850] },
    { city: "Pune", coordinates: [73.8567, 18.5204] },
    { city: "Kolkata", coordinates: [88.3639, 22.5726] },
];

async function seedLocations() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        if (!db) throw new Error("Database not found");

        const restaurants = await db.collection("restaurants").find({}).toArray();
        console.log(`Found ${restaurants.length} restaurants`);

        let updated = 0;
        for (const restaurant of restaurants) {
            const cityMatch = SAMPLE_LOCATIONS.find(
                (loc) => loc.city.toLowerCase() === restaurant.city?.toLowerCase()
            );

            const coords = cityMatch?.coordinates || [
                77.1025 + (Math.random() - 0.5) * 0.1,
                28.7041 + (Math.random() - 0.5) * 0.1,
            ];

            await db.collection("restaurants").updateOne(
                { _id: restaurant._id },
                {
                    $set: {
                        location: {
                            type: "Point",
                            coordinates: coords,
                        },
                    },
                }
            );
            updated++;
        }

        console.log(`✅ Updated ${updated} restaurants with location data`);
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

seedLocations();
