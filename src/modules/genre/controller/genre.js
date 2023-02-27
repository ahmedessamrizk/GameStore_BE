
import slugify from 'slugify';
import { asyncHandler } from './../../../middleware/asyncHandler.js';
import { create, findById, findOne, updateOne, deleteOne } from './../../../../DB/DBmethods.js';
import genreModel from './../../../../DB/models/genre.model.js';
import { roles } from './../../../middleware/auth.js';
import cloudinary from './../../../services/cloudinary.js';

const default_secure_url = "https://res.cloudinary.com/dpiwjrxdt/image/upload/v1677506316/genre/Agenre_py9lkw.png"
const default_public_id = "genre/Agenre_py9lkw"

export const addGenre = asyncHandler(
    async (req, res, next) => {
        const slug = slugify(req.body.name);
        const exists = await findOne({ model: genreModel, filter: { slug } })
        if (!exists) {
            req.body.slug = slug
            req.body.createdBy = req.user._id
            await create({ model: genreModel, data: req.body })
            res.status(200).json({ message: "done" })
        } else {
            next(Error("Genre already exits", { cause: 400 }))
        }
    }
)
export const addImage = asyncHandler(
    async (req, res, next) => {
        const { genreId } = req.params;
        const genre = await findById({
            model: genreModel, filter: genreId, populate: {
                path: "createdBy",
                select: "_id"
            }
        })
        if (genre) {
            const ownerId = JSON.stringify(genre.createdBy._id)
            const loggedUserId = JSON.stringify(req.user._id)

            if (ownerId === loggedUserId) {//added by owner
                const image = req.file //unnecessary
                if (image) {
                    var { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `/genre/${req.user.userName}-${req.user._id}` })
                } else {
                    //default icon
                    secure_url = default_secure_url
                    public_id = default_public_id
                }
                req.body.image = { secure_url, public_id }
                await create({ model: genreModel, data: req.body })
                res.status(200).json({ message: "done" })

                updated.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("Something went wrong", { cause: 400 }))
            } else {
                next(Error("You don't have the permission", { cause: 403 }))
            }
        } else {
            next(Error("Invalid genre ID", { cause: 404 }))
        }

    }
)

export const updateGenre = asyncHandler(
    async (req, res, next) => {
        const { genreId } = req.params;
        const genre = await findById({
            model: genreModel, filter: genreId, populate: {
                path: "createdBy",
                select: "_id"
            }
        })
        if (genre) {
            const ownerId = JSON.stringify(genre.createdBy._id)
            const loggedUserId = JSON.stringify(req.user._id)
            if (req.body.name) {
                req.body.slug = slugify(req.body.name);
            }

            const image = req.file //unnecessary
            if (image) {
                var { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `/genre/${req.user.userName}-${req.user._id}` })
                // remove old pic if not the default
                if (genre.image.public_id !== default_public_id) {
                    await cloudinary.uploader.destroy(genre.image.public_id)
                }
                req.body.image = { secure_url, public_id }
            }

            if (ownerId === loggedUserId) {//updated by owner
                req.body.updatedBy = genre.createdBy._id;
                const updated = await updateOne({ model: genreModel, filter: { _id: genreId }, data: req.body })
                updated.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("Something went wrong", { cause: 400 }))
            } else if (req.user.role === roles.superAdmin) {// update by SA
                req.body.updatedBy = req.user._id;
                const updated = await updateOne({ model: genreModel, filter: { _id: genreId }, data: req.body })
                updated.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error("Something went wrong", { cause: 400 }))
            } else {
                next(Error("You don't have the permission", { cause: 403 }))
            }
        } else {
            next(Error("Invalid genre ID", { cause: 404 }))
        }
    }
)

export const deleteGenre = asyncHandler(
    async (req, res, next) => {
        const { genreId } = req.params;
        const genre = await findById({
            model: genreModel, filter: genreId, populate: {
                path: "createdBy",
                select: "_id"
            }
        })
        if (genre) {
            const ownerId = JSON.stringify(genre.createdBy._id)
            const loggedUserId = JSON.stringify(req.user._id)

            if (ownerId === loggedUserId || req.user.role === roles.superAdmin) {
                const deleted = await deleteOne({ model: genreModel, filter: { _id: genreId }, data: req.body })
                if (deleted.deletedCount) {
                    if (genre.image.public_id !== default_public_id) {
                        await cloudinary.uploader.destroy(genre.image.public_id)
                    }
                    res.status(200).json({ message: "done" })
                } else {
                    next(Error("Something went wrong", { cause: 400 }))
                }
            } else {
                next(Error("You don't have the permission", { cause: 403 }))
            }
        } else {
            next(Error("Invalid genre ID", { cause: 404 }))
        }
    }
)