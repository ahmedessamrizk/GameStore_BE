
import { asyncHandler } from './../../../middleware/asyncHandler.js';
import slugify from 'slugify'
import { create, findOne, updateOne, findOneAndUpdate, find } from './../../../../DB/DBmethods.js';
import gameModel from './../../../../DB/models/game.model.js';
import cloudinary from './../../../services/cloudinary.js';
import userModel, { roles } from '../../../../DB/models/user.model.js';
import pushNotify, { activityMessages } from '../../../services/pushNotify.js';
import { privateData } from './../../user/controller/user.js';
import CryptoJS from 'crypto-js';
import { paginate } from '../../../services/pagination.js';
import genreModel from '../../../../DB/models/genre.model.js';
import rateModel from './../../../../DB/models/rate.model.js';


const default_secure_url = 'https://res.cloudinary.com/dpiwjrxdt/image/upload/v1678110447/games/default_game_lcm7d0.jpg'
const default_public_id = 'games/default_game_lcm7d0'

export const addGame = asyncHandler(
    async (req, res, next) => {
        req.body.slug = slugify(req.body.name).toLowerCase()
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
        let exists;
        if (req.user.role === roles.superAdmin) {
            exists = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false } })
        } else {
            exists = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false } })
        }

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

export const unRemoveGame = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        let exists;
        if (req.user.role === roles.superAdmin) {
            exists = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: true } })
        } else {
            exists = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: true } })
        }
        if (exists) {
            const undelete = await updateOne({ model: gameModel, filter: { _id: gameId }, data: { isDeleted: false } })
            if (undelete.modifiedCount) {
                // exists.video ? cloudinary.uploader.destroy(exists.video.public_id, { resource_type: "video" }) : null
                // exists.mainPic ? cloudinary.uploader.destroy(exists.mainPic.public_id) : null
                // for (const pic of exists.pics) {
                //     cloudinary.uploader.destroy(pic.public_id)
                // }
                pushNotify({ to: req.user._id, message: activityMessages.unRemoveGame, gameId, type: "A" })
                return res.status(200).json({ message: "done" })
            } else {
                return next(Error("Something went wrong", { cause: 400 }))
            }
        } else {
            return next(Error("Invalid Game ID"))
        }
    }
)

export const removeImage = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        const { publicId } = req.body
        const game = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false, createdBy: req.user._id }, select: "pics createdBy" })
        if (game) {
            const ownerId = JSON.stringify(game.createdBy._id)
            const loggedUserId = JSON.stringify(req.user._id)

            if (ownerId === loggedUserId) {//remove by owner
                const updatedGame = await findOneAndUpdate({ model: gameModel, filter: { _id: gameId }, data: { $pull: { pics: { public_id: publicId } } }, options: { new: true }, select: "pics" })
                await cloudinary.uploader.destroy(publicId)
                if (updatedGame) {
                    pushNotify({ to: req.user._id, message: activityMessages.removeGamePic, gameId, type: "A" })
                    return res.status(200).json({ message: "done", game: updatedGame });
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
export const updateGame = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        const game = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false, createdBy: req.user._id } })
        if (game) {
            const ownerId = JSON.stringify(game.createdBy._id)
            const loggedUserId = JSON.stringify(req.user._id)
            if (req.body.name) {
                req.body.slug = slugify(req.body.name).toLowerCase()
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

export const getGame = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params
        console.log(gameId)
        const { userid } = req.headers
        let userRate;
        if (userid) {
            userRate = await findOne({ model: rateModel, filter: { userId: userid, gameId } });
        }
        const game = await findOne({
            model: gameModel, filter: { _id: gameId, isDeleted: false }, select: "-isDeleted",
            populate: [
                {
                    path: "createdBy",
                    select: privateData + " -DOB -wishList -following -coverPics -createdAt -updatedAt -notifications"

                },
                {
                    path: "updatedBy",
                    select: privateData + " -DOB -wishList -following -coverPics -createdAt -updatedAt -notifications"
                },
                {
                    path: "genreId",
                },
            ]
        })
        if (game) {
            console.log("yeeeeeeeeeeees")
            game.toObject()

            let result;
            if (userid) {
                result = JSON.stringify(game);
                result = JSON.parse(result);
                userRate ? result.userRate = userRate.value : result.userRate = 0
                return res.status(200).json({ message: "done", game: result })
            }
            return res.status(200).json({ message: "done", game })

        } else {
            return next(Error("Invalid game ID", { cause: 404 }))
        }
    }
)

export const getHomeGames = asyncHandler(
    async (req, res, next) => {
        //pagination 
        let { page, size } = req.query
        const { skip, limit } = paginate(page, size)
        if (!size) {
            size = 18;
        }

        //sort
        let { avgRate, price, alpha, released, lastAdded } = req.query
        const sort = {}
        if (avgRate) {
            sort.avgRate = avgRate
        }
        if (price) {
            sort.price = price
        }
        if (alpha) {
            sort.alpha = alpha
        }
        if (released) {
            sort.released = released
        }
        if (lastAdded) {
            sort.createdAt = lastAdded
        } else {
            sort.createdAt = -1
        }


        //filter by
        let { genre, search } = req.query
        const filter = {}
        if (genre) {
            genre = genre.toLowerCase()
            const searchByGenre = await findOne({ model: genreModel, filter: { slug: genre, isDeleted: false }, select: "_id" })
            if (searchByGenre?._id) {
                filter.genreId = searchByGenre._id
            } else {
                return next(Error("Genre Not found", { cause: 404 }))
            }
        }
        if (search) {
            filter.name = { $regex: `${search}`, $options: 'i' }
        }

        filter.isDeleted = false;
        const games = await find({
            model: gameModel, filter, select: "-updatedBy", skip, limit,
            populate: [
                {
                    path: "createdBy",
                    select: privateData + " -phone -email -DOB -wishList -following -coverPics -createdAt -updatedAt -notifications"

                },
                {
                    path: "genreId",
                },
            ],
            sort
        })
        gameModel.count(filter).exec(function (err, count) {
            let totalGames = count
            const pages = Math.ceil(totalGames / size);
            return res.status(200).json({ message: "done", pages, games })
        })
    }
)

export const getGamesControl = asyncHandler(
    async (req, res, next) => {

        const games = await find({
            model: gameModel,
            populate: [
                {
                    path: "createdBy",
                    select: privateData + " -phone -email -DOB -wishList -following -coverPics -createdAt -updatedAt -notifications"

                },
                {
                    path: "genreId",
                },
            ],
        })
        return res.status(200).json({ message: "done", games })

    }
)

export const getUserGames = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params
        if (userId) {
            const games = await find({
                model: gameModel, filter: { createdBy: userId }, populate: [
                    {
                        path: "createdBy",
                        select: privateData + " -phone -email -DOB -wishList -following -coverPics -createdAt -updatedAt -notifications"

                    },
                    {
                        path: "genreId",
                    },
                ],
            })

            return res.status(200).json({ message: "done", games })
        } else {
            return next(Error("In-valid user ID", { cause: 404 }))
        }

    }
)

export const getRandomGame = asyncHandler(
    async (req, res, next) => {
        // console.log("first")
        // res.json({message: "done"})
        gameModel.count({isDeleted:false}).exec(function (err, count) {
            var random = Math.floor(Math.random() * count)
            gameModel.findOne({isDeleted:false}).skip(random).select('_id slug').exec(
                function (err, result) {
                    return res.json({ message: "done", game: result })
                })
        })
    }
)
