# Invenio 🕵️‍♂️
**Intelligent Job Opportunity Discovery Platform**

Invenio is a powerful, full-stack automated job scraping and tracking application designed to help you find invisible opportunities. It intelligently monitors career pages of your target companies (Adobe, Netflix, Google, etc.) and notifies you strictly when *new* roles appear.

Unlike generic scrapers, Invenio features an **Smart ATS Detection Engine** that automatically adapts its scraping strategy for complex platforms like **Workday**, **Greenhouse**, and **Lever**, as well as custom React-based career sites.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-MERN-green.svg)

## ✨ Features

*   **🧠 Intelligent Scraping Engine**: Automatically detects the underlying ATS (Workday, Greenhouse, etc.) and applies specialized strategies using Puppeteer.
*   **🎨 Premium UI**: Built with React & Tailwind CSS, featuring a clean "Graph Paper & Teal" aesthetic.
*   **📧 Automated Alerts**: Daily email summaries of strictly *fresh* job postings (last 24h).
*   **🛡️ Duplicate Protection**: Smart database logic ensures you never see the same job twice.
*   **☁️ Supabase Integration**: Robust PostgreSQL backend for tracking thousands of jobs and companies.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
*   **Backend**: Node.js, Express.js, Puppeteer (Headless Chrome)
*   **Database**: Supabase (PostgreSQL)
*   **Services**: Cron Jobs for scheduling, Nodemailer for alerts

---

## 🚀 Getting Started

Follow these instructions to set up Invenio on your local machine.

### 1. Prerequisites
*   Node.js (v18+)
*   A [Supabase](https://supabase.com) project (Free tier works great)
*   A Gmail account (for sending notifications)

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/sumanth-14/Invenio.git
cd Invenio
```

Install Backend Dependencies:
```bash
npm install
```

Install Frontend Dependencies:
```bash
cd client
npm install
cd ..
```

### 3. Configuration

Create a `.env` file in the **root** execution directory (`/Invenio/.env`) with the following keys:

```env
PORT=5000

# Supabase Credentials (found in Supabase Dashboard -> Settings -> API)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Settings (Use an App Password for Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 4. Database Setup

Go to your Supabase SQL Editor and run the schema script found in `supabase_schema.sql` (included in this repo). This will create the necessary `companies`, `roles`, and `jobs` tables.

### 5. Running the App

You need to run both the backend and frontend. It's recommended to use two terminal tabs.

**Terminal 1 (Backend):**
```bash
# From root directory
npm run dev
```
*Server runs on http://localhost:5000*

**Terminal 2 (Frontend):**
```bash
# From root directory
cd client
npm run dev
```
*Client runs on http://localhost:5173*

### 6. Usage

1.  Open `http://localhost:5173`.
2.  Go to **Settings**.
3.  Add **Target Roles** (e.g., "Software Engineer", "Frontend").
4.  Add **Target Companies** with their *Careers Page URL*.
    *   *Note: Invenio automatically handles Workday/Greenhouse URLs.*
5.  Click **"Run Scraper Now"** or wait for the daily 9 AM scheduled run.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
