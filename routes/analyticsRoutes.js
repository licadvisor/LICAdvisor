const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const PolicySale = require('../models/PolicySale');

router.get('/dashboard-analytics', async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const thisWeek = new Date(now.setDate(now.getDate() - 7));
        const thisMonth = new Date(now.setMonth(now.getMonth() - 1));

        // Get visitor statistics
        const dailyVisitors = await Analytics.countDocuments({ timestamp: { $gte: today } });
        const weeklyVisitors = await Analytics.countDocuments({ timestamp: { $gte: thisWeek } });
        const monthlyVisitors = await Analytics.countDocuments({ timestamp: { $gte: thisMonth } });

        // Get conversion rates
        const totalQuoteRequests = await Analytics.countDocuments({ convertedToQuote: true });
        const totalVisitors = await Analytics.countDocuments();
        const conversionRate = (totalQuoteRequests / totalVisitors * 100).toFixed(2);

        // Get geographic distribution
        const geoDistribution = await Analytics.aggregate([
            { $group: { _id: "$location.country", count: { $sum: 1 } } }
        ]);

        // Get income statistics
        const monthlyIncome = await PolicySale.aggregate([
            { $match: { saleDate: { $gte: thisMonth } } },
            { $group: { _id: null, total: { $sum: "$commission" } } }
        ]);

        res.json({
            visitors: { daily: dailyVisitors, weekly: weeklyVisitors, monthly: monthlyVisitors },
            conversion: { rate: conversionRate, total: totalQuoteRequests },
            geography: geoDistribution,
            income: monthlyIncome[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching analytics data' });
    }
});

module.exports = router;