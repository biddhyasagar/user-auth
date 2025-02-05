import * as nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: process.env.BSM_host,
       port: process.env.BSM_port,
        auth: {
          user: process.env.BSM_user,
            pass: process.env.BSM_pass,
        },
    });

    const mailOptions = {
        from: '<no-reply@loginapp.com>',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. It...expire.. 15 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Failed to send OTP email');
    }
};
