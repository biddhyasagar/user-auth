import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { createToken } from '../services/authService.js';
import { userValidationSchema } from '../services/validationService.js';
import * as Yup from 'yup';
import { UserProfile } from '../models/userprofile.js';

// Register User (POST /register)`
export const registerUser = async (ctx) => {
    const { username, email, password, permanentAddress, secondaryAddress, citizenshipNo } = ctx.request.body;

    try {
        await userValidationSchema.validate({ username, email, password,  permanentAddress, secondaryAddress, citizenshipNo });

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            ctx.status = 400;
            ctx.body = { error: 'Email is already registered' };
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            permanentAddress,
            secondaryAddress,
            citizenshipNo,
            role: 'user',
            
        });
        await UserProfile.create({userId: newUser.id})

        ctx.status = 201;
        ctx.body = { message: 'User registered successfully', user: newUser };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// User Login (POST /login)
export const loginUser = async (ctx) => {
    const { email, password } = ctx.request.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid credentials' };
            return;
        }

        const token = createToken(user);

        ctx.status = 200;
        ctx.body = { message: 'Login successful', token };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// Update User_________PUT /user/:id
export const updateUser = async (ctx) => {
    const { id } = ctx.params;
    const { username, email, newPassword } = ctx.request.body; 

    try {
        if (id != ctx.user.id) {
            ctx.status = 403;
            ctx.body = { error: 'You can only update your own data' };
            return;
        }

        const user = await User.findByPk(id);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        // Validation schema for updating user
        const updateValidationSchema = Yup.object({
            username: Yup.string().min(3, 'Username must be at least 3 characters'),
            email: Yup.string().email('Invalid email format'),
            newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
        });

        await updateValidationSchema.validate({ username, email, newPassword });

        // Update username and email 
        if (username) user.username = username;
        if (email) user.email = email;

        
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        await user.save();

        ctx.status = 200;
        ctx.body = { message: 'User updated successfully', user };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// Delete User______________DELETE /user/:id
export const deleteUser = async (ctx) => {
    const { id } = ctx.params;

    try {
        if (id !== String(ctx.user.id)) {
            ctx.status = 403;
            ctx.body = { error: 'You can only delete your own data' };
            return;
        }

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

//updateuser profile
export const updateUserProfile = async (ctx) => {
    const file = ctx.req.file; 

    if (!file) {
        ctx.status = 400;
        ctx.body = { error: 'No file uploaded' };
        return;
    }

    const { id } = ctx.params; 
    const { description } = ctx.request.body; 

    try {
        const user = await User.findByPk(id);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        
        user.profileImage = file.path; 
        if (description) user.description = description; 

        await user.save();

        ctx.status = 200;
        ctx.body = {
            message: 'Profile updated successfully',
            filePath: file.path,
            filename: file.filename,
            description,
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};  
