const mongoose = require('mongoose');

const policySaleSchema = new mongoose.Schema({
    policyNumber: String,
    customerName: String,
    policyType: String,
    premium: Number,
    commission: Number,
    saleDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'active', 'cancelled'],
        default: 'pending'
    }
});

module.exports = mongoose.model('PolicySale', policySaleSchema);