import { asyncHandler } from './../../../middleware/asyncHandler.js';
import { findOne, create, findOneAndUpdate, findByIdAndUpdate, updateOne } from './../../../../DB/DBmethods.js';
import userModel from '../../../../DB/models/user.model.js'
import bcrypt from 'bcryptjs'
import CryptoJS from "crypto-js";
import jwt from 'jsonwebtoken'
import { sendEmail } from './../../../services/email.js';
import { checkUser } from './../../../services/checkUser.js';
import { nanoid } from 'nanoid';
import { calcDate } from './../../user/controller/user.js';
import cloudinary from '../../../services/cloudinary.js';

const defaultPublicId = "Users/xla2re0yabzzuzwt0jat";
const secureURL = "https://res.cloudinary.com/dpiwjrxdt/image/upload/v1677599795/Users/xla2re0yabzzuzwt0jat.webp";

export const signUp = asyncHandler(
    async (req, res, next) => {
        const { password, phone, DOB } = req.body;
        let { email, userName } = req.body;
        userName = userName.toLowerCase()
        email = email.toLowerCase();
        const checkEmail = await findOne({ model: userModel, filter: { email }, select: "email" });
        if (!checkEmail) {
            const checkUserName = await findOne({ model: userModel, filter: { userName }, select: "userName" });
            if (!checkUserName) {
                req.body.password = bcrypt.hashSync(password, +process.env.SALTROUND);
                req.body.phone = CryptoJS.AES.encrypt(phone, process.env.CRYPTPHONESECRET).toString();
                req.body.DOB = new Date(DOB);
                req.body.accountType = "system";
                const token = jwt.sign({ email }, process.env.SIGNUPKEY, { expiresIn: '24h' });
                const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;
                const message = `<h3>Follow the below link to confirm your email </h3> <h2><a href=${link}>Confirm<a/><h2/>`;
                const info = await sendEmail(email, 'Confirmation Email', message);
                if (info?.accepted?.length) {
                    const user = await create({ model: userModel, data: req.body });
                    return user ? res.status(201).json({ message: "done", details: "please confirm your email before login" }) : next(Error('Failed to signUp', { cause: 400 }));
                } else {
                    return next(Error('Invalid to send email, please try again', { cause: 400 }));
                }
            } else {
                return next(Error('userName already exists', { cause: 409 }));
            }
        } else {
            return next(Error('Email already exists', { cause: 409 }));
        }
    }
)

export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { token } = req.params;
        const decoded = jwt.decode(token, process.env.SIGNUPKEY);
        if (decoded?.email) {
            const profilePic = { secure_url: secureURL, public_id: defaultPublicId }
            const user = await findOneAndUpdate({ model: userModel, filter: { email: decoded.email, confirmEmail: false }, data: { confirmEmail: true, profilePic }, select: 'confirmEmail email', options: { new: true } });
            if (user) {
                return process.env.MODE == "DEV" ? res.status(200).json({ message: "done" }) : res.redirect(process.env.HEADERSHOST);
            } else {
                return next(Error('Email already confirmed', { cause: 400 }));
            }
        } else {
            return next(Error('Invalid token payload', { cause: 400 }));
        }
    }
)

export const signIn = asyncHandler(
    async (req, res, next) => {
        const { password } = req.body;
        let { email } = req.body;
        email = email.toLowerCase();
        const user = await findOne({ model: userModel, filter: { email }, select: "email password confirmEmail isDeleted isBlocked DOB" });
        if (user) {
            const match = bcrypt.compareSync(password, user.password);
            if (match) {
                const { err, cause } = checkUser(user, ['isDeleted', 'isBlocked', 'confirmEmail']);
                if (!err) {
                    const age = calcDate(user.DOB);
                    await findByIdAndUpdate({ model: userModel, filter: { _id: user._id }, data: { isOnline: true, age, lastSeen: null }, select: "email" });
                    const token = jwt.sign({ id: user._id }, process.env.SIGNINKEY, { expiresIn: '12h' });
                    return res.status(200).json({ message: "done", token });
                } else {
                    return next(Error(err, { cause }));
                }
            } else {
                return next(Error('Email password mismatch', { cause: 401 }));
            }
        } else {
            return next(Error('Email password mismatch', { cause: 401 }));
        }
    }
)

