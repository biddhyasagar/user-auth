import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import userRoutes from './routes/userRoutes.js';
import { connectDatabase } from './config/database.js';

const app = new Koa();
app.use(bodyParser());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());

const startServer = async () => {
    try {
        await connectDatabase();
        console.log('Database connected successfully.');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to start the server:', error.message);
    }
    
};

startServer();


