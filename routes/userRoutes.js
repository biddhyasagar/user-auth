import Router from 'koa-router';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import  upload from '../middlewares/upload.js';

import { authorizeRole } from '../middlewares/authorizeRole.js';
import { 
    
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    updateUserProfile
} from '../controllers/userController.js';
import { registerAdmin,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin } from '../controllers/adminController.js';

    import {  generateResetOtp, 
        resetPassword } from '../controllers/passwordController.js';
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
router.post('/upload-profile', upload.single('profile'), updateUserProfile); 


//otp pasword reset
router.post('/password-reset-request', generateResetOtp);
router.put('/password-reset', resetPassword);

export default router;
