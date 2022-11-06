import { Request } from "express";
import jwt from "jsonwebtoken"
import { ObjectId } from "bson"

const jwtdecode = (req:Request) =>{
    const authorization = req.headers.authorization?req.headers.authorization:401
    if(authorization===401){
        throw 401
    }
    const verify = jwt.verify(authorization,'my-secret');
    if(verify===undefined || verify === null){
        throw 401;
    };
    const verifies:any = verify;
    const userId:ObjectId = new ObjectId(verifies.userId)
    return userId
}

export {jwtdecode}