import { Schema, model } from 'mongoose'

const cartSchema = new Schema({

}, {
    timestamps: true
})


export const cartModel = model('Cart', cartSchema)


