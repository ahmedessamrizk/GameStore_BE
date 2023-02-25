import { Schema, model, Types } from 'mongoose'

const gameSchema = new Schema({

}, {
    timestamps: true
})

const gameModel = model('Game', gameSchema)

export default gameModel
