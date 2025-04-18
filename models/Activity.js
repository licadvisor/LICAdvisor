const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    type: {
        type: String,
        enum: ['Login', 'Policy_Added', 'Document_Upload', 'Status_Change', 'Note_Added'],
        required: true
    },
    description: String,
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    metadata: {
        type: Map,
        of: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', activitySchema);