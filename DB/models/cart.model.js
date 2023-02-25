import { Schema, model } from 'mongoose'

const cartSchema = new Schema({

}, {
    timestamps: true
})


const cartModel = model('Cart', cartSchema)

export default cartModel


