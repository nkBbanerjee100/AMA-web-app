// this schema is the schema for mongoDB

import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
    content: string,
    createdAt: Date
}
// aggregation pipeline

// we should mention the data type so that at the time of checking if i do any mistake,,,by linting that will be checked automatically
const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

export interface User extends Document {
    username: string,
    email: string,
    password: string,
    verifyCode: string,
    verifyCodeExpiry: Date,
    isVerified: boolean,
    isAcceptingMsgs: boolean,
    msg: Message[]
}

const UserSchema: Schema<User> = new Schema({

    username: {
        type: String,
        required: [true, "plese provide an username"],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, "plese provide an email"],
        unique: true,
        // how to check for valid email...regex first param
        match: [/\S+@\S+\.\S+/, 'is not a valid email']
    },
    password: {
        type: String,
        required: [true, "plese provide an password"]
    },
    verifyCode: {
        type: String,
        required: [true, "plese provide a verify code"]
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "verify code expiry field is important"]
    },
    isVerified: {
        type: Boolean,
        default: false // by default nobody is verified
    },
    isAcceptingMsgs: {
        type: Boolean,
        default: true
    },
    msg: [MessageSchema]
})

// models because i'm checking if user model is already there inside databse or not!!! and if exitsts then return that model of type User...
const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema)

export default UserModel
