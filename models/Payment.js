const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    quoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuoteRequest',
        required: true
    },
    amount: {
        type: Number,
        default: 500 // Fixed consultation fee
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'NET_BANKING', 'CARD'],
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    paidAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema);