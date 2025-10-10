import sql from "../config/supabase.js";
import { hashPassword } from "../utils/hash.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { user_username, user_password } = req.body;
  if (!user_username || !user_password) {
    return res.status(400).json({ error: "User and password are required." });
  }

  if (!SECRET_KEY) {
    return res.status(500).json({ error: "Server misconfiguration: JWT_SECRET missing" });
  }

  try {
    const users = await sql`
      SELECT * FROM users WHERE user_username = ${user_username};
    `;
    if (users.length === 0) {
      return res.status(401).json({ error: "User or password incorrect" });
    }

    const user = { ...users[0] };
    const codifiedPassword = hashPassword(user_password);

    if (user.user_password !== codifiedPassword) {
      return res.status(401).json({ error: "User or password incorrect" });
    }

    delete user.user_password;

    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "2h" });
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users`;
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
};

export const createUser = async (req, res) => {
  const { user_username, user_password, user_first_name, user_last_name, user_role } = req.body;
  if (!user_username || !user_password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const codifiedPassword = hashPassword(user_password);
  try {
    const existingUser = await sql`SELECT * FROM users WHERE user_username = ${user_username}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = await sql`
      INSERT INTO users 
      (user_username, user_password, user_first_name, user_last_name, user_role)
      VALUES (${user_username}, ${codifiedPassword}, ${user_first_name}, ${user_last_name}, ${user_role})
      RETURNING *;
    `;
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
};
