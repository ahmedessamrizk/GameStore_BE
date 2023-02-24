import { Schema, model } from 'mongoose'

const commentSchema = new Schema({

}, {
    timestamps: true
})


export const commentModel = model('Comment', commentSchema)


