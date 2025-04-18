const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    city: String,
    planInterest: String,
    message: String,
    status: {
        type: String,
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);