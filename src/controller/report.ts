import { Request, Response, NextFunction } from "express";
import { model } from "mongoose";
import { ObjectId } from "bson";
import { v4 as uuid4 } from "uuid";
import { ParamsDictionary as ParamDict } from 'express-serve-static-core';
import { httpHandler, authRequired } from "../decorator";
import { I_SubUserToDoReport, I_UserReport, I_UserToDo, S_UserReport, S_UserToDo } from "../models";
import { jwtdecode } from "../helper/jwt";
import type { I_RequestReport, I_RequestTodo } from "../types/report";
import type { I_ResSuccess } from "../types/common";


class ReportComponent {
    @httpHandler
    @authRequired
    static async saves(
        req: Request<ParamDict, any, I_RequestReport<any>>,
        res: Response, next: NextFunction
    ): Promise<I_ResSuccess> {
        const reportTitle: string = req.body.title
        const reportType: string = req.body.type
        const reportContent: string = req.body.content
        const userId: ObjectId = jwtdecode(req)
        const newTodo: Array<I_RequestTodo> = req.body.new_todo
        const oldTodo: Array<I_RequestTodo> = req.body.old_todo
        const reportId = new ObjectId()
        const saveReport: I_UserReport = {
            _id: reportId,
            _u: userId,
            cid: uuid4(),
            title: reportTitle,
            type: reportType,
            report: reportContent
        }
        const limiter = await model('report', S_UserReport).aggregate([
            {
                '$match': {
                    '$expr': {
                        '$and': [
                            { '$eq': ['$_u', userId] },
                            {
                                '$eq': [
                                    {
                                        '$dateToString': {
                                            'date': { '$toDate': '$_id' },
                                            'format': '%Y-%m-%d'
                                        }
                                    }, {
                                        '$dateToString': {
                                            'date': new Date,
                                            'format': '%Y-%m-%d'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                '$project': {
                    'date_db': {
                        '$dateToString': {
                            'date': { '$toDate': '$_id' },
                            'format': '%Y-%m-%d'
                        }
                    },
                    'date_here': {
                        '$dateToString': {
                            'date': new Date,
                            'format': '%Y-%m-%d'
                        }
                    }
                }
            }
        ])
        if (limiter.length > 0) {
            throw 403
        }
        await model(
            'report', S_UserReport
        ).insertMany([
            saveReport
        ])
        const saveNewTodo: Array<I_UserToDo> = newTodo.map((
            item: I_RequestTodo,
            index: number
        ) => {
            var statuses = item.status;
            if(!['Pending','Finished','Postponed'].includes(statuses)){
                statuses='Postponed'
            }
            const itemNewSubReport: I_SubUserToDoReport = {
                _r: reportId,
                date: new Date,
                status: statuses
            }
            const itemNewTodo: I_UserToDo = {
                _id: new ObjectId,
                _u: userId,
                cid: item.id,
                content: item.content,
                status: statuses,
                report: [
                    itemNewSubReport
                ]
            }
            return itemNewTodo
        })
        await model(
            'todos',
            S_UserToDo
        ).insertMany(saveNewTodo)
        oldTodo.map(async (item: I_RequestTodo, index: number) => {
            var statuses = item.status;
            if(!['Pending','Finished','Postponed'].includes(statuses)){
                statuses='Postponed'
            }
            const itemNewSubReport: I_SubUserToDoReport = {
                _r: reportId,
                date: new Date,
                status: statuses
            }
            model('todo', S_UserToDo).findOneAndUpdate(
                { cid: item.id },
                [{
                    '$set': {
                        content: item.content,
                        status: statuses,
                        report: {
                            '$concatArrays': [
                                '$report',
                                [itemNewSubReport]
                            ]
                        }
                    }
                }]
            ).then(() => { }).catch((err: any) => {
                console.log(err)
            })
        })
        return {
            success: true
        }
    }

    @httpHandler
    @authRequired
    static async data(
        req: Request
    ): Promise<any> {
        const userId: ObjectId = jwtdecode(req)
        const result: Array<any> = await model('report', S_UserReport).aggregate([
            { '$match': { '_u': userId } },
            { '$sort':{'_id':-1}},
            { '$limit': 30 },
            { '$lookup':{
                'from':'todos',
                'localField':'_id',
                'foreignField':'report._r',
                'pipeline':[
                    {'$match':{'status':{'$ne':'Finished'}}},
                    {'$project':{
                        'id':'$cid',
                        'content':'$content',
                        'status' :'$status',
                        '_id':0
                    }}
                ],
                'as':'todos'
            }},
            {
                '$project': {
                    'id':'$cid',
                    'title': '$title',
                    'type': '$type',
                    'content':'$report',
                    'todos':'$todos',
                    'date': {
                        '$dateToString': {
                            'date': { '$toDate': '$_id' },
                            'format': '%Y-%m-%d'
                        }
                    },
                    'today': {
                        '$dateToString': {
                            'date': new Date,
                            'format': '%Y-%m-%d'
                        }
                    },
                    '_id': 0
                }
            }
        ])
        var hasToday: boolean;
        const todayExist = result.map((item: any, index: any) => {
            if (item.date === item.today) {
                return true
            }
        })
        if (todayExist.includes(true)) {
            hasToday = true
        } else {
            hasToday = false
        }

        const todoData:Array<any> = await model('todos',S_UserToDo).aggregate([
            { '$match': { '_u': userId } },
            {'$facet':{
                'pending':[
                    {'$match':{'status':'Pending'}},
                    {'$project':{
                        'content':'$content',
                        'date':{
                            '$dateToString':{
                                'date':{'$toDate':{'$last':'$report.date'}},
                                'format':'%Y-%m-%d'
                            }
                        },
                        '_id':0
                    }}
                ],
                'postponed':[
                    {'$match':{'status':'Postponed'}},
                    {'$project':{
                        'content':'$content',
                        'date':{
                            '$dateToString':{
                                'date':{'$toDate':{'$last':'$report.date'}},
                                'format':'%Y-%m-%d'
                            }
                        },
                        '_id':0
                    }}
                ]
            }}
        ])
        const todoDataResult:any = todoData[0]
        return {
            today: hasToday,
            report: result,
            todo:{
                pending:todoDataResult.pending,
                postponed:todoDataResult.postponed
            }
        }
    }
}

export default ReportComponent