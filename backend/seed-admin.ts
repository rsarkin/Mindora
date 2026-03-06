import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole, AccountStatus } from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindora';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@mindora.com';
        const passwordText = 'mindora_admin_secure123';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin already exists!');
            console.log(`Email: ${existingAdmin.email}`);
            console.log('Password (from initialization): mindora_admin_secure123');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(passwordText, 10);

        const newAdmin = new User({
            name: 'Mindora Admin',
            email: adminEmail,
            passwordHash: hashedPassword,
            role: UserRole.ADMIN,
            accountStatus: AccountStatus.ACTIVE,
            isEmailVerified: true
        });

        await newAdmin.save();

        console.log('--- Admin Seeded Successfully ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${passwordText}`);
        console.log('---------------------------------');

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedAdmin();
