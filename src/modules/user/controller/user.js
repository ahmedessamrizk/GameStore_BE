import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../middleware/asyncHandler.js";
import { findByIdAndUpdate, findById, updateOne, find, findOne, findOneAndUpdate } from './../../../../DB/DBmethods.js';
import CryptoJS from "crypto-js";
import cloudinary from './../../../services/cloudinary.js';
import { roles } from "../../../../DB/models/user.model.js";
import bcrypt from 'bcryptjs'
import { checkUser } from "../../../services/checkUser.js";
import { calcDate } from '../../../services/calcDate.js';
import gameModel from './../../../../DB/models/game.model.js';
import genreModel from './../../../../DB/models/genre.model.js';
import { paginate } from "../../../services/pagination.js";

export const privateData = '-isDeleted -confirmEmail -isBlocked -password -code -accountType -activity -notifications';
const secureURL = "https://res.cloudinary.com/dpiwjrxdt/image/upload/v1677599795/Users/xla2re0yabzzuzwt0jat.webp";

//update: firstName lastName DOB phone gender photos
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
        //const exist = await findOne({ model: userModel, filter: { userName }, select: 'userName' });
        //if (exist) {
        //  return next(Error('duplicated userName', { cause: 409 }));
        //}
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
        //Delete old image but not default image
        const { profilePic } = await findById({ model: userModel, filter: { _id: req.user._id }, select: 'profilePic' });
        if (profilePic.secure_url !== secureURL) {
            cloudinary.uploader.destroy(profilePic.public_id);
        }

        //upload new image
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
        const { coverPics } = await findById({ model: userModel, filter: { _id: req.user._id }, select: 'coverPics' });
        for (const pic of coverPics) {
            cloudinary.uploader.destroy(pic.public_id);
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

export const deleteUser = asyncHandler(
    async (req, res, next) => {
        //check target userId
        const { userId } = req.params;
        const user = await findById({ model: userModel, filter: { _id: userId }, select: 'userName isDeleted isBlocked' })

        const { err, cause } = checkUser(user, ['isDeleted', 'isBlocked']);
        if (err) {
            return next(Error(err, { cause }));
        }
        let deleteUser;
        //user can delete or block his account
        if (userId == req.user._id) {
            deleteUser = await updateOne({ model: userModel, filter: { _id: userId }, data: { isDeleted: true } });
        } else {//superAdmin can delete or block anyone
            if (req.user.role == roles.superAdmin) {
                deleteUser = await updateOne({ model: userModel, filter: { _id: userId, role: { $ne: roles.superAdmin } }, data: { isDeleted: true } });
            }
        }
        return deleteUser?.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("you don't have the permission", { cause: 403 }));
    }
)

export const unDeleteUser = asyncHandler(
    async (req, res, next) => {
        //check target userId
        const { userId } = req.params;
        const user = await findById({ model: userModel, filter: { _id: userId }, select: 'userName isDeleted isBlocked' })
        const { err, cause } = checkUser(user, ['isBlocked']);
        if (err) {
            return next(Error(err, { cause }));
        }
        const deleteUser = await updateOne({ model: userModel, filter: { _id: userId, role: { $ne: roles.superAdmin } }, data: { isDeleted: false } });
        return deleteUser?.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("you don't have the permission", { cause: 403 }));
    }
)

export const blockUser = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const user = await findById({ model: userModel, filter: { _id: userId }, select: 'userName isDeleted isBlocked' })
        const { err, cause } = checkUser(user, ['isDeleted', 'isBlocked']);
        if (err) {
            return next(Error(err, { cause }));
        }
        const deleteUser = await updateOne({ model: userModel, filter: { _id: userId, role: { $ne: roles.superAdmin } }, data: { isBlocked: true } });
        return deleteUser?.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("you don't have the permission", { cause: 403 }));
    }
)

export const unBlockUser = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const user = await findById({ model: userModel, filter: { _id: userId }, select: 'userName isDeleted isBlocked' })
        const { err, cause } = checkUser(user, ['isDeleted']);
        if (err) {
            return next(Error(err, { cause }));
        }
        const deleteUser = await updateOne({ model: userModel, filter: { _id: userId, role: { $ne: roles.superAdmin } }, data: { isBlocked: false } });
        return deleteUser?.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("you don't have the permission", { cause: 403 }));
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
        const user = await updateOne({ model: userModel, filter: { _id: userId }, data: { role } });
        return user.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("you don't have the permission", { cause: 403 }));
    }
)

