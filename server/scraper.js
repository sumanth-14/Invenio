const puppeteer = require('puppeteer');
const db = require('./database');
const { sendNewJobsEmail } = require('./mailer');
require('dotenv').config();

// --- Main Scraper Entry Point ---
async function scrape() {
    console.log('Starting Intelligent Scrape Job...');

    const companies = await db.getCompanies();
    const roles = await db.getRoles();

    const activeCompanies = companies.filter(c => c.active);
    const activeRoles = roles.filter(r => r.active);

    if (activeCompanies.length === 0 || activeRoles.length === 0) {
        console.log('No active companies or roles to scrape.');
        return;
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Set a realistic User Agent to avoid anti-bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let allNewJobs = [];

    for (const company of activeCompanies) {
        console.log(`Analyzing ${company.name} (${company.url})...`);
        try {
            let jobs = [];

            // 1. Detect Strategy
            const strategy = detectStrategy(company.url, company.name);
            console.log(`--> Strategy: ${strategy.name}`);

            // 2. Execute Strategy
            jobs = await strategy.fn(page, company, activeRoles);

            console.log(`Found ${jobs.length} potential jobs for ${company.name}`);

            // 3. Save to DB
            let newCount = 0;
            for (const job of jobs) {
                const saved = await db.saveJob(job);
                if (saved) {
                    newCount++;
                    allNewJobs.push(job);
                }
            }
            console.log(`Saved ${newCount} new jobs for ${company.name}`);

        } catch (err) {
            console.error(`Error scraping ${company.name}:`, err.message);
        }
    }

    await browser.close();

    if (allNewJobs.length > 0) {
        console.log(`Sending email notification for ${allNewJobs.length} new jobs...`);
        await sendNewJobsEmail(process.env.EMAIL_USER, allNewJobs);
    } else {
        console.log('No new jobs found, skipping email.');
    }
    console.log('Scrape job finished.');
}

// --- Strategy Detection ---
function detectStrategy(url, name) {
    const u = url.toLowerCase();
    const n = name.toLowerCase();

    // Specific Platform Matches
    if (u.includes('myworkdayjobs.com') || u.includes('adobe.com')) return { name: 'Workday/Enterpise', fn: scrapeWorkday };
    if (u.includes('greenhouse.io')) return { name: 'Greenhouse', fn: scrapeGreenhouse };
    if (u.includes('lever.co')) return { name: 'Lever', fn: scrapeLever };

    // Custom/Complex Sites
    if (n.includes('google')) return { name: 'Google Custom', fn: scrapeGoogle };
    if (n.includes('netflix')) return { name: 'Netflix Custom', fn: scrapeNetflix };

    // Fallback
    return { name: 'Universal Smart Scraper', fn: scrapeGenericSmart };
}

// --- Strategies ---

// 1. UNIVERSAL SMART SCRAPER (The "Generic" Fallback)
async function scrapeGenericSmart(page, company, roles) {
    console.log('Running Smart Generic Scraper...');

    try {
        await page.goto(company.url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Auto-Scroll to trigger lazy loading
        await autoScroll(page);

        return await page.evaluate((roleKeywords, companyName) => {
            const results = [];
            // Look for any 'a' tag or clickable div. 
            // Also look for h2/h3/h4 containing 'a'
            const queries = ['a', 'div[role="link"]', 'h2 a', 'h3 a', 'li a'];
            const candidates = Array.from(document.querySelectorAll(queries.join(',')));

            candidates.forEach(el => {
                const text = el.innerText.toLowerCase().trim();
                const link = el.tagName === 'A' ? el.href : el.querySelector('a')?.href;

                if (!link || !text) return;

                // Check for keywords
                const matchedRole = roleKeywords.find(r => text.includes(r.toLowerCase()));

                // Heuristic: Link text should be relatively short (title-like), not a paragraph
                const isTitleLength = text.length < 150 && text.length > 4;

                if (matchedRole && isTitleLength) {
                    // Cleanup title: Remove newlines, extra spaces
                    let titleClean = el.innerText.split('\n')[0].trim();
                    // Capitalize first letters for better presentation
                    titleClean = titleClean.charAt(0).toUpperCase() + titleClean.slice(1);

                    results.push({
                        title: titleClean,
                        company: companyName,
                        url: link,
                        date_found: new Date().toISOString(),
                        is_new: true
                    });
                }
            });

            // Deduplicate by URL
            return results.filter((v, i, a) => a.findIndex(t => (t.url === v.url)) === i);
        }, roles.map(r => r.keyword), company.name);

    } catch (e) {
        console.error("Smart scrape failed:", e.message);
        return [];
    }
}

// 2. WORKDAY (Difficult, SPA-heavy)
async function scrapeWorkday(page, company, roles) {
    console.log('Running Workday Strategy...');

    // Workday often redirects. We need to handle that.
    await page.goto(company.url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Workday Waiting: Wait for the main list container
    try {
        // Common Workday selectors
        await page.waitForSelector('[data-automation-id="jobTitle"], h3, ul[role="list"]', { timeout: 10000 });
    } catch (e) { console.log('Workday wait timeout - proceeding anyway'); }

    await autoScroll(page);

    return await page.evaluate((roleKeywords, companyName) => {
        const found = [];

        // Strategy: Find elements that commonly hold job titles in Workday
        // 1. Data attributes (most reliable)
        // 2. List items with headers

        const titleElements = Array.from(document.querySelectorAll('[data-automation-id="jobTitle"], h3 a'));

        titleElements.forEach(el => {
            const text = el.innerText.toLowerCase();
            const link = el.href || el.closest('a')?.href;

            if (!link) return;

            const matchedRole = roleKeywords.find(r => text.includes(r.toLowerCase()));

            if (matchedRole) {
                found.push({
                    title: el.innerText.trim(),
                    company: companyName,
                    url: link,
                    date_found: new Date().toISOString(),
                    is_new: true
                });
            }
        });
        return found;
    }, roles.map(r => r.keyword), company.name);
}

// 3. GREENHOUSE (Standard ATS)
async function scrapeGreenhouse(page, company, roles) {
    console.log('Running Greenhouse Strategy...');
    await page.goto(company.url, { waitUntil: 'domcontentloaded' });

    return await page.evaluate((roleKeywords, companyName) => {
        const results = [];
        // Greenhouse uses specific div structures. mostly "div.opening"
        const openings = Array.from(document.querySelectorAll('div.opening, tr.job-row'));

        openings.forEach(op => {
            const link = op.querySelector('a');
            if (!link) return;

            const text = link.innerText.toLowerCase();
            const matchedRole = roleKeywords.find(r => text.includes(r.toLowerCase()));

            if (matchedRole) {
                results.push({
                    title: link.innerText.trim(),
                    company: companyName,
                    url: link.href,
                    date_found: new Date().toISOString(),
                    is_new: true
                });
            }
        });
        return results;
    }, roles.map(r => r.keyword), company.name);
}

// 4. LEVER (Standard ATS)
async function scrapeLever(page, company, roles) {
    console.log('Running Lever Strategy...');
    await page.goto(company.url, { waitUntil: 'domcontentloaded' });

    return await page.evaluate((roleKeywords, companyName) => {
        const results = [];
        const postings = Array.from(document.querySelectorAll('a.posting-title, div.posting'));

        postings.forEach(p => {
            // Handle if 'p' is the link itself or a container
            const link = p.href ? p : p.querySelector('a');
            if (!link) return;

            const text = p.innerText.toLowerCase();
            const matchedRole = roleKeywords.find(r => text.includes(r.toLowerCase()));

            if (matchedRole) {
                // Clean title (Lever sometimes puts location in title tag)
                const rawTitle = p.querySelector('h5')?.innerText || link.innerText;

                results.push({
                    title: rawTitle.trim(),
                    company: companyName,
                    url: link.href,
                    date_found: new Date().toISOString(),
                    is_new: true
                });
            }
        });
        return results;
    }, roles.map(r => r.keyword), company.name);
}

// --- Custom Legacy Strategies (Improved) ---

// Google needs a specific URL structure or it fails. 
// We will update it to be more robust: Search Google's ABOUT page if provided URL fails.
async function scrapeGoogle(page, company, roles) {
    console.log("Running Google Strategy...");
    // If the provided URL is generic, force the known-good careers search URL
    // Otherwise use provided URL

    const results = [];

    for (const role of roles) {
        // Construct a direct search URL which is much more reliable
        const query = encodeURIComponent(role.keyword);
        const searchUrl = `https://www.google.com/about/careers/applications/jobs/results/?q=${query}&location=United%20States`;

        console.log(`Navigating to Google Search: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        const jobs = await page.evaluate((companyName) => {
            const items = Array.from(document.querySelectorAll('li'));
            const found = [];
            items.forEach(item => {
                const titleEl = item.querySelector('h3');
                const linkEl = item.querySelector('a');
                if (titleEl && linkEl) {
                    found.push({
                        title: titleEl.innerText.trim(),
                        company: companyName,
                        url: linkEl.href,
                        date_found: new Date().toISOString(),
                        is_new: true
                    });
                }
            });
            return found;
        }, company.name);
        results.push(...jobs);
    }

    return results;
}

// Netflix uses a React SPA. The generic crawler *might* work if auto-scrolling is enough,
// but their class names are obfuscated.
async function scrapeNetflix(page, company, roles) {
    console.log("Running Netflix Strategy...");
    // Netflix structure: https://jobs.netflix.com/search?q=Engineering

    const results = [];
    for (const role of roles) {
        const query = encodeURIComponent(role.keyword);
        const searchUrl = `https://jobs.netflix.com/search?q=${query}`;

        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        await autoScroll(page);

        const jobs = await page.evaluate((companyName) => {
            const links = Array.from(document.querySelectorAll('a[href*="/jobs/"]'));
            return links.map(link => {
                // The text usually contains the title
                const text = link.innerText;
                // Validation: Length check
                if (text.length > 5 && text.length < 100) {
                    return {
                        title: text.split('\n')[0],
                        company: companyName,
                        url: link.href,
                        date_found: new Date().toISOString(),
                        is_new: true
                    }
                }
                return null;
            }).filter(j => j);
        }, company.name);
        results.push(...jobs);
    }
    return results;
}

// --- Utilities ---
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports = { scrape };
