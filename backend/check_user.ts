import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const diag = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to MongoDB');
        
        const user = await User.findOne({ email: 'sanchitchauhan005@gmail.com' });
        if (user) {
            console.log('User found:');
            console.log('- Email:', user.email);
            console.log('- Is Verified:', user.isVerified);
            console.log('- OTP:', user.otp);
            console.log('- OTP Expires:', user.otpExpires);
        } else {
            console.log('User sanchitchauhan005@gmail.com not found');
        }
        
        process.exit(0);
    } catch (e) {
        console.error('Diag Error:', e);
        process.exit(1);
    }
};

diag();
