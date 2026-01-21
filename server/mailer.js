const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendNewJobsEmail(userEmail, jobs) {
    if (!jobs || jobs.length === 0) return;

    const jobListHtml = jobs.map(job => `
    <li>
      <strong>${job.title}</strong> at ${job.company}<br>
      <a href="${job.url}">View Job</a>
    </li>
  `).join('');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Job Automation: Found ${jobs.length} New Jobs`,
        html: `
      <h2>New Jobs Found</h2>
      <ul>
        ${jobListHtml}
      </ul>
      <p>Check your dashboard for more details.</p>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = { sendNewJobsEmail };
