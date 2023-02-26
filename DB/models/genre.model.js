import { Schema, model } from 'mongoose'

const genreSchema = new Schema({
    name:{
        type: String,
        required:[true, "name is required"],
        min:[1,"Length of name must be more than 1"],
        max:[100, "Length of name must be more than 100"]
    },
    slug: String,
    desc:{
        type: String,
        required:[true, "desc is required"],
        min:[4,"Length of desc must be more than 4"],
        max:[500, "Length of desc must be more than 500"]
    },
    image: {
        secure_url: String,
        public_id: String
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, "userId is required"]
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true
})


const genreModel = model('Genre', genreSchema)

export default genreModel
