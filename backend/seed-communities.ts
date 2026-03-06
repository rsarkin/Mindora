import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import Community from './src/models/Community';

const categories = [
    {
        name: 'Early Addiction Rehab',
        description: 'A 15-person pod for those navigating the first 90 days of recovery. We focus on daily check-ins, recognizing early triggers, and building a foundation of sobriety.',
        category: 'Rehab',
        imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Anxiety Mastery',
        description: 'A dedicated group for individuals seeking peer support in managing generalized anxiety, panic attacks, or social anxiety through shared experiences and grounding exercises.',
        category: 'Anxiety',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Grief & Loss Circle',
        description: 'A pod for navigating the complex emotions of losing a loved one. There is no timeline for grief, only the comfort of shared presence.',
        category: 'Grief',
        imageUrl: 'https://images.unsplash.com/photo-1490264175373-67845348882b?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Long-term Recovery Maintenance',
        description: 'Rehab maintenance for individuals with 1+ years of sobriety. Focus on rebuilding relationships, career reinvention, and dealing with late-stage triggers.',
        category: 'Rehab',
        imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800'
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');

        const existingCount = await Community.countDocuments();
        if (existingCount > 0) {
            console.log('Communities already exist. Skipping seed.');
            process.exit(0);
        }

        await Community.insertMany(categories);
        console.log('Successfully seeded communities!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
