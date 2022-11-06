import { Request } from "express";
import { model } from "mongoose";
import { S_UserToDo } from "../../models";
import { authRequired, httpHandler } from "../../decorator";
import { jwtdecode } from "../../helper/jwt";


export default class TodoComponent {

    @httpHandler
    @authRequired
    static async forReportPage(
        req: Request
    ) {
        const userId = jwtdecode(req)
        const dbResult: Array<any> = await model('todo', S_UserToDo).aggregate([
            {
                '$match': {
                    '_u': userId,
                    'status':{'$ne':['Finished']}
                }
            },
            {
                '$addFields': {
                    'date': {
                        '$ifNull': [
                            { '$first': '$report.date' },
                            { '$toDate': '$_id' }
                        ]
                    }
                }
            },
            { '$sort': { 'date': -1 } },
            {
                '$project': {
                    'id': '$cid',
                    'content': '$content',
                    'status': '$status'
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'report': 0
                }
            }
        ])
        const result = dbResult ? dbResult : []
        return result
    }

    @httpHandler
    @authRequired
    static async pending(
        req: Request
    ) {
        const userId = jwtdecode(req)
        const dbResult: Array<any> = await model('todo', S_UserToDo).aggregate([
            {
                '$match': {
                    '$and': [
                        { '_u': userId },
                        { 'status': 'Pending' }
                    ]
                }
            },
            {
                '$addFields': {
                    'date': {
                        '$ifNull': [
                            { '$first': '$report.date' },
                            { '$toDate': '$_id' }
                        ]
                    }
                }
            },
            {
                '$project': {
                    'id': '$cid',
                    'content': '$content',
                    'status': '$status',
                    'date': {
                        'created': { '$toDate': '$_id' },
                        'updated': '$date'
                    }
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'report': 0
                }
            }
        ])
        const result = dbResult ? dbResult : []
        return result
    }

    @httpHandler
    @authRequired
    static async postponed(
        req: Request
    ) {
        const userId = jwtdecode(req)
        const dbResult: Array<any> = await model('todo', S_UserToDo).aggregate([
            {
                '$match': {
                    '$and': [
                        { '_u': userId },
                        { 'status': 'Postponed' }
                    ]
                }
            },
            {
                '$addFields': {
                    'date': {
                        '$ifNull': [
                            { '$first': '$report.date' },
                            { '$toDate': '$_id' }
                        ]
                    }
                }
            },
            {
                '$project': {
                    'id': '$cid',
                    'content': '$content',
                    'status': '$status',
                    'date': {
                        'created': { '$toDate': '$_id' },
                        'updated': '$date'
                    }
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'report': 0
                }
            }
        ])
        const result = dbResult ? dbResult : []
        return result
    }
}