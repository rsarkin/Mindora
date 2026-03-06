
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({}, { strict: false });
const TherapistSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema);
const Therapist = mongoose.model('Therapist', TherapistSchema);

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to DB');

        const email = process.argv[2];
        if (!email) {
            console.log('Please provide an email to clean up');
            process.exit(1);
        }

        const user = await User.findOne({ email });
        if (user) {
            console.log('Found user:', user._id);
            const tResult = await Therapist.deleteMany({ userId: user._id });
            console.log('Deleted therapists:', tResult.deletedCount);
            const uResult = await User.deleteOne({ _id: user._id });
            console.log('Deleted user:', uResult.deletedCount);
            console.log('Cleanup complete for:', email);
        } else {
            console.log('No user found with email:', email);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

cleanup();
