import { updateOne, findById } from "../../DB/DBmethods.js"
import userModel from './../../DB/models/user.model.js'
import gameModel from './../../DB/models/game.model.js';
import slugify from "slugify";

export const notifyMessages = { //addComment -  rate 
    addRate: "has rated your game:",
    addComment: "has added comment on game:",

}
// add/update comment, add/update game, add rate
export const activityMessages = {
    addGame: "you have added game:",
    removeGame: "you have removed game:",
    unRemoveGame: "you have unRemove game:",
    addGamePics: "you have added pictures for game:",
    addGameVid: "you have added a video for game:",
    updateGame: "you have updated game:",
    addComment: "you have added comment on game:",
    removeComment: "you have removed comment on game:",
    updateComment: "you have updated comment on game:",
    addRate: "you have rated game:"
}

const pushNotify = async ({ to, from, message = "", gameId, type = "N" }) => {
    //type => notifications || activity
    if (type == "N") {
        const { firstName, lastName } = await findById({ model: userModel, filter: from, select: "firstName lastName" })
        const { notifications } = await findById({ model: userModel, filter: to, select: "notifications" })
        const { name } = await findById({ model: gameModel, filter: gameId, select: "name" })
        const gameSlug = slugify(name).toLowerCase()
        const text = `${firstName} ${lastName} ${message} ${name} `
        const notify = { message: text, gameId, gameSlug }
        if (notifications.length >= 30) {
            await updateOne({ model: userModel, filter: { _id: to }, data: { $pop: { notifications: 1 } } })
        }
        const push = await updateOne({ model: userModel, filter: { _id: to }, data: { $push: { notifications: { $each: [notify], $position: 0 } } } })
        if (process.env.MODE == "DEV") {
            push.modifiedCount ? console.log("Notification Pushed") : console.log("Error while pushing Notification")
        }
    } else { //activity
        //add/update comment, add/update game, add rate
        const { activity } = await findById({ model: userModel, filter: to, select: "activity" })
        const { name } = await findById({ model: gameModel, filter: gameId, select: "name" })
        const gameSlug = slugify(name).toLowerCase()
        const text = `${message} ${name}`
        const active = { message: text, gameId, gameSlug }
        if (activity.length >= 30) {
            await updateOne({ model: userModel, filter: { _id: to }, data: { $pop: { activity: 1 } } })
        }
        const push = await updateOne({ model: userModel, filter: { _id: to }, data: { $push: { activity: { $each: [active], $position: 0 } } } })
        if (process.env.MODE == "DEV") {
            push.modifiedCount ? console.log("activity Pushed") : console.log("Error while pushing activity")
        }
    }
}


export default pushNotify