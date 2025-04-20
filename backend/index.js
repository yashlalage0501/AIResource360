/**
 * Author      : Yash Lalage
 * Description : [Brief Description]
 * Created On  : April 20, 2025
 */
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded contains email, id, role, etc.
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// POST endpoint for user signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// POST endpoint for user login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.employee.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET endpoint for fetching all employees
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { title, description, dueDate, assignedTo,  difficulty } = req.body;

  try {
    // Validate incoming data
    if (!title || !description || !dueDate || !assignedTo || !difficulty) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create task in the database
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate), // Convert dueDate to Date object
        assignedTo: Number(assignedTo), // Ensure it's a number
        difficulty, 
      },
    });

    // Return the created task
    return res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ error: "Failed to create task" });
  }
});

// API to fetch all tasks (not related to manager)
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        employee: true, // Optionally include employee info in the response
      },
    });
    console.log(tasks);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

app.get("/api/tasks/my-tasks", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  console.log(req.user);
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: userId },
      include: {
        tasks: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employee.tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/tasks/:id", authMiddleware, async (req, res) => {
  const { id } = req.params; // Get task ID from URL parameter
  const { status } = req.body; // Get new status from request body
  console.log("task id ---------" + id);
  console.log(status);
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const validStatuses = ["pending", "in progress", "complete"];
  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    // Update the task status in the database
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status: status },
    });

    res.json(updatedTask); // Return the updated task
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
