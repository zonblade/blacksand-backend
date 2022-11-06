import "reflect-metadata";
import jwt from 'jsonwebtoken';
import { Request } from "express";
import { ObjectId } from "bson";
/**
 * 
 * decorator to handle any error\
 * \
 * this only applicable to top level logic function\
 * in which handles top level logic code base.\
 * under app.\
 * under route.\
 * \
 * [a,b,next] only works on express.\
 * \
 * this is top level decorator,\
 * all decorator need this decorator!\
 * this decorator should be put above all decorator!
 * 
 */
function httpHandler(target: any,x:any,descriptor: any) : void {
    const fn = descriptor.value;
    descriptor.value = async function(...args: any[]) {
        try {
            const [,res,next] = args;
            const ok = await fn.apply(target, args);
            typeof(ok) == "number" ? res.sendStatus(ok) : res.send(ok)
            next();
        } catch(error:any) {
            const [,res,next] = args;
            typeof(error) == "number" ? res.sendStatus(error) : res.send(error)
            next(error);
        }
    };
};

/**
 * 
 * @param target 
 * @param descriptor 
 * @requiredDecorator `httpHandler`
 * 
 * authentication decorator,
 * if invalid, return 401
 * with data delivered only
 * 
 * success:bool
 * 
 */
function authRequired(target: any,x:any,descriptor: any) : void {
    const fn = descriptor.value;
    descriptor.value = async function(...args: any[]) {
        try {
            const [reqs,,] = args;
            const req:Request = reqs;
            if(!req.headers.authorization) throw Error;
            try{
                const verify = jwt.verify(req.headers.authorization,'my-secret');
                if(verify===undefined || verify === null){
                    return 401;
                };
                return await fn.apply(target, args);
            }catch(e:any){
                return e;
            }
        } catch(error:any) {
            return error;
        }
    };
};

export {httpHandler,authRequired};