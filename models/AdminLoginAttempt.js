const mongoose = require('mongoose');

const adminLoginAttemptSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    lockedUntil: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('AdminLoginAttempt', adminLoginAttemptSchema);