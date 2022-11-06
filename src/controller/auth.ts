import { Request } from "express";
import jwt from 'jsonwebtoken';
import { ObjectId } from "bson";
import { ParamsDictionary as ParamDict } from 'express-serve-static-core';
import { authRequired, httpHandler } from "../decorator";
import { sha512 } from "js-sha512";
import { model } from "mongoose";
import { I_UserData, S_UserSchema } from "../models";
import { jwtdecode } from "../helper/jwt";


export default class AuthComponent {

    @httpHandler
    static async login(
        req: Request<ParamDict, any, { username: string, password: string }>
    ) {
        const username: string = req.body.username
        const password: string = req.body.password
        const hashpwd: string = sha512(password)
        console.log({
            username,
            password,
            hashpwd
        })
        const result: Array<I_UserData> = await model('users', S_UserSchema).aggregate([
            {
                '$match': {
                    '$and': [
                        { 'username': username },
                        { 'password': hashpwd }
                    ]
                }
            },
            {
                '$project': {
                    'userId': { '$toString': '$_id' },
                    '_id': 0
                }
            }
        ])
        var tokenize: string;
        try {
            const jwtPayload = result.length > 0 ? result[0] : false
            if (!jwtPayload) {
                throw 400
            }
            tokenize = jwt.sign(JSON.stringify(jwtPayload), 'my-secret')
        } catch {
            throw 400
        }
        return {
            username: username,
            token: tokenize
        }
    }

    @httpHandler
    @authRequired
    static async changePassword(
        req: Request
    ) {
        const userId: ObjectId = jwtdecode(req)
        const password: string = req.body.password
        const hashpwd: string = sha512(password)
        await model('users', S_UserSchema).findOneAndUpdate(
            { '_id': userId },
            {
                '$set': {
                    'password': hashpwd
                }
            }
        )
        return {
            success: true
        }
    }
}