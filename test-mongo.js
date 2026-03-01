const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://anvitha:Avanthi%40123@cluster0.llvfl1y.mongodb.net/campus_dashboard?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
    const client = new MongoClient(uri);
    try {
        console.log("Connecting to MongoDB Atlas...");
        await client.connect();
        console.log("Connected successfully!");
        const db = client.db("campus_dashboard");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
    } catch (err) {
        console.error("Connection failed!");
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
