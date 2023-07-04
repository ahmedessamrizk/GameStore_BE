import { Schema, model, Types } from 'mongoose'

export const roles = {
    admin: "admin",
    user: "user",
    superAdmin: "superAdmin"
}

const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, "userName is required"],
        min: [3, "Length of userName must be more than 3"],
        max: [20, "Length of userName must be more than 20"],
        unique: [true, 'userName should be unique']
    },
    firstName: {
        type: String,
        required: [true, "firstName is required"],
        min: [2, "Length of firstName must be more than 2"],
        max: [10, "Length of firstName must be more than 10"]
    },
    lastName: {
        type: String,
        required: [true, "lastName is required"],
        min: [2, "Length of lastName must be more than 2"],
        max: [10, "Length of lastName must be more than 10"]
    },
    DOB: {
        type: Date,
        required: [true, "Date is required"],
    },
    age: Number,
    lastSeen: Date,
    email: {
        type: String,
        required: [true, "email is required"],
        min: [5, "Length of email must be more than 5"],
        max: [50, "Length of email must be more than 50"],
        unique: [true, 'email must be unique']
    },
    password: {
        type: String,
        required: [true, "password is required"],
        min: [8, "Length of password must be more than 8"],
        max: [20, "Length of password must be more than 20"]
    },
    phone: String,
    profilePic: {
        secure_url: String,
        public_id: String
    },
    coverPics: [{
        secure_url: String,
        public_id: String,
        _id: false
    }],
    confirmEmail: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    following: [{ type: Types.ObjectId, ref: 'User' }],
    wishList: [{ type: Types.ObjectId, ref: 'Game' }],
    role: {
        type: String,
        enum: [roles.admin, roles.user, roles.superAdmin],
        default: roles.user
    },
    accountType: {
        type: String,
        enum: ['system', 'google']
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        default: 'male'
    },
    activity: [{
        message: String,
        gameId: {
            type: Types.ObjectId,
            ref: 'Game'
        },
        gameSlug: String
    }],
    notifications: [{
        message: String,
        gameId: {
            type: Types.ObjectId,
            ref: 'Game'
        }, 
        gameSlug: String
    }],
    code: {
        type: String,
        default: null
    },
    notifyCount: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
})


const userModel = model('User', userSchema)

export default userModel