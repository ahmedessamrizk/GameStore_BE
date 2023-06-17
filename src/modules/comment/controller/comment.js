import { create, deleteOne, findOne, findOneAndUpdate, find } from '../../../../DB/DBmethods.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import gameModel from '../../../../DB/models/game.model.js';
import commentModel from '../../../../DB/models/comment.model.js';
import { roles } from '../../../../DB/models/user.model.js';
import pushNotify, { activityMessages, notifyMessages } from '../../../services/pushNotify.js';

export const addComment = asyncHandler(
    async (req, res, next) => {
        const { body } = req.body;
        const { gameId } = req.params;
        //check if game not deleted
        const exist = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false }, select: 'name createdBy' });
        if (!exist) {
            return next(Error('game not exist', { cause: 404 }));
        }
        const comment = await create({ model: commentModel, data: { createdBy: req.user._id, gameId, body } });
        if (comment) {
            pushNotify({ to: exist.createdBy, from: req.user._id, message: notifyMessages.addComment, gameId })
            pushNotify({ to: req.user._id, message: activityMessages.addComment, gameId, type: "A" })
            return res.status(201).json({ message: "done" })
        } else {
            return next(Error('Something went wrong', { cause: 400 }))
        }
    }
)

export const removeComment = asyncHandler(
    async (req, res, next) => {
        const { gameId, commentId } = req.params;
        //check if game not deleted
        const game = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false }, select: 'name createdBy' });
        if (!game) {
            return next(Error('game not exist', { cause: 404 }));
        }
        let comment;
        //owner can remove the comment
        comment = await deleteOne({ model: commentModel, filter: { _id: commentId, createdBy: req.user._id } });

        //admin of the game can delete the post
        //superAdmin can delete comment
        if (!comment.deletedCount) {
            if ((req.user.role == roles.superAdmin) || (JSON.stringify(game.createdBy) == JSON.stringify(req.user._id))) {
                comment = await deleteOne({ model: commentModel, filter: { _id: commentId } });
            }
        }
        if (comment?.deletedCount) {
            pushNotify({ to: req.user._id, message: activityMessages.removeComment, gameId, type: "A" })
            return res.status(200).json({ message: "done" });
        } else {
            return next(Error("you don't have the permission", { cause: 403 }));
        }
    }
)

export const updateComment = asyncHandler(
    async (req, res, next) => {
        const { gameId, commentId } = req.params;
        //check if game not deleted
        const checkGame = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false }, select: 'name' });
        if (!checkGame) {
            return next(Error('game not exist', { cause: 404 }));
        }
        const comment = await findOneAndUpdate({ model: commentModel, filter: { _id: commentId, createdBy: req.user._id }, data: req.body, options: { new: true } });
        if (comment) {
            pushNotify({ to: req.user._id, message: activityMessages.updateComment, gameId, type: "A" })
            return res.status(200).json({ message: "done", comment })
        } else {
            return next(Error("you don't have the permission", { cause: 403 }))
        }
    }
)

export const getComments = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params;
        const comments = await find({
            model: commentModel, filter: { gameId }, populate: [
                {
                    path: 'createdBy',
                    select: 'firstName lastName profilePic',
                }
            ]
        });
        return res.status(200).json({ message: "done", comments });
    }
)
