
import { asyncHandler } from './../../../middleware/asyncHandler.js';
import slugify from 'slugify'
import { create, findOne, updateOne, findOneAndUpdate } from './../../../../DB/DBmethods.js';
import gameModel from './../../../../DB/models/game.model.js';
import cloudinary from './../../../services/cloudinary.js';
import userModel from '../../../../DB/models/user.model.js';

const default_secure_url = 'https://res.cloudinary.com/dpiwjrxdt/image/upload/v1677598853/games/aGame_rnkyvh.jpg'
const default_public_id = 'games/aGame_rnkyvh'

export const addGame = asyncHandler(
    async (req, res, next) => {
        req.body.slug = slugify(req.body.name)
        const exists = await findOne({ model: gameModel, filter: { slug: req.body.slug } })
        if (!exists) {
            req.body.createdBy = req.user._id

            const image = req.file //unnecessary
            if (image) {
                var { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `/games/${req.user.userName}-${req.user._id}` })
            } else {
                //default icon
                secure_url = default_secure_url
                public_id = default_public_id
            }
            req.body.mainPic = { secure_url, public_id }
            const newGame = await create({ model: gameModel, data: req.body })
            return newGame ? res.status(201).json({ message: "done" }) : next(Error("Something went wrong", { cause: 400 }))
        } else {
            return next(Error("Game already exists", { cause: 409 }))
        }
    }
)

export const addGameVid = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        const vidExist = await findOne({ model: gameModel, filter: { _id: gameId }, select: "video" })
        const video = req.file
        if (video) {
            if (vidExist?.video) {
                await cloudinary.uploader.destroy(vidExist.video.public_id, { resource_type: "video" })
            }
            const cloudinaryResult = await cloudinary.uploader.upload(video.path, { folder: `games/${req.user.userName}-${req.user._id}/video`, resource_type: "video" })
            // console.log(cloudinaryResult)
            //.then(result => console.log(result)).catch(err => console.log(err))

            req.body.video = { secure_url: cloudinaryResult.secure_url, public_id: cloudinaryResult.public_id }

            const game = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId, createdBy: req.user._id }, data: req.body, options: { new: true }, select: "video" });
            return game ? res.status(200).json({ message: "done", game }) : next(Error("You don't have the permission ", { cause: 400 }))
        } else {
            return next(Error("please upload the image/s", { cause: 400 }))
        }
    }
)

export const addGamePics = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        if (!req.files) {
            return next(Error('please upload the image/s', { cause: 400 }));
        }
        const imageURLs = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `games/${req.user.userName}-${req.user._id}/pics` });
            imageURLs.push({ secure_url, public_id });
        }
        const game = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId, createdBy: req.user._id }, data: { $push: { pics: imageURLs } }, options: { new: true }, select: "pics" });
        return game ? res.status(200).json({ message: "done", game }) : next(Error("It's not your game", { cause: 400 }))
    }
)

export const removeGame = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        const exists = await findOne({ model: gameModel, filter: { _id: gameId, createdBy: req.user._id, isDeleted: false } })
        if (exists) {
            const deletedGame = await updateOne({ model: gameModel, filter: { _id: gameId }, data: { isDeleted: true } })
            if (deletedGame.modifiedCount) {
                // exists.video ? cloudinary.uploader.destroy(exists.video.public_id, { resource_type: "video" }) : null
                // exists.mainPic ? cloudinary.uploader.destroy(exists.mainPic.public_id) : null
                // for (const pic of exists.pics) {
                //     cloudinary.uploader.destroy(pic.public_id)
                // }
                return res.status(200).json({ message: "done" })
            } else {
                return next(Error("Something went wrong", { cause: 400 }))
            }
        } else {
            return next(Error("Invalid Game ID"))
        }
    }
)

export const updateGame = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        const game = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false } })
        if (game) {
            const ownerId = JSON.stringify(game.createdBy._id)
            const loggedUserId = JSON.stringify(req.user._id)
            if (req.body.name) {
                req.body.slug = slugify(req.body.name)
            }
            const image = req.file //unnecessary
            if (image) {
                var { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `/games/${req.user.userName}-${req.user._id}` })
                // remove old pic if not the default
                if (game.mainPic.public_id !== default_public_id) {
                    await cloudinary.uploader.destroy(game.mainPic.public_id)
                }
                req.body.mainPic = { secure_url, public_id }
            }

            if (ownerId === loggedUserId) {//updated by owner
                req.body.updatedBy = game.createdBy._id;
                const updatedGame = await updateOne({ model: gameModel, filter: { _id: gameId }, data: req.body })
                return updatedGame.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("Something went wrong", { cause: 400 }))
            } else if (req.user.role === roles.superAdmin) {// update by SA
                req.body.updatedBy = req.user._id;
                const updatedGame = await updateOne({ model: gameModel, filter: { _id: gameId }, data: req.body })
                return updatedGame.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("Something went wrong", { cause: 400 }))
            } else {
                return next(Error("You don't have the permission", { cause: 403 }))
            }

        } else {
            return next(Error("Invalid Game ID"))
        }
    }
)

// export const addRate = asyncHandler(
//     async (req, res, next) => {
//         const { gameId } = req.params
//         const { rate } = req.body
//         let indicator = false;
//         const theRate = { userId: req.user._id, rate }
//         const { ratings } = await findOne({ model: gameModel, filter: { _id: gameId }, select: "ratings" })
//         for (const rate of ratings) {
//             if (JSON.stringify(theRate.userId) === JSON.stringify(rate.userId)) {
//                 indicator = true
//             }
//         }

//         if (indicator) {
//             const update = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId }, data: { ratings: { $addToSet: { userId: req.user._id }, rate } }, options: { new: true }, select: "ratings" });
//             return update ? res.status(200).json({ message: "done", update }) : next(Error("Invalid Game ID", { cause: 400 }))
//         } else {
//             const update = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId }, data: { $addToSet: { ratings: theRate } }, options: { new: true }, select: "ratings" });
//             return update ? res.status(200).json({ message: "done", update }) : next(Error("Invalid Game ID", { cause: 400 }))
//         }
//     }
// )

// export const removeRate = asyncHandler(
//     async (req, res, next) => {
//         const { gameId } = req.params
//         const update = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId, isDeleted: false }, data: { $pull: { ratings: { userId: req.user._id } }, options: { new: true } }, select: "ratings" });
//         return update ? res.status(200).json({ message: "done", update }) : next(Error("Invalid Game ID", { cause: 400 }))
//     }
// )