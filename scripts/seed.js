require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Record = require("../models/Record");
const { RECORD_CATEGORIES } = require("../constants");
const logger = require("../utils/logger");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/finance-dashboard";

//  Sample Users 
const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    status: "active",
  },
  {
    name: "Analyst User",
    email: "analyst@example.com",
    password: "analyst123",
    role: "analyst",
    status: "active",
  },
  {
    name: "Viewer User",
    email: "viewer@example.com",
    password: "viewer123",
    role: "viewer",
    status: "active",
  },
];

//  Record generation helpers 
const randomBetween = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const generateRecords = (adminId) => {
  const records = [];

  // Income records
  const incomeCategories = ["salary", "investment", "business", "freelance"];
  for (let i = 0; i < 30; i++) {
    records.push({
      amount: randomBetween(500, 8000),
      type: "income",
      category: randomElement(incomeCategories),
      date: daysAgo(Math.floor(Math.random() * 365)),
      notes: `Income record ${i + 1}`,
      createdBy: adminId,
    });
  }

  // Expense records
  const expenseCategories = ["food", "transport", "utilities", "healthcare", "entertainment", "rent", "education", "insurance", "other"];
  for (let i = 0; i < 30; i++) {
    records.push({
      amount: randomBetween(20, 3000),
      type: "expense",
      category: randomElement(expenseCategories),
      date: daysAgo(Math.floor(Math.random() * 365)),
      notes: `Expense record ${i + 1}`,
      createdBy: adminId,
    });
  }

  return records;
};

//  Main seed function 
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB");

    // Clear existing data
    await Promise.all([User.deleteMany({}), Record.deleteMany({})]);
    logger.info("Cleared existing data");

    if (process.argv.includes("--clear")) {
      logger.info("--clear flag detected. Exiting without seeding.");
      process.exit(0);
    }

    // Create users
    const createdUsers = await User.create(users);
    const admin = createdUsers.find((u) => u.role === "admin");
    logger.info(`Created ${createdUsers.length} users`);

    // Create records
    const records = generateRecords(admin._id);
    await Record.create(records);
    logger.info(`Created ${records.length} records`);

    logger.info("\n✅ Seed complete! Sample credentials:");
    logger.info("   Admin:   admin@example.com    / admin123");
    logger.info("   Analyst: analyst@example.com  / analyst123");
    logger.info("   Viewer:  viewer@example.com   / viewer123");

    process.exit(0);
  } catch (err) {
    logger.error("Seed error:", err.message);
    process.exit(1);
  }
};

seed();
