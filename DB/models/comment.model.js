import { Schema, model , Types} from 'mongoose'

const commentSchema = new Schema({
    body:{
        type: String,
        required:[true, "body is required"],
        min:[1,"Length of body must be more than 1"],
        max:[1000, "Length of body must be more than 1000"]
    },
    createdBy:{
        type: Types.ObjectId,
        required:[true, "userId is required"],
        ref: 'User'
    },
    gameId:{
        type: Types.ObjectId,
        required:[true, "userId is required"],
        ref: 'Game'
    },
    likes:[{
        type: Types.ObjectId,
        ref: 'User'
    }],
    dislikes:[{
        type: Types.ObjectId,
        ref: 'User'
    }],
}, {
    timestamps: true
})


const commentModel = model('Comment', commentSchema)

export default commentModel
