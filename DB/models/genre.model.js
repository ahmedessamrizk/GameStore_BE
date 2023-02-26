import { Schema, model } from 'mongoose'

const genreSchema = new Schema({

}, {
    timestamps: true
})


const genreModel = model('Genre', genreSchema)

export default genreModel
