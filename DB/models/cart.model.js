import { Schema, model, Types } from 'mongoose'

const cartSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: [true, "userId is required"],
        ref: 'User'
    },
    games: [{
        type: Types.ObjectId,
        required: [true, "gameId is required"],
        ref: 'Game'
    }]
}, {
    timestamps: true
})


const cartModel = model('Cart', cartSchema)

export default cartModel


