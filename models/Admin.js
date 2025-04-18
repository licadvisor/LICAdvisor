const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    recoveryCode: String
});

// Add password hashing before save
adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            console.log('Password hashed successfully');
        } catch (error) {
            console.error('Error hashing password:', error);
        }
    }
    next();
});

// Update password comparison method
adminSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password match result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

module.exports = mongoose.model('Admin', adminSchema);