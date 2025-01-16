export const authorizeRole = (role) => {
    return (ctx, next) => {
        if (ctx.user.role !== role) {
            ctx.status = 403;
            ctx.body = { error: 'Forbidden: You do not have permission' };
            return;
        }
        return next();
    };
};
