import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import SessionNote from './src/models/SessionNote';
import Appointment from './src/models/Appointment';

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');
        
        // Find an appointment to attach the note to
        const appointment = await Appointment.findOne();
        if (!appointment) {
            console.log('No appointments found to test with.');
            process.exit(0);
        }

        // 1. Create a note via the Mongoose model (this should trigger pre-save encryption)
        const newNote = await SessionNote.create({
            appointmentId: appointment._id,
            therapistId: appointment.therapistId,
            patientId: appointment.patientId,
            content: 'This is a strictly confidential clinical note about self-harm.',
            status: 'DRAFT'
        });
        
        console.log('\n--- 1. Decrypted output via Mongoose ---');
        console.log('Model returned content:', newNote.content);

        // 2. Fetch the raw document natively from MongoDB bypassing Mongoose getters/post hooks
        const rawNote = await SessionNote.collection.findOne({ _id: newNote._id });
        
        console.log('\n--- 2. Raw Encrypted data in MongoDB At Rest ---');
        console.log('Database raw content:', rawNote?.content);
        
        if (rawNote?.content && rawNote.content.includes('confidential')) {
            console.error('\n❌ FAILED: The raw data contains the plaintext string!');
        } else {
            console.log('\n✅ PASSED: The raw data is properly encrypted (IV:Ciphertext format)');
        }

        // 3. Clean up
        await SessionNote.deleteOne({ _id: newNote._id });
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

runTest();
