const { MongoClient } = require('mongodb');

async function check() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('mental-health-db');

    const therapists = await db.collection('therapists').find({}).toArray();
    console.log(`Found ${therapists.length} therapists.`);

    if (therapists.length > 0) {
        console.log("Sample therapist ID:", therapists[0]._id);
        console.log("Sample therapist user ID:", therapists[0].userId);

        const appts = await db.collection('appointments').find({ therapistId: therapists[0]._id }).toArray();
        console.log(`Found ${appts.length} appointments for this therapist.`);
        console.log(appts.slice(0, 2));

        const user = await db.collection('users').findOne({ _id: therapists[0].userId });
        console.log("User doc for therapist:", user);
    }

    process.exit(0);
}

check();
