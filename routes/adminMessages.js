const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Main page route
router.get('/', (req, res) => {
    res.render('admin/admin-messages', {
        title: 'Customer Messages',
        path: '/admin/contacts',
        layout: false
    });
});

// Get contacts data
router.get('/contacts-data', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const sort = req.query.sort || 'newest';

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Updated sorting logic to match quote requests
        let sortOptions = {};
        if (sort === 'newest') {
            sortOptions = { _id: -1 };
        } else if (sort === 'oldest') {
            sortOptions = { _id: 1 };
        }

        const messages = await Contact.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments(query);

        res.json({
            messages,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Delete message
router.delete('/delete-contact/:id', async (req, res) => {
    try {
        const result = await Contact.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;