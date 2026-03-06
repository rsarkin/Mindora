const mongoose = require('mongoose');
require('dotenv').config();

async function testQuery() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://technophilia4:technophilia4@technophilia4.pcuz03q.mongodb.net/mental_health_chatbot');

    // We know from Atlas query there's a therapist with user ID '69a44d7db046b45be0aa950f'
    // This is how getTherapistAppointmentsService does it:
    const Therapist = mongoose.model('Therapist', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, bio: String }), 'therapists');
    const Appointment = mongoose.model('Appointment', new mongoose.Schema({ patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' }, type: String }), 'appointments');
    const User = mongoose.model('User', new mongoose.Schema({ name: String }), 'users');

    const testUserIdStr = '69a44d7db046b45be0aa950f';

    console.log(`Testing findOne({ userId: '${testUserIdStr}' })`);
    const therapist = await Therapist.findOne({ userId: testUserIdStr });

    if (!therapist) {
        console.log("FAILED: Therapist not found using string userId.");
    } else {
        console.log("SUCCESS: Therapist found using string:", therapist._id);

        const appointments = await Appointment.find({ therapistId: therapist._id })
            .populate('patientId', 'name email avatar')
            .sort({ scheduledAt: -1 })
            .lean();

        console.log(`Found ${appointments.length} appointments using populate and lean().`);

        const mapped = appointments.map(apt => ({
            ...apt,
            patient: apt.patientId
        }));

        console.log("First mapped appointment patient name:", mapped[0]?.patient?.name);
        console.log("Full mapped doc structure keys:", Object.keys(mapped[0] || {}));
    }

    process.exit(0);
}

testQuery();
