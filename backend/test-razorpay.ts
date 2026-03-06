import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const testRazorpay = async () => {
    try {
        console.log("Testing Razorpay order creation...");
        console.log("Key ID:", process.env.RAZORPAY_KEY_ID);

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_SECRET || ''
        });

        const options = {
            amount: 2500 * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_fakeSlotId`
        };

        const order = await razorpay.orders.create(options);
        console.log("Success! Order:", order);
    } catch (error) {
        console.error("Razorpay Error:", error);
    }
};

testRazorpay();
