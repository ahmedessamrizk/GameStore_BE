import { Schema, model, Types } from 'mongoose'

const rateSchema = new Schema({
    value: {
        type: Number,
        required: [true, "Rate is required"],
        min: [0, "Rate can't be negative"],
        max: [5, "Rate can't be more than 5"],
    },
    userId: {
        type: Types.ObjectId,
        required: [true, "userId is required"],
        ref: 'User'
    },
    gameId: {
        type: Types.ObjectId,
        required: [true, "gameId is required"],
        ref: 'Game'
    },
}, {
    timestamps: true
})


const rateModel = model('Rate', rateSchema)

export default rateModel


