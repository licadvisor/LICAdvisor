const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function createAdmin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/lic_advisor');
        
        const hashedPassword = await bcrypt.hash('LIC@admin2024', 10);
        
        await mongoose.connection.db.collection('admins').insertOne({
            username: 'licadvisor',
            password: hashedPassword
        });
        
        console.log('Admin account created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createAdmin();