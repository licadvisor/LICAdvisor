const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Email', 'Phone', 'SMS', 'Meeting', 'Other'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Sent', 'Failed', 'Completed'],
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    scheduledFor: Date,
    completedAt: Date,
    metadata: {
        type: Map,
        of: String
    }
});

module.exports = mongoose.model('Communication', communicationSchema);