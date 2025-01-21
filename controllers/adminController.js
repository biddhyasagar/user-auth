import { User } from '../models/user.js';
import * as Yup from 'yup';
import { userValidationSchema } from '../services/validationService.js';

// **Register Admin**
export const registerAdmin = async (ctx) => {
    const { username, email, password } = ctx.request.body;

    try {
        await userValidationSchema.validate({ username, email, password });

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
            role: 'admin',
        });

        ctx.status = 201;
        ctx.body = { message: 'Admin registered successfully', user: newAdmin };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};

// Get all users (Admin-only)
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

// Update user by Admin (only username and email)
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

