const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Contact page render
router.get('/', (req, res) => {
    res.render('contact');
});

// Admin contact requests page
// Change this route
router.get('/admin/contact-requests', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.render('admin/admin-messages', {  // Updated view name
            contacts,
            currentPage: page,
            totalPages,
            total
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).send('Error loading contact messages');
    }
});

// API endpoint for contact data
router.get('/admin/contacts-data', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const sort = req.query.sort || 'newest';

        let sortQuery = { createdAt: -1 };
        if (sort === 'oldest') {
            sortQuery = { createdAt: 1 };
        }

        const searchQuery = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const contacts = await Contact.find(searchQuery)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        res.json({
            contacts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error fetching contacts' });
    }
});

// Delete contact request
router.delete('/admin/delete-contact/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Contact form submission
router.post('/', async (req, res) => {
    try {
        console.log('Received form data:', req.body);
        const contact = new Contact(req.body);
        await contact.save();
        res.json({ 
            success: true, 
            message: 'Thank you! Your message has been sent successfully.' 
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving contact',
            error: error.message
        });
    }
});

module.exports = router;