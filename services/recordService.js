const Record = require("../models/Record");
const { parsePagination, buildMeta } = require("../utils/pagination");
const logger = require("../utils/logger");


//  constructs the Mongoose filter from query params.
 
const buildFilter = (query) => {
  const filter = {};

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  if (query.search) {
    filter.notes = { $regex: query.search, $options: "i" };
  }

  return filter;
};


//  getRecords -> paginated, filterable, sortable list of active records. 
//  Default sort is latest first, but can sort by amount
 
const getRecords = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildFilter(query);

  const sortField = query.sortBy === "amount" ? "amount" : "date";
  const sortOrder = query.order === "asc" ? 1 : -1;

  const [records, total] = await Promise.all([
    Record.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email"), // author info
    Record.countDocuments(filter),
  ]);

  return {
    records,
    meta: buildMeta({ total, page, limit }),
  };
};

// fetches a single record by ID
const getRecordById = async (id) => {
  const record = await Record.findById(id).populate("createdBy", "name email");
  if (!record) {
    const err = new Error("Record not found.");
    err.status = 404;
    throw err;
  }
  return record;
};


// creates a financial record(admin only).
 
const createRecord = async (data, userId) => {
  const record = await Record.create({ ...data, createdBy: userId });
  logger.info(`Record created by user ${userId}: ${record._id}`);
  return record;
};


// updates an existing record by ID(admin only).
 
const updateRecord = async (id, updates, userId) => {
  const record = await Record.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    const err = new Error("Record not found.");
    err.status = 404;
    throw err;
  }

  logger.info(`Record ${id} updated by user ${userId}`);
  return record;
};

// soft-deleted a record by ID(admin only)
const deleteRecord = async (id, userId) => {
  const record = await Record.findById(id);

  if (!record) {
    const err = new Error("Record not found.");
    err.status = 404;
    throw err;
  }

  record.isDeleted = true;
  record.deletedAt = new Date();
  record.deletedBy = userId;
  await record.save();

  logger.info(`Record ${id} soft-deleted by user ${userId}`);
  return { message: "Record deleted successfully." };
};

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };
