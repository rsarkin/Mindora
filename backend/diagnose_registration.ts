
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to DB');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Therapist = mongoose.model('Therapist', new mongoose.Schema({}, { strict: false }));

        const allTherapists = await Therapist.find({});
        console.log(`Total Therapists: ${allTherapists.length}`);

        for (const therapist of allTherapists) {
            const user = await User.findById((therapist as any).userId);
            if (!user) {
                console.log(`ORPHAN FOUND: Therapist ${therapist._id} has no User ${(therapist as any).userId}`);
                console.log(`Orphan License: ${(therapist as any).licenseNumber}`);
            }
        }

        const stats = await Therapist.aggregate([
            { $group: { _id: "$licenseNumber", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        if (stats.length > 0) {
            console.log('DUPLICATE LICENSES FOUND:');
            console.log(JSON.stringify(stats, null, 2));
        } else {
            console.log('No duplicate license numbers found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

diagnose();
