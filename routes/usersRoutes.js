import express from 'express';
import {
  getUsers,
  createUser,
  login,
  getCurrentUser,
  updateUser,
  changePassword,
} from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/me', authenticateToken, updateUser);
router.put('/me/password', authenticateToken, changePassword);

export default router;
