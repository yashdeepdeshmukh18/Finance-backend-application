const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES, USER_STATUS } = require("../constants");

/**
 * User Schema
 *
 * status: active/inactive — inactive users cannot log in.
 *         This allows admins to revoke access without deleting accounts
 *         (preserves audit trail on createdBy references).
 *
 * role:   drives all access-control decisions in middleware/roleMiddleware.js
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.VIEWER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

//  Hash password before saving 
userSchema.pre("save", async function (next) {
  // Only hash if password field was actually modified
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//  Instance method: compare plain-text password against stored hash 
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//  Virtual: safe public representation 
userSchema.methods.toPublic = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
