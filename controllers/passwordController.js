import { User } from '../models/user.js';
import otpGenerator from 'otp-generator';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '../services/emailService.js';

// Password Reset through............ Generate OTP
export const generateResetOtp = async (ctx) => {
    const { email } = ctx.request.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        
        const otp = otpGenerator.generate(6, { upperCase: true, specialChars: false });
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 15 * 60 * 1000;  
        await user.save();

        
        await sendOtpEmail(email, otp);

        ctx.status = 201;
        ctx.body = { message: 'OTP sent successfully' };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// Password Reset 
export const resetPassword = async (ctx) => {
    const { email, otp, newPassword } = ctx.request.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        if (user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid or expired OTP' };
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = null;
        user.resetOtpExpire = null;

        await user.save();

        ctx.status = 200;
        ctx.body = { message: 'Password reset successfully' };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};
