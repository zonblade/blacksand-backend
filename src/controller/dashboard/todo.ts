import { Request } from "express";
import { model } from "mongoose";
import { S_UserReport, S_UserToDo } from "../../models";
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
        const resultReport: Array<any> = await model('report', S_UserReport).aggregate([
            {'$match':{
                '_u': userId
            }},
            {'$project':{
                'date': {
                    '$dateToString': {
                        'date': { '$toDate': '$_id' },
                        'format': '%Y-%m-%d'
                    }
                }
            }},
            {'$facet':{'dateReport':[]}},
            {'$addFields':{
                'today': {
                    '$dateToString': {
                        'date': new Date,
                        'format': '%Y-%m-%d'
                    }
                }
            }},
            {'$project':{
                'hasToday':{
                    '$cond':{
                        'if':{'$gt':[
                            {'$sum':{
                                '$map':{
                                    'input':'$dateReport',
                                    'in':{
                                        '$cond':{
                                            'if'  :{'$eq':['$$this.date','$today']},
                                            'then':{'$toInt':1},
                                            'else':{'$toInt':0}
                                        }
                                    }
                                }
                            }},
                            0
                        ]},
                        'then':{'$toBool':true},
                        'else':{'$toBool':false}
                    }
                }
            }}
        ])
        const result = dbResult ? dbResult : []
        var hasToday=false;
        if(resultReport.length>0){
            if(resultReport[0].hasToday === true){
                hasToday=true;
            }
        }
        return {
            today:hasToday,
            todo:result
        }
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