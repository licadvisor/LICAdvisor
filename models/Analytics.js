const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    visitorId: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    location: {
        country: String,
        city: String,
        region: String
    },
    pageViewed: String,
    convertedToQuote: { type: Boolean, default: false },
    deviceInfo: {
        browser: String,
        os: String,
        device: String
    }
});

module.exports = mongoose.model('Analytics', analyticsSchema);