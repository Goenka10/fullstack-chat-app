import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.models.js";

config();

const seedUsers = [
  // Female Users
  {
    email: "anand@gmail.com",
    fullName: "Anand",
    password: "123456",
    profilePic: "",
  },
  {
    email: "new@gmail.com",
    fullName: "Aditya",
    password: "123456",
    profilePic: "",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();