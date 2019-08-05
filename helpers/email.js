// email by Joel
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const exphbs = require('express-handlebars');
const hbs = require('nodemailer-express-handlebars');

const config = require('../config/nodemailerConfig');
const hbsHelpers = require('./hbs');

const oAuth2 = google.auth.OAuth2;

module.exports = {
    send: async function(toEmail, subject, message) {
        const oauth2Client = new oAuth2(config.clientId, config.clientSecret, config.redirect);

        oauth2Client.setCredentials({ refresh_token: config.refreshToken });

        const accessToken = await oauth2Client.getAccessToken();

        // Deprecated
        // const token = await oauth2Client.refreshAccessToken();
        // const accessToken = token.credentials.access_token;

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
            console.log('\n\x1b[36mSending Email\x1b[0m');
            err ? console.log(err) : console.log(res);

            smtpTransport.close();
        });
    },
    sendTemplate: async function(toEmail, subject, template, context = {}) {
        const oauth2Client = new oAuth2(config.clientId, config.clientSecret, config.redirect);

        oauth2Client.setCredentials({ refresh_token: config.refreshToken });

        const accessToken = await oauth2Client.getAccessToken();

        // Depreciated
        // const token = await oauth2Client.refreshAccessToken();
        // const accessToken = token.credentials.access_token;

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
            template: template,
            context: context
        };

        smtpTransport.use('compile', hbs({
            viewEngine: exphbs.create({
                helpers: hbsHelpers,
                defaultLayout: 'email',
                layoutsDir: __dirname + '/../views/layouts',
                partialsDir: hbsHelpers.partialsDirs(__dirname + '/../views/partials')
            }),
            viewPath: __dirname + '/../views/emails/',
            extname: '.handlebars'
        }));

        smtpTransport.sendMail(mailOptions, (err, res) => {
            console.log('\n\x1b[36mSending Email\x1b[0m');
            err ? console.log(err) : console.log(res);

            smtpTransport.close();
        });
    },
}