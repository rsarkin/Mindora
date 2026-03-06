
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({}, { strict: false });
const TherapistSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema);
const Therapist = mongoose.model('Therapist', TherapistSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to DB');

        const email = process.argv[2];
        if (email) {
            const user = await User.findOne({ email });
            if (user) {
                console.log('User found:', JSON.stringify(user, null, 2));
                const therapist = await Therapist.findOne({ userId: user._id });
                if (therapist) {
                    console.log('Therapist found for this user:', JSON.stringify(therapist, null, 2));
                } else {
                    console.log('No therapist record found for this user ID');
                }
            } else {
                console.log('No user found with email:', email);
            }
        } else {
            const therapists = await Therapist.find().limit(5);
            console.log('Sample Therapists:', JSON.stringify(therapists, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