export const sendCode = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body;
        const user = await findOne({ model: userModel, filter: { email }, select: 'email isDeleted isBlocked confirmEmail' });
        if (user) {
            const { err, cause } = checkUser(user, ['isDeleted', 'isBlocked', 'confirmEmail']);
            if (!err) {
                const code = nanoid();
                const message = `<h3>Use the below code to recover your account </h3> <h2>${code}<h2/>`;
                const info = await sendEmail(email, 'Account recovery', message);
                if (info?.accepted?.length) {
                    await updateOne({ model: userModel, filter: { email }, data: { code } });
                    setTimeout(async () => {
                        await updateOne({ model: userModel, filter: { email }, data: { code: null } });
                    }, 60 * 60 * 1000);
                    return res.status(200).json({ message: "done", details: "check your email if is a valid email" });
                } else {
                    return next(Error('Invalid to send email, please try again', { cause: 400 }));
                }
            } else {
                return next(Error(err, { cause }))
            }
        } else {
            return res.status(200).json({ message: "done", details: "check your email if is a valid email" })
        }
    }
)

export const recoverPassword = asyncHandler(
    async (req, res, next) => {
        const { email, code, newPassword } = req.body;
        const user = await findOne({ model: userModel, filter: { email }, select: 'email isDeleted isBlocked confirmEmail code' });
        if (user) {
            const { err, cause } = checkUser(user, ['isDeleted', 'isBlocked', 'confirmEmail']);
            if (!err) {
                if (user.code == code && code != null) {
                    const hash = bcrypt.hashSync(newPassword, +process.env.SALTROUND);
                    await updateOne({ model: userModel, filter: { email }, data: { password: hash, code: null } });
                    return res.status(200).json({ message: "done" });
                } else {
                    return next(Error("Invalid code or email", { cause: 400 }))
                }
            } else {
                return next(Error(err, { cause }))
            }
        } else {
            return next(Error("Invalid code or email", { cause: 400 }))
        }
    }
)

export const googleFail = asyncHandler(
    (req, res) => {
        return res.status(400).json({ message: "Fail to login" })
    }
)

export const googleSign = asyncHandler(
    async (req, res, next) => {
        const { provider, displayName, given_name, family_name,
            email_verified, email, picture, id } = req.user
        if (!email_verified) {
            return next(Error("In-valid google account", { cause: 400 }))
        }
        const user = await findOne({ model: userModel, filter: { email } })
        if (user) {
            const { err, cause } = checkUser(user, ['isDeleted isBlocked']);
            if (err) {
                return next(Error(err, { cause }));
            }
            await findByIdAndUpdate({ model: userModel, filter: { _id: user._id }, data: { isOnline: true }, select: "email" });
            const token = jwt.sign({ id: user._id },
                process.env.SIGNINKEY, { expiresIn: '12h' })
            return res.json({ message: "done", token })
        }
        //Random password
        const code = nanoid();
        const hash = bcrypt.hashSync(code, +process.env.SALTROUND)
        // signup
        const userName = email.split('@')[0] + id;
        const newUser = await userModel.create({
            userName,
            firstName: given_name,
            lastName: family_name,
            email,
            confirmEmail: true,
            accountType: provider,
            password: hash,
            DOB: Date.now()
        })
        await cloudinary.uploader.upload(picture, { folder: `Users/${userName}-${newUser._id}/profilePic` })
        const token = jwt.sign({ id: newUser._id, isOnline: true }, process.env.SIGNINKEY)
        return res.json({ message: "done", token })
    }
)
