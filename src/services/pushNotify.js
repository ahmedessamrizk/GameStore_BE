import { updateOne, findById } from "../../DB/DBmethods.js"
import userModel from './../../DB/models/user.model.js'
import gameModel from './../../DB/models/game.model.js';

export const notifyMessages = {
    addRate: "has rated your game:"
}

const pushNotify = async ({ to, from, message = "", gameId, }) => {
    const { firstName, lastName } = await findById({ model: userModel, filter: from, select: "firstName lastName" })
    const { notifications } = await findById({ model: userModel, filter: to, select: "notifications" })
    const { name } = await findById({ model: gameModel, filter: gameId, select: "name" })
    const text = `${firstName} ${lastName} ${message} ${name} `
    const notify = { message: text, gameId }
    if (notifications.length >= 30) {
        await updateOne({ model: userModel, filter: { _id: to }, data: { $pop: { notifications: 1 } } })
    }
    const push = await updateOne({ model: userModel, filter: { _id: to }, data: { $push: { notifications: { $each: [notify], $position: 0 } } } })
    if(process.env.MODE=="DEV"){
        push.modifiedCount ? console.log("Notification Pushed") : console.log("Error while pushing Notification")
    }
}

export default pushNotify