
import { asyncHandler } from './../../../middleware/asyncHandler.js';
import slugify from 'slugify'
import { create, findOne, updateOne, findOneAndUpdate } from './../../../../DB/DBmethods.js';
import gameModel from './../../../../DB/models/game.model.js';
import cloudinary from './../../../services/cloudinary.js';
import userModel from '../../../../DB/models/user.model.js';
import pushNotify, { activityMessages } from '../../../services/pushNotify.js';

const default_secure_url = 'https://res.cloudinary.com/dpiwjrxdt/image/upload/v1678110447/games/default_game_lcm7d0.jpg'
const default_public_id = 'games/default_game_lcm7d0'

export const addGame = asyncHandler(
    async (req, res, next) => {
        req.body.slug = slugify(req.body.name)
        const exists = await findOne({ model: gameModel, filter: { slug: req.body.slug } })
        if (!exists) {
            req.body.createdBy = req.user._id
            const image = req.file //unnecessary
            if (image) {
                var { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `/games/${req.body.slug}/mainPic` })
            } else {
                //default icon
                secure_url = default_secure_url
                public_id = default_public_id
            }
            req.body.mainPic = { secure_url, public_id }
            const newGame = await create({ model: gameModel, data: req.body })
            if (newGame) {
                pushNotify({ to: req.user._id, message: activityMessages.addGame, gameId: newGame._id, type: "A" })
                return res.status(201).json({ message: "done" });
            } else {
                return next(Error("Something went wrong", { cause: 400 }));
            }
        } else {
            return next(Error("Game already exists", { cause: 409 }))
        }
    }
)

export const addGameVid = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        const vidExist = await findOne({ model: gameModel, filter: { _id: gameId }, select: "video slug" })
        const video = req.file
        if (video) {
            if (vidExist?.video?.public_id) {
                await cloudinary.uploader.destroy(vidExist?.video?.public_id, { resource_type: "video" });
            }
            const cloudinaryResult = await cloudinary.uploader.upload(video.path, { folder: `games/${vidExist?.slug}/video`, resource_type: "video" });
            req.body.video = { secure_url: cloudinaryResult.secure_url, public_id: cloudinaryResult.public_id }
            const game = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId, createdBy: req.user._id }, data: req.body, options: { new: true }, select: "video" });
            pushNotify({ to: req.user._id, message: activityMessages.addGameVid, gameId, type: "A" })
            return game ? res.status(200).json({ message: "done", game }) : next(Error("You don't have the permission ", { cause: 400 }))
        } else {
            return next(Error("please upload the video", { cause: 400 }))
        }
    }
)

export const addGamePics = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        const exists = await findOne({ model: gameModel, filter: { _id: gameId, createdBy: req.user._id } })
        if (!exists) {
            return next(Error('Invalid gameId', { cause: 404 }));
        }
        if (!req.files) {
            return next(Error('please upload the image/s', { cause: 400 }));
        }
        const imageURLs = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `games/${exists.slug}/pics` });
            imageURLs.push({ secure_url, public_id });
        }
        const game = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId, createdBy: req.user._id }, data: { $push: { pics: imageURLs } }, options: { new: true }, select: "pics" });
        pushNotify({ to: req.user._id, message: activityMessages.addGamePics, gameId, type: "A" })
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
                pushNotify({ to: req.user._id, message: activityMessages.removeGame, gameId, type: "A" })
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
        const game = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false, createdBy: req.user._id } })
        if (game) {
            const ownerId = JSON.stringify(game.createdBy._id)
            const loggedUserId = JSON.stringify(req.user._id)
            if (req.body.name) {
                req.body.slug = slugify(req.body.name)
            }
            const image = req.file //unnecessary
            if (image) {
                var { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `/games/${game.slug}/mainPic` })
                // remove old pic if not the default
                if (game.mainPic.public_id !== default_public_id) {
                    await cloudinary.uploader.destroy(game.mainPic.public_id)
                }
                req.body.mainPic = { secure_url, public_id }
            }

            if (ownerId === loggedUserId) {//updated by owner
                req.body.updatedBy = game.createdBy._id;
                const updatedGame = await updateOne({ model: gameModel, filter: { _id: gameId }, data: req.body })
                if (updatedGame.modifiedCount) {
                    pushNotify({ to: req.user._id, message: activityMessages.updateGame, gameId, type: "A" })
                    return res.status(200).json({ message: "done" });
                } else {
                    return next(Error("Something went wrong", { cause: 400 }))
                }
            } else {
                return next(Error("You don't have the permission", { cause: 403 }))
            }

        } else {
            return next(Error("Invalid Game ID"))
        }
    }
)

