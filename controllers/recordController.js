const {
  getRecords: getRecordsService,
  getRecordById : getRecordByIdService,
  createRecord : createRecordService,
  updateRecord : updateRecordService,
  deleteRecord : deleteRecordService,
} = require("../services/recordService");
const { success, error } = require("../utils/apiResponse");

const getRecords = async (req, res) => {
  try {
    const result = await getRecordsService(req.query);
    return success(res, {
      data: result.records,
      meta: result.meta,
      message: "Records fetched successfully.",
    });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const getRecordById = async (req, res) => {
  try {
    const record = await getRecordByIdService(req.params.id);
    return success(res, { data: record, message: "Record fetched successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const createRecord = async (req, res) => {
  try {
    const record = await createRecordService(req.body, req.user._id);
    return success(res, { data: record, message: "Record created successfully.", status: 201 });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const updateRecord = async (req, res) => {
  try {
    const record = await updateRecordService(req.params.id, req.body, req.user._id);
    return success(res, { data: record, message: "Record updated successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const result = await deleteRecordService(req.params.id, req.user._id);
    return success(res, { data: result, message: "Record deleted successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };
