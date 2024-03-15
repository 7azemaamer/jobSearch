import nodemailer from "nodemailer"
async function sendEmail({ to, cc, bcc, html, subject, attachment = [] } = {}) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  let info = await transporter.sendMail({
    from: `Job Searches job@jobsearches.com`,
    to,
    cc,
    bcc,
    html,
    subject,
    attachment,
  })
  return info.rejected.length ? false : true
}

export default sendEmail
