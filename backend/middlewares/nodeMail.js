import nodemailer from 'nodemailer';

const sendMailToSuppliers = async (emailId, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.ADMIN_GMAIL,
                pass: process.env.ADMIN_GMAIL_PASS
            }
        });

        const mailOptions = {
            from: {
                name: 'Admin',
                address: process.env.ADMIN_GMAIL
            },
            to: emailId,
            subject: subject,
            text: message
        };

        return transporter.sendMail(mailOptions); // Send email
    } catch (error) {
        console.error('Error occurred:', error);
        throw new Error('Failed to send email');
    }
};

export default sendMailToSuppliers;
