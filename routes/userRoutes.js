import Router from 'koa-router';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import { 
    registerAdmin,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
    registerUser,
    loginUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

const router = new Router();

// Admin Routes
router.post('/admin/register', registerAdmin); 
router.get('/admin/users', authenticateToken, authorizeRole('admin'), getAllUsers); 
router.put('/admin/users/:id', authenticateToken, authorizeRole('admin'), updateUserByAdmin); 
router.delete('/admin/users/:id', authenticateToken, authorizeRole('admin'), deleteUserByAdmin); 

// User Routes
router.post('/register', registerUser); 
router.post('/login', loginUser); 
router.put('/user/:id', authenticateToken, updateUser); 
router.delete('/user/:id', authenticateToken, deleteUser); 

export default router;
