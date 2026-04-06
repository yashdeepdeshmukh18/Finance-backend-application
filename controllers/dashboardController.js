const {
  getFullDashboard : getFullDashboardService,
  getSummary : getSummaryService,
  getCategoryBreakdown : getCategoryBreakdownService,
  getMonthlyTrends : getMonthlyTrendsService,
  getRecentTransactions : getRecentTransactionsService

} = require("../services/dashboardService");
const { success, error } = require("../utils/apiResponse");


const getFullDashboard = async (req, res) => {
  try {
    const data = await getFullDashboardService();
    return success(res, { data, message: "Dashboard data fetched successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const getSummary = async (req, res) => {
  try {
    const data = await getSummaryService();
    return success(res, { data, message: "Summary fetched successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const data = await getCategoryBreakdownService();
    return success(res, { data, message: "Category breakdown fetched successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const getMonthlyTrends = async (req, res) => {
  try {
    const data = await getMonthlyTrendsService();
    return success(res, { data, message: "Monthly trends fetched successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const data = await getRecentTransactionsService();
    return success(res, { data, message: "Recent transactions fetched successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

module.exports = {
  getFullDashboard,
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentTransactions,
};
