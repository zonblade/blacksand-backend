import mongoose from 'mongoose';
import { ObjectId} from 'bson'
const { Schema } = mongoose;

interface I_UserData {
    _id:ObjectId,
    cid:string,
    username:string,
    password:string
}

interface I_UserReport {
    _id:ObjectId,
    _u:ObjectId,
    cid:string,
    title:string,
    type:string,
    report:string
}

interface I_SubUserToDoReport {
    _r:ObjectId,
    date:Date,
    status:string
}

interface I_UserToDo {
    _id:ObjectId,
    _u:ObjectId,
    cid:string,
    content:string,
    status:string,
    report:Array<I_SubUserToDoReport>
}

const S_UserSchema:mongoose.Schema<I_UserData> = new Schema({
    _id:ObjectId,
    cid:String,
    username:String,
    password:String
},{strict:true,collection:'users'})

const S_UserReport:mongoose.Schema<I_UserReport> = new Schema({
    _id:ObjectId,
    _u:ObjectId,
    cid:String,
    title:String,
    type:String,
    report:String
},{strict:true,collection:'report'})

const S_UserToDo:mongoose.Schema<I_UserToDo> = new Schema({
    _id:ObjectId,
    _u:ObjectId,
    cid:String,
    content:String,
    status:String,
    report:[]
},{strict:true,collection:'todos'})

export {
    S_UserSchema,
    S_UserReport,
    S_UserToDo
}

export type {
    I_UserData,
    I_UserReport,
    I_SubUserToDoReport,
    I_UserToDo
}