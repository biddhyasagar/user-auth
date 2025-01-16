import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

// Validation schema for user data
const userValidationSchema = Yup.object({
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

// Function to create JWT token
const createToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register Admin
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

// Update user by Admin
export const updateUserByAdmin = async (ctx) => {
    const { id } = ctx.params;
    const { username, email, password } = ctx.request.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        await userValidationSchema.validate({ username, email, password });

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
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

// Register User (POST /register)
export const registerUser = async (ctx) => {
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

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user',
        });

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

// Update User (PUT /user/:id) - Only users can update their own data
export const updateUser = async (ctx) => {
    const { id } = ctx.params;
    const { username, email, password } = ctx.request.body;
    try {
        if (id !== String(ctx.user.id)) {
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

        await userValidationSchema.validate({ username, email, password });

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
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

// Delete User (DELETE /user/:id) - Only users can delete their own data
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
