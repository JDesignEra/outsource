const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const config = require('../config/nodemailerConfig');
const oAuth2 = google.auth.OAuth2;

module.exports = {
    send: async function(toEmail, subject, message) {
        const oauth2Client = new oAuth2(config.clientId, config.clientSecret, config.redirect);

        oauth2Client.setCredentials({ refresh_token: config.refreshToken });

        const token = await oauth2Client.refreshAccessToken();
        const accessToken = token.credentials.access_token;

        const smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: config.type,
                user: config.user,
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                refreshToken: config.refreshToken,
                accessToken: accessToken
            }
        });

        const mailOptions = {
            from: `Outsource <${config.user}>`,
            to: toEmail,
            subject: subject,
            generateTextFromHtml: true,
            html: message
        };

        smtpTransport.sendMail(mailOptions, (err, res) => {
            err ? console.log(err) : console.log(res);

            smtpTransport.close();
        });
    }
}