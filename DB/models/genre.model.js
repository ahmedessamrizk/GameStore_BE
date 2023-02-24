import { Schema, model } from 'mongoose'

const genreSchema = new Schema({

}, {
    timestamps: true
})


export const genreModel = model('Genre', genreSchema)


