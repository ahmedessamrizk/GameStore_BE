import { Schema, model, Types } from 'mongoose'

const gameSchema = new Schema({
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
    mainPic: {
        secure_url: String,
        public_id: String
    },
    pics: [{
        secure_url: String,
        public_id: String,
        _id: false
    }],
    video: {
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
    genreId: {
        type: Types.ObjectId,
        ref: 'Genre',
        required: [true, "genreId is required"]
    },
    price:{
        type: Number,
        required:[true, "price is required"],
        min:[0,"Price can't be negative"],
    },
    released: {
        type: Date,
        required: [true, 'Released date is required']
    },
    platform: [{
        type: String,
        enum: ['pc', 'playstation', 'xbox', 'nintendo', 'mobile']
    }],
    isDeleted:{
        type: Boolean,
        default: false
    },
    ratings:[{
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: [true, 'userId is required']
        },
        rate: {
            type: Number,
            required: [true, 'rate is required']
        }
    }]
}, {
    timestamps: true
})

const gameModel = model('Game', gameSchema)

export default gameModel
