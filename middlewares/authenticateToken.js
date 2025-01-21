import jwt from 'jsonwebtoken';

export const authenticateToken = (ctx, next) => {
    const token = ctx.headers['authorization']?.split(' ')[1];

    if (!token) {
        ctx.status = 401;
        ctx.body = { error: 'Token required for authentication' };
        return;
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        ctx.user = user; 
        return next();
    } catch (error) {
        ctx.status = 403;
        ctx.body = { error: 'Invalid or expired token' };
    }
};

