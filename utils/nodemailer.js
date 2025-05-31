require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (options)=>{
    // console.log(process.env.pass)
    // console.log(process.env.user)
    //sending a mail to a particlar user/receipent by invoking options
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: process.env.SERVICE,
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.APP_USERNAME,
         //generate password from gmail
          pass: process.env.APP_PASSWORD,
        },
        // tls: {
        //     rejectUnauthorized: false, // to bypass ssl verification
        // }
});

async function main() {
    //send mail witbh defined transport object

    const info = await transporter.sendMail({
        from: `"Campus Trade" <${process.env.user}>`, // sender address
        to: options.email, // list of receivers
        subject: options.subject, 
        html: options.html,
    });
     console.log("Message sent: %s", info.messageId)
}
main().catch(console.error);

}
module.exports = { sendEmail }