export const addFollowing = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        if (JSON.stringify(userId) == JSON.stringify(req.user._id)) {
            return next(Error("user can't follow himself", { cause: 400 }))
        }
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
                model: userModel, filter: { _id: id }, select: privateData + '-wishList',
                populate: [
                    {
                        path: 'following',
                        select: 'firstName lastName userName profilePic isBlocked isDeleted'
                    }

                ]
            })
        } else {    //ownProfile
            user = await findById({
                model: userModel, filter: { _id: req.user._id }, select: privateData,
                populate: [
                    {
                        path: 'following',
                        select: 'firstName lastName userName profilePic isBlocked isDeleted'
                    }
                ]
            })
        }
        if(user.phone){
            const bytes = CryptoJS.AES.decrypt(user.phone, process.env.CRYPTPHONESECRET);
            user.phone = bytes.toString(CryptoJS.enc.Utf8);
        }
        let result = JSON.stringify(user);
        result = JSON.parse(result);
        for(let i = 0;i < result.following.length;i++){
            if(result.following[i].isDeleted === true || result.following[i].isBlocked === true){

                result.following.splice(i,1);
                i--;
            }
        }
        
        return res.status(200).json({ message: "done", user:result })
    }
)

export const signOut = asyncHandler(
    async (req, res, next) => {
        let date = new Date()
        const result = await findOneAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: { lastSeen: date, isOnline: false }, options: { new: true } });
        return res.status(200).json({ message: "done" });
    }
)
//filter by userName 
export const getUsers = asyncHandler(
    async (req, res, next) => {
        let { userNameQ } = req.query;
        let users;
        if (userNameQ) {
            userNameQ = userNameQ?.toLowerCase();
            users = await userModel.find({ userName: { $regex: `^${userNameQ}` }, isDeleted: false, isBlocked: false }).select(privateData + ' -wishList').populate([
                {
                    path: 'following',
                    select: 'firstName lastName userName'
                }
            ])
        } else {
            if (req.user.role === roles.superAdmin) {
                users = await userModel.find({}).select("-password -code -wishlist -code -activity -notifications")
            } else {
                users = await userModel.find({ isDeleted: false, isBlocked: false }).select(privateData + ' -wishList').populate([
                    {
                        path: 'following',
                        select: 'firstName lastName userName'
                    }
                ])
            }

        }
        users.forEach(user => {
            if (user.phone) {
                user.phone = CryptoJS.AES.decrypt(user.phone, process.env.CRYPTPHONESECRET).toString(CryptoJS.enc.Utf8);
            }
        });
        return res.status(200).json({ message: "done", users });
    }
)


export const AddToWishList = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params;
        const exist = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false }, select: 'name' });
        if (!exist) {
            return next(Error('game not exist', { cause: 404 }));
        }
        const update = await findByIdAndUpdate({
            model: userModel, filter: { _id: req.user._id },
            data: { $addToSet: { wishList: gameId } }, options: { new: true }, select: 'wishList'
        });
        return res.status(200).json({ message: "done", update })
    }
)

export const removeFromWishList = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params;
        const exist = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false }, select: 'name' });
        if (!exist) {
            return next(Error('game not exist', { cause: 404 }));
        }
        const update = await findByIdAndUpdate({
            model: userModel, filter: { _id: req.user._id },
            data: { $pull: { wishList: gameId } }, options: { new: true }, select: 'wishList'
        });
        return res.status(200).json({ message: "done", update })
    }
)

export const getWishList = asyncHandler(
    async (req, res, next) => {
        let { wishList } = await findById({
            model: userModel, filter: { _id: req.user._id }, select: 'wishList', populate: [
                {
                    path: 'wishList',
                    select: 'mainPic name desc price slug'
                }
            ]
        });
        /*const newWishList = [];
        wishList = wishList.toObject();
        for (const gameId of wishList) {
            const game = await findById({model: gameModel, filter:{_id: gameId, isDeleted: false}, select: 'mainPic name desc price'});
            if (game) {
                newWishList.push(game);
            } 
        }*/
        return res.status(200).json({ message: "done", wishList })
    }
)

export const getActivities = asyncHandler(
    async (req, res, next) => {
        const { page, size } = req.query
        const { skip, limit } = paginate(page, size)
        const user = await findById({ model: userModel, filter: { _id: req.user._id }, select: 'activity', skip, limit });
        return res.status(200).json({ message: "done", user })
    }
)

export const getNotifications = asyncHandler(
    async (req, res, next) => {
        const user = await findById({ model: userModel, filter: { _id: req.user._id }, select: 'notifications' });
        return res.status(200).json({ message: "done", user })
    }
)
