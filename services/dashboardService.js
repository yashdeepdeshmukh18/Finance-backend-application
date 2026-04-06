const Record = require("../models/Record");

// excluding soft-deleted records 
const activeRecordsMatch = { $match: { isDeleted: false } };

const getSummary = async () => {
  const result = await Record.aggregate([
    activeRecordsMatch,
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const income = result.find((r) => r._id === "income") || { total: 0, count: 0 };
  const expense = result.find((r) => r._id === "expense") || { total: 0, count: 0 };

  return {
    totalIncome: income.total,
    totalExpenses: expense.total,
    netBalance: income.total - expense.total,
    incomeCount: income.count,
    expenseCount: expense.count,
  };
};

const getCategoryBreakdown = async () => {
  const results = await Record.aggregate([
    activeRecordsMatch,
    {
      $group: {
        _id: { type: "$type", category: "$category" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Reshaping
  const breakdown = { income: [], expense: [] };
  results.forEach(({ _id, total, count }) => {
    breakdown[_id.type].push({ category: _id.category, total, count });
  });

  return breakdown;
};


const getMonthlyTrends = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const results = await Record.aggregate([
    activeRecordsMatch,
    { $match: { date: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: "%Y-%m", date: "$date" } },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } }, // chronological order
  ]);

  // Pivot into month-keyed objects: { "2024-01": { income: X, expense: Y } }
  const trendsMap = {};
  results.forEach(({ _id, total, count }) => {
    if (!trendsMap[_id.month]) {
      trendsMap[_id.month] = { month: _id.month, income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
    }
    trendsMap[_id.month][_id.type] = total;
    trendsMap[_id.month][`${_id.type}Count`] = count;
  });

  return Object.values(trendsMap).sort((a, b) => a.month.localeCompare(b.month));
};


const getRecentTransactions = async () => {
  return Record.find()
    .sort({ date: -1 })
    .limit(5)
    .populate("createdBy", "name email")
    .lean(); // lean() returns plain JS objects — faster for read-only use
};

/**
 * Running aggregations in parallel with Promise.all() is  faster
 * than awaiting them sequentially, all four queries hit the DB concurrently.
 */
const getFullDashboard = async () => {
  const [summary, categoryBreakdown, monthlyTrends, recentTransactions] = await Promise.all([
    getSummary(),
    getCategoryBreakdown(),
    getMonthlyTrends(),
    getRecentTransactions(),
  ]);

  return { summary, categoryBreakdown, monthlyTrends, recentTransactions };
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentTransactions,
  getFullDashboard,
};
