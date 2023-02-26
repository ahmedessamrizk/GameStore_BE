import { Schema, model } from 'mongoose'

const userSchema = new Schema({

}, {
    timestamps: true
})


const userModel = model('User', userSchema)

export default userModel