import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import Community from './src/models/Community';
import Pod from './src/models/Pod';
import PodMembership from './src/models/PodMembership';
import User from './src/models/User';
import { joinCommunityPod } from './src/controllers/communityController';

async function testAllocation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');

        // 1. Setup Data
        const community = await Community.create({
            name: 'Anxiety Warriors',
            description: 'Support for GAD and panic disorders',
            category: 'Anxiety'
        });

        // Create 16 dummy users
        const users = [];
        for (let i = 0; i < 16; i++) {
            const user = await User.create({
                name: `Test User ${i}`,
                email: `testuser${i}@example.com`,
                password: 'password', // hashed in pre-save if it wasn't a mock, but mock is fine here
                role: 'PATIENT',
                status: 'active'
            });
            users.push(user);
        }

        console.log(`Created Community: ${community.name} and 16 test users`);

        // 2. Simulate 16 join requests
        for (let i = 0; i < 16; i++) {
            // Mock Express req/res
            const req = {
                user: { id: users[i]._id.toString() },
                params: { categoryId: community._id.toString() }
            };
            
            const res = {
                status: function(code: number) { this.statusCode = code; return this; },
                json: function(data: any) { this.data = data; return this; }
            };

            await joinCommunityPod(req as any, res as any);
        }

        // 3. Verify assertions
        const pods = await Pod.find({ communityId: community._id }).sort({ createdAt: 1 });
        console.log(`\nTotal Pods Created: ${pods.length}`);
        
        pods.forEach((pod, index) => {
            console.log(`Pod #${index + 1} (${pod.name}) -> Member Count: ${pod.currentMemberCount}`);
        });

        if (pods.length === 2 && pods[0].currentMemberCount === 15 && pods[1].currentMemberCount === 1) {
            console.log('\n✅ PASSED: Exactly 2 pods created (15 limit respected).');
        } else {
            console.log('\n❌ FAILED: Pod logic did not correctly overflow into a new pod.');
        }

        // 4. Cleanup
        await Community.deleteOne({ _id: community._id });
        await Pod.deleteMany({ communityId: community._id });
        await PodMembership.deleteMany({ userId: { $in: users.map(u => u._id) } });
        await User.deleteMany({ _id: { $in: users.map(u => u._id) } });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testAllocation();
