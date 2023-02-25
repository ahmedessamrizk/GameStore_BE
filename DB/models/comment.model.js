import { Schema, model } from 'mongoose'

const commentSchema = new Schema({

}, {
    timestamps: true
})


const commentModel = model('Comment', commentSchema)

export default commentModel
