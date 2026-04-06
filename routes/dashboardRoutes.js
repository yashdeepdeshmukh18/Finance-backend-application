const express = require("express");
const router = express.Router();

const {
    getFullDashboard,
    getSummary, 
    getCategoryBreakdown, 
    getMonthlyTrends, 
    getRecentTransactions
    } = require("../controllers/dashboardController");

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");


const canViewAnalytics = [authenticate, allowRoles("analyst", "admin")];


router.get("/", ...canViewAnalytics, getFullDashboard);
router.get("/summary", ...canViewAnalytics, getSummary);
router.get("/categories", ...canViewAnalytics, getCategoryBreakdown);
router.get("/trends", ...canViewAnalytics, getMonthlyTrends);
router.get("/recent", ...canViewAnalytics, getRecentTransactions);

module.exports = router;
