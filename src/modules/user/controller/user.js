import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../middleware/asyncHandler.js";
import { findByIdAndUpdate, findById, updateOne, find } from './../../../../DB/DBmethods.js';
import CryptoJS from "crypto-js";
import cloudinary from './../../../services/cloudinary.js';
import { roles } from "../../../../DB/models/user.model.js";
import bcrypt from 'bcryptjs'

let privateData = '-isDeleted -confirmEmail -isBlocked -password -code';

export const calcDate = (date) => {
    const crrDate = new Date();
    let difference = crrDate.getTime() - date.getTime();
    const years = Math.ceil(difference / (1000 * 3600 * 24));
    return Math.floor(years / 365);
}

//update: userName firstName lastName DOB phone gender photos
export const updateProfile = asyncHandler(
    async (req, res, next) => {
        let { phone, DOB } = req.body;
        if (phone) {
            req.body.phone = CryptoJS.AES.encrypt(phone, process.env.CRYPTPHONESECRET).toString();
        }
        if (DOB) {
            DOB = new Date(DOB);
            req.body.age = calcDate(DOB);
        }
        const updatedUser = await findByIdAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: req.body, options: { new: true }, select: privateData });
        const bytes = CryptoJS.AES.decrypt(updatedUser.phone, process.env.CRYPTPHONESECRET);
        updatedUser.phone = bytes.toString(CryptoJS.enc.Utf8);
        return res.status(200).json({ message: "done", updatedUser })
    }
)

export const addProfilePic = asyncHandler(
    async (req, res, next) => {
        if (!req.file) {
            return next(Error('please upload the image', { cause: 400 }));
        }
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `Users/${req.user.userName}-${req.user._id}/profilePic` });
        req.body.profilePic = { secure_url, public_id };
        const updatedUser = await findByIdAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: req.body, options: { new: true }, select: "profilePic" });
        return res.status(200).json({ message: "done", updatedUser })
    }
)

export const addCovPics = asyncHandler(
    async (req, res, next) => {
        if (!req.files) {
            return next(Error('please upload the image/s', { cause: 400 }));
        }
        const imageURLs = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `Users/${req.user.userName}-${req.user._id}/covPics` });
            imageURLs.push({ secure_url, public_id });
        }
        req.body.coverPics = imageURLs;
        const updatedUser = await findByIdAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: req.body, options: { new: true }, select: "coverPics" });
        return res.status(200).json({ message: "done", updatedUser })
    }
)

//user can delete or block his account
//superAdmin can delete or block anyone
export const deleteUser = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const user = await findById({ model: userModel, filter: { _id: userId }, select: 'userName' })
        if (!user) {
            return next(Error('not registered account', { cause: 404 }));
        }
        let deleteUser;
        if (userId == req.user._id) {
            deleteUser = await updateOne({ model: userModel, filter: { _id: userId }, data: { isDeleted: true } });
        } else {
            if (req.user.role == roles.superAdmin) {
                deleteUser = await updateOne({ model: userModel, filter: { _id: userId, role: { $ne: roles.superAdmin } }, data: { isDeleted: true } });
            }
        }
        return deleteUser?.modifiedCount ? res.status(200).json({ message: "done" }) : res.status(200).json({ message: "you don't have the permission" });
    }
)

export const blockUser = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const checkUser = await findById({ model: userModel, filter: { _id: userId }, select: 'userName' })
        if (!checkUser) {
            return next(Error('not registered account', { cause: 404 }));
        }
        let deleteUser;
        if (userId == req.user._id) {
            deleteUser = await updateOne({ model: userModel, filter: { _id: userId }, data: { isBlocked: true } });
        } else {
            if (req.user.role == roles.superAdmin) {
                deleteUser = await updateOne({ model: userModel, filter: { _id: userId, role: { $ne: roles.superAdmin } }, data: { isBlocked: true } });
            }
        }
        return deleteUser?.modifiedCount ? res.status(200).json({ message: "done" }) : res.status(200).json({ message: "you don't have the permission" });
    }
)

export const addRole = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const checkUser = await findById({ model: userModel, filter: { _id: userId }, select: 'userName' })
        if (!checkUser) {
            return next(Error('not registered account', { cause: 404 }));
        }
        const { role } = req.body;
        const user = await updateOne({ model: userModel, filter: { _id: userId, role: { $ne: roles.superAdmin } }, data: { role } });
        return user.modifiedCount ? res.status(200).json({ message: "done" }) : res.status(200).json({ message: "you don't have the permission" });
    }
)

export const addFollowing = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const checkUser = await findById({ model: userModel, filter: { _id: userId }, select: 'userName' })
        if (!checkUser) {
            return next(Error('not registered account', { cause: 404 }));
        }
        const user = await findByIdAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: { $addToSet: { following: userId }, options: { new: true } } });
        return user ? res.status(200).json({ message: "done" }) : res.status(200).json({ message: "failed to add" });
    }
)

export const removeFollowing = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const checkUser = await findById({ model: userModel, filter: { _id: userId }, select: 'userName' })
        if (!checkUser) {
            return next(Error('not registered account', { cause: 404 }));
        }
        const user = await findByIdAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: { $pull: { following: userId }, options: { new: true } } });
        return user ? res.status(200).json({ message: "done" }) : res.status(200).json({ message: "failed to add" });
    }
)

export const updatePassword = asyncHandler(
    async (req, res, next) => {
        //cPassword
        const { oldPassword, newPassword } = req.body;
        const user = await findById({ model: userModel, filter: { _id: req.user._id } });
        const match = bcrypt.compareSync(oldPassword, user.password);
        if (match) {
            const hash = bcrypt.hashSync(newPassword, +process.env.SALTROUND);
            const update = await updateOne({ model: userModel, filter: { _id: req.user._id }, data: { password: hash } });
            return update.modifiedCount ? res.status(200).json({ message: "done" }) : res.status(200).json({ message: "failed to update password" })
        } else {
            return next(Error('Invalid password', { cause: 401 }));
        }
    }
)

export const getProfile = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        let user;
        //anotherUser
        if (id) {
            user = await findById({
                model: userModel, filter: { _id: id }, select: privateData,
                populate: [
                    {
                        path: 'following',
                        select: 'firstName lastName userName'
                    }
                ]
            })
        } else {    //ownProfile
            user = await findById({
                model: userModel, filter: { _id: req.user._id }, select: privateData,
                populate: [
                    {
                        path: 'following',
                        select: 'firstName lastName userName'
                    }
                ]
            })
        }
        const bytes = CryptoJS.AES.decrypt(user.phone, process.env.CRYPTPHONESECRET);
        user.phone = bytes.toString(CryptoJS.enc.Utf8);
        return res.status(200).json({ message: "done", user })
    }
)

export const signOut = asyncHandler(
    async (req, res, next) => {
        await updateOne({ model: userModel, filter: { _id: req.user._id }, data: { lastSeen: Date.now(), isOnline: false } });
        return res.status(200).json({ message: "done" });
    }
)
//filter by userName 
export const getUsers = asyncHandler(
    async (req, res, next) => {
        const { userNameQ } = req.query;
        const users = await userModel.find({ userName: { $regex: `^${userNameQ}` } }, { isDeleted: 0, isBlocked: 0, confirmEmail: 0, password: 0, code: 0 }).populate([
            {
                path: 'following',
                select: 'firstName lastName userName'
            }
        ])
        return res.status(200).json({ message: "done", users });
    }
)