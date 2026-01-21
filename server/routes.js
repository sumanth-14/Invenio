const express = require('express');
const router = express.Router();
const db = require('./database');

// --- Jobs ---
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await db.getJobs();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Companies ---
router.get('/companies', async (req, res) => {
    try {
        const companies = await db.getCompanies();
        res.json(companies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/companies', async (req, res) => {
    try {
        const { name, url, type } = req.body;
        const result = await db.addCompany(name, url, type);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/companies/toggle', async (req, res) => {
    try {
        const { id, active } = req.body;
        const result = await db.toggleCompany(id, active);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteCompany(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Roles ---
router.get('/roles', async (req, res) => {
    try {
        const roles = await db.getRoles();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/roles', async (req, res) => {
    try {
        const { keyword } = req.body;
        const result = await db.addRole(keyword);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/roles/toggle', async (req, res) => {
    try {
        const { id, active } = req.body;
        const result = await db.toggleRole(id, active);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteRole(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
