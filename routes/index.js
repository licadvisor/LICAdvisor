const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/policies', (req, res) => {
    res.render('policies');
});

router.get('/calculator', (req, res) => {
    res.render('calculator');
});

router.get('/about', (req, res) => {
    res.render('about', { 
        title: 'About Us'
    });
});

router.get('/contact', (req, res) => {
    res.render('contact');
});

router.get('/policies/insurance/endowment/715', (req, res) => {
    res.render('policies/insurance/endowment/LIC-New-Jeevan-Anand-Plan-715');
});

module.exports = router;