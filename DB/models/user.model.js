import { Schema, model } from 'mongoose'

const userSchema = new Schema({

}, {
    timestamps: true
})


export const userModel = model('User', userSchema)


