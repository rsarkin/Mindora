const { MongoClient } = require('mongodb');

async function check() {
    const client = new MongoClient('mongodb+srv://technophilia4:technophilia4@technophilia4.pcuz03q.mongodb.net/mental_health_chatbot');
    await client.connect();
    const db = client.db('mental_health_chatbot');

    const therapists = await db.collection('therapists').find({}).toArray();
    console.log(`Found ${therapists.length} therapists.`);

    if (therapists.length > 0) {
        console.log("Sample therapist ID:", therapists[0]._id);
        console.log("Sample therapist user ID:", therapists[0].userId);

        const appts = await db.collection('appointments').find({ therapistId: therapists[0]._id }).toArray();
        console.log(`Found ${appts.length} appointments for this therapist.`);
        console.log("First appointment:", appts[0]);

        const user = await db.collection('users').findOne({ _id: therapists[0].userId });
        console.log("User doc for therapist:", user.name);
    } else {
        const users = await db.collection('users').find({ role: 'THERAPIST' }).toArray();
        console.log(`Found ${users.length} users with THERAPIST role, but no therapist profiles.`);
    }

    process.exit(0);
}

check();
