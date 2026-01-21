# JobHunter - Automated Job Application Assistant

## Prerequisites
- Node.js installed
- Supabase account and project set up (tables created using `supabase_schema.sql`)
- Gmail account with App Password (if using email notifications)

## Setup

1.  **Backend Setup**
    - Create a `.env` file in the root directory `e:/JobAutomation/` with the following content:
      ```
      PORT=5000
      SUPABASE_URL=your_supabase_url
      SUPABASE_ANON_KEY=your_supabase_anon_key
      EMAIL_USER=your_email@gmail.com
      EMAIL_PASS=your_gmail_app_password
      ```
    - Install backend dependencies:
      ```bash
      npm install
      ```

2.  **Frontend Setup**
    - Navigate to the client directory:
      ```bash
      cd client
      ```
    - Install frontend dependencies:
      ```bash
      npm install
      ```

## Running the Application

You need to run the **Backend** and **Frontend** in two separate terminal windows.

### Terminal 1: Backend
The backend handles web scraping, database storage, and email composition.

```bash
# From the root directory (e:/JobAutomation)
npm start
```
*You should see "Server is running on port 5000".*

### Terminal 2: Frontend
The frontend provides the user interface for the dashboard and settings.

```bash
# From the root directory (e:/JobAutomation)
cd client
npm run dev
```
*You should see "Local: http://localhost:5173/".*

## Usage
1.  Open your browser and go to `http://localhost:5173`.
2.  Go to **Settings**.
3.  Add **Job Roles** (e.g., "Software Engineer") and **Companies** (e.g., "Netflix", "Google").
4.  Click **"Run Scraper Now"** to trigger an immediate scrape.
5.  Check the Dashboard for results.

## Troubleshooting
- If the dashboard is empty, check the Backend terminal logs for scraping activity.
- If scraping fails, ensure your `.env` variables are correct.
