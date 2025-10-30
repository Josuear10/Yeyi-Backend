import sql from '../config/supabase.js';
import { hashPassword } from '../utils/hash.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { user_username, user_password } = req.body;
  if (!user_username || !user_password) {
    return res.status(400).json({ error: 'User and password are required.' });
  }

  if (!SECRET_KEY) {
    return res
      .status(500)
      .json({ error: 'Server misconfiguration: JWT_SECRET missing' });
  }

  try {
    const users = await sql`
      SELECT * FROM users WHERE user_username = ${user_username};
    `;
    if (users.length === 0) {
      return res.status(401).json({ error: 'User or password incorrect' });
    }

    const user = { ...users[0] };
    const codifiedPassword = hashPassword(user_password);

    if (user.user_password !== codifiedPassword) {
      return res.status(401).json({ error: 'User or password incorrect' });
    }

    delete user.user_password;

    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '2h' });
    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users`;
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
};

export const createUser = async (req, res) => {
  const {
    user_username,
    user_password,
    user_first_name,
    user_last_name,
    user_role,
  } = req.body;
  if (!user_username || !user_password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const codifiedPassword = hashPassword(user_password);
  try {
    const existingUser =
      await sql`SELECT * FROM users WHERE user_username = ${user_username}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = await sql`
      INSERT INTO users 
      (user_username, user_password, user_first_name, user_last_name, user_role)
      VALUES (${user_username}, ${codifiedPassword}, ${user_first_name}, ${user_last_name}, ${user_role})
      RETURNING *;
    `;
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // The user data is already available from the JWT token via auth middleware
    const {
      user_id,
      user_username,
      user_first_name,
      user_last_name,
      user_role,
    } = req.user;

    res.json({
      user_id,
      user_username,
      user_first_name,
      user_last_name,
      user_role,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { user_first_name, user_last_name } = req.body;

    if (!user_first_name && !user_last_name) {
      return res.status(400).json({
        error: 'At least one field (first_name or last_name) is required',
      });
    }

    const updatedUser = await sql`
      UPDATE users SET
        user_first_name = ${user_first_name || null},
        user_last_name = ${user_last_name || null}
      WHERE user_id = ${user_id}
      RETURNING user_id, user_username, user_first_name, user_last_name, user_role;
    `;

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res
        .status(400)
        .json({ error: 'Current password and new password are required' });
    }

    if (new_password.length < 6) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user with password
    const users = await sql`
      SELECT * FROM users WHERE user_id = ${user_id};
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const codifiedCurrentPassword = hashPassword(current_password);
    if (user.user_password !== codifiedCurrentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const codifiedNewPassword = hashPassword(new_password);
    await sql`
      UPDATE users SET
        user_password = ${codifiedNewPassword}
      WHERE user_id = ${user_id};
    `;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
};
