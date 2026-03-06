require('dotenv').config();
const mongoose = require('mongoose');

async function fixVerifiedTherapists() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Require models using the schema files conceptually or query directly
        const db = mongoose.connection.db;

        // Find all verified therapist documents
        const therapists = await db.collection('therapists').find({ verificationStatus: 'VERIFIED' }).toArray();
        console.log(`Found ${therapists.length} verified therapists.`);

        for (const t of therapists) {
            const result = await db.collection('users').updateOne(
                { _id: t.userId },
                { $set: { accountStatus: 'ACTIVE' } }
            );
            console.log(`Updated user ${t.userId}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
        }

        console.log('Fix complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixVerifiedTherapists();
