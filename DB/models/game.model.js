import { Schema, model, Types } from 'mongoose'

const gameSchema = new Schema({
    
}, {
    timestamps: true
})

export const gameModel = model('Game', gameSchema)


