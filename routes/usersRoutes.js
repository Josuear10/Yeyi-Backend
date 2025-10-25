import express from 'express';
import {
  getUsers,
  createUser,
  login,
  getCurrentUser,
} from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
