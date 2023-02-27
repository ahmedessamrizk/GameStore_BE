import nodemailer from "nodemailer"
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(dirname, '../../config/.env') })

export const sendEmail = async (dest, subject, message, attachments = []) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDEREMAIL,
        pass: process.env.SENDERPASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    let info = await transporter.sendMail({
      from: 'GameStore <${process.env.SENDEREMAIL}>',
      to: dest,
      subject,
      html: message,
      attachments
    })
    return info
  } catch (error) {
    console.log(error);
  }
}
