import { Router } from 'express';
import ReportComponent from './controller/report'
import TodoComponent from './controller/dashboard/todo';
import AuthComponent from './controller/auth';

let route:Router=Router();

/**
 * 
 * auth route
 * 
 * more detailed route
 * 
 */

route.post('/auth.login'     , AuthComponent.login);
route.post('/auth.pwd'       , AuthComponent.changePassword),
route.post('/report.save'    , ReportComponent.saves);
route.get('/report'          , ReportComponent.data);
route.get('/todo.old'        , TodoComponent.forReportPage);
route.get('/todo.pending'    , TodoComponent.pending);
route.get('/todo.postponed'  , TodoComponent.postponed);

module.exports = route;