import { User } from '../models/user.js';
import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { userValidationSchema } from '../services/validationService.js';
import  { sendOtpEmail } from '../services/emailService.js';
import otpGenerator from 'otp-generator';

// **Create User by Admin**
export const createUserByAdmin = async (ctx) => {
    const { username, email, permanentAddress, secondaryAddress, citizenshipNo } = ctx.request.body;
  
    try {
      // Validate input (exclude password validation since it's auto-generated)
      await userValidationSchema.validate({ 
        username, 
        email, 
        password: 'temporary-password', // Placeholder to bypass validation
        permanentAddress, 
        secondaryAddress, 
        citizenshipNo 
      });
  
      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        ctx.status = 400;
        ctx.body = { error: 'Email is already registered' };
        return;
      }
  
      // Generate a temporary password (not sent to the user)
      const temporaryPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
  
      // Create the user with a temporary password
      const newUser = await User.create({
        username,
        email,
        password: temporaryPassword,
        permanentAddress,
        secondaryAddress,
        citizenshipNo,
        role: 'user',
      });
  
      // Generate OTP for password reset
      const otp = otpGenerator.generate(6, { 
        upperCase: true, 
        specialChars: false 
      });
  
      // Save OTP and expiration time (15 minutes)
      newUser.resetOtp = otp;
      newUser.resetOtpExpire = Date.now() + 15 * 60 * 1000;
      await newUser.save();
  
      // Send OTP to the user's email
      await sendOtpEmail(email, otp);
  
      ctx.status = 201;
      ctx.body = { 
        message: 'User created successfully. OTP sent for password reset.', 
        user: newUser 
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  };


// **Register Admin**
export const registerAdmin = async (ctx) => {
    const { username, email, password, permanentAddress, secondaryAddress, citizenshipNo } = ctx.request.body;

    try {
        await userValidationSchema.validate({ username, email, password, permanentAddress, secondaryAddress, citizenshipNo });

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            ctx.status = 400;
            ctx.body = { error: 'Email is already registered' };
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await User.create({
            username,
            email,
            password: hashedPassword,
            permanentAddress, secondaryAddress, citizenshipNo,
            role: 'admin',
        });

        ctx.status = 201;
        ctx.body = { message: 'Admin registered successfully', user: newAdmin };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// Get all users (Admin only)access this part
export const getAllUsers = async (ctx) => {
    try {
        const users = await User.findAll();
        ctx.status = 200;
        ctx.body = { users };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// Update user by Admin but o   nly by email and username
export const updateUserByAdmin = async (ctx) => {
    const { id } = ctx.params;
    const { username, email } = ctx.request.body; 

    try {
        const user = await User.findByPk(id);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        // Validate only username and email field
        const updateValidationSchema = Yup.object({
            username: Yup.string().min(3, 'Username must be at least 3 characters'),
            email: Yup.string().email('Invalid email format'),
        });

        await updateValidationSchema.validate({ username, email });

        // Updating here username and email only
        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        ctx.status = 200;
        ctx.body = { message: 'User updated successfully', user };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// Delete user by Admin
export const deleteUserByAdmin = async (ctx) => {
    const { id } = ctx.params;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        await user.destroy();

        ctx.status = 200;
        ctx.body = { message: 'User deleted successfully' };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};


// Search users by parameters..........
export const searchUsers = async (ctx) => {
    try {
      
      const { username, email, role } = ctx.query;
  
      
      const whereClause = {};
      if (username) whereClause.username = { [Op.like]: `%${username}%` }; 
      if (email) whereClause.email = { [Op.like]: `%${email}%` }; 
      if (role) whereClause.role = role; 
  
      
      const users = await User.findAll({
        where: whereClause,
      });
  
      ctx.status = 200;
      ctx.body = { message: 'Search successful', users };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  };