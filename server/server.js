const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const routes = require('./routes');
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Job Automation API is running');
});

const cron = require('node-cron');
const { scrape } = require('./scraper');

// Schedule scrape every day at 9 AM (0 9 * * *)
// For testing, we can run it immediately on startup or use a shorter interval
cron.schedule('0 9 * * *', () => {
    scrape();
});

// Endpoint to trigger scrape manually
app.post('/api/scrape', async (req, res) => {
    try {
        scrape(); // Run in background
        res.json({ message: 'Scrape started' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
