import { asyncHandler } from "../../../middleware/asyncHandler.js";
import rateModel from './../../../../DB/models/rate.model.js';
import { create, findOne, findOneAndUpdate, updateOne } from './../../../../DB/DBmethods.js';
import gameModel from './../../../../DB/models/game.model.js';
import calcAvgRate from './../../../services/calcAvgRate.js';
import pushNotify, { notifyMessages, activityMessages } from "../../../services/pushNotify.js";


export const addRate = asyncHandler(
    async (req, res, next) => {
        let { rate } = req.body
        const { gameId } = req.params
        rate = rate ? rate : 0;
        const gameExist = await findOne({ model: gameModel, filter: { _id: gameId }, select: "avgRate createdBy" })
        if (!gameExist) {
            return next(Error("Invalid game ID", { cause: 404 }))
        }
        const userExist = await findOne({ model: rateModel, filter: { userId: req.user._id, gameId: gameId } })
        if (!userExist) {
            //Add new rate
            const data = { value: rate, userId: req.user._id, gameId }
            const newRate = await create({ model: rateModel, data })
            if (newRate) {
                pushNotify({ to: gameExist.createdBy, from: req.user._id, message: notifyMessages.addRate, gameId })
                pushNotify({ to: req.user._id, message: activityMessages.addRate, gameId, type: "A" })
                const avgRate = await calcAvgRate(gameId)
                const updateGameRate = await updateOne({ model: gameModel, filter: { gameId }, data: { avgRate } })
                return updateGameRate.modifiedCount ? res.status(201).json({ message: "done", newRate, avgRate }) : next(Error("Something went wrong", { cause: 400 }))
            } else {
                return next(Error("Something went wrong", { cause: 400 }))
            }
        } else {
            //update old rate
            const updateRate = await findOneAndUpdate({ model: rateModel, filter: { userId: req.user._id, gameId }, data: { value: rate }, options: { new: true } })
            if (updateRate) {
                pushNotify({ to: gameExist.createdBy, from: req.user._id, message: notifyMessages.addRate, gameId }) // without await
                pushNotify({ to: req.user._id, message: activityMessages.addRate, gameId, type: "A" })
                const avgRate = await calcAvgRate(gameId)
                const updateGameRate = await updateOne({ model: gameModel, filter: { gameId }, data: { avgRate } })
                return updateGameRate.modifiedCount ? res.status(200).json({ message: "done", updateRate, avgRate }) : next(Error("Something went wrong", { cause: 400 }))
            } else {
                return next(Error("Something went wrong", { cause: 400 }))
            }
        }
    }
)
