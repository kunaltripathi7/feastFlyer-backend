import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const CITIES = [
    { city: "Delhi", lat: 28.7041, lng: 77.1025 },
    { city: "Mumbai", lat: 19.076, lng: 72.8777 },
    { city: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { city: "Chennai", lat: 13.0827, lng: 80.2707 },
    { city: "Hyderabad", lat: 17.385, lng: 78.4867 },
    { city: "Pune", lat: 18.5204, lng: 73.8567 },
    { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { city: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { city: "Chandigarh", lat: 30.7333, lng: 76.7794 },
    { city: "Indore", lat: 22.7196, lng: 75.8577 },
    { city: "Kochi", lat: 9.9312, lng: 76.2673 },
    { city: "Goa", lat: 15.2993, lng: 74.124 },
    { city: "Nagpur", lat: 21.1458, lng: 79.0882 },
];

const CUISINES = [
    "Indian",
    "Chinese",
    "Italian",
    "Mexican",
    "Thai",
    "Japanese",
    "American",
    "Mediterranean",
    "Korean",
    "Vietnamese",
    "French",
    "Turkish",
    "Lebanese",
    "Greek",
    "Spanish",
];

const RESTAURANT_PREFIXES = [
    "Royal",
    "Golden",
    "Silver",
    "Spice",
    "Tandoori",
    "Masala",
    "Saffron",
    "Curry",
    "Biryani",
    "Naan",
    "Chai",
    "Tikka",
    "Mughal",
    "Bombay",
    "Delhi",
    "Madras",
    "Punjab",
    "Goan",
    "Coastal",
    "Urban",
];

const RESTAURANT_SUFFIXES = [
    "Kitchen",
    "Palace",
    "House",
    "Express",
    "Bites",
    "Diner",
    "Grill",
    "Cafe",
    "Dhaba",
    "Junction",
    "Hub",
    "Garden",
    "Corner",
    "Point",
    "Lounge",
    "Bistro",
    "Hut",
    "Bowl",
    "Plate",
    "Table",
];

function randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomSubset<T>(arr: T[], min: number, max: number): T[] {
    const count = Math.floor(randomInRange(min, max + 1));
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function generateRestaurant(index: number) {
    const city = pickRandom(CITIES);

    const latOffset = (Math.random() - 0.5) * 0.3;
    const lngOffset = (Math.random() - 0.5) * 0.3;

    return {
        user: new mongoose.Types.ObjectId(),
        restaurantName: `${pickRandom(RESTAURANT_PREFIXES)} ${pickRandom(RESTAURANT_SUFFIXES)} ${index}`,
        city: city.city,
        country: "India",
        location: {
            type: "Point" as const,
            coordinates: [city.lng + lngOffset, city.lat + latOffset],
        },
        deliveryPrice: Math.floor(randomInRange(20, 150)),
        estimatedDeliveryTime: Math.floor(randomInRange(15, 60)),
        cuisines: pickRandomSubset(CUISINES, 1, 4),
        menuItems: [
            {
                _id: new mongoose.Types.ObjectId(),
                name: "Starter",
                price: Math.floor(randomInRange(50, 300)),
            },
            {
                _id: new mongoose.Types.ObjectId(),
                name: "Main Course",
                price: Math.floor(randomInRange(150, 600)),
            },
        ],
        imageUrl: `https://placeholder.com/restaurant-${index}.jpg`,
        lastUpdated: new Date(),
    };
}

async function seedMillion() {
    const TOTAL = 1_000_000;
    const BATCH_SIZE = 10_000;

    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        if (!db) throw new Error("Database not found");

        const collection = db.collection("restaurants");

        const existingCount = await collection.countDocuments();
        console.log(`Existing restaurants: ${existingCount}`);

        if (existingCount >= TOTAL) {
            console.log("Already have 1M+ records. Skipping seed.");
            await mongoose.disconnect();
            return;
        }

        const toInsert = TOTAL - existingCount;
        console.log(`Inserting ${toInsert} restaurants in batches of ${BATCH_SIZE}...`);

        const startTime = Date.now();

        for (let i = 0; i < toInsert; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, toInsert - i);
            const batch = [];

            for (let j = 0; j < batchSize; j++) {
                batch.push(generateRestaurant(existingCount + i + j));
            }

            await collection.insertMany(batch, { ordered: false });
            const progress = Math.min(100, Math.round(((i + batchSize) / toInsert) * 100));
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} done | ${progress}% | ${elapsed}s elapsed`);
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Seeded ${toInsert} restaurants in ${totalTime}s`);

        console.log("\nEnsuring 2dsphere compound index...");
        await collection.createIndex({ location: "2dsphere", cuisines: 1 });
        console.log("✅ Index created/confirmed");

        const finalCount = await collection.countDocuments();
        console.log(`\nTotal restaurants in DB: ${finalCount}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

seedMillion();
