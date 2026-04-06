const mongoose = require("mongoose");
const { RECORD_TYPES, RECORD_CATEGORIES } = require("../constants");

/**
 * Record Schema — represents a single financial transaction.
 *
 * deletedAt (soft delete): records are never physically removed.
 * This preserves historical accuracy of dashboard aggregations and
 * allows admins to audit/restore deleted entries.
 *
 * createdBy: links every record to its author for accountability.
 */
const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"], // business rule: positive only
    },
    type: {
      type: String,
      enum: {
        values: Object.values(RECORD_TYPES),
        message: "Type must be either income or expense",
      },
      required: [true, "Type is required"],
    },
    category: {
      type: String,
      enum: {
        values: RECORD_CATEGORIES,
        message: `Category must be one of: ${RECORD_CATEGORIES.join(", ")}`,
      },
      required: [true, "Category is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //  Soft delete fields 
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // indexed because almost every query filters on it
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

//  Query helper: automatically exclude soft-deleted docs 
// Applied on find, findOne, findById, countDocuments etc.
recordSchema.pre(/^find/, function (next) {
  // Allow bypassing the filter when explicitly querying deleted records (admin use)
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

//  Indexes for common query patterns 
recordSchema.index({ date: -1 });               // default sort: latest first
recordSchema.index({ type: 1 });                // filter by type
recordSchema.index({ category: 1 });            // filter by category
recordSchema.index({ createdBy: 1, date: -1 }); // per-user sorted queries

module.exports = mongoose.model("Record", recordSchema);
