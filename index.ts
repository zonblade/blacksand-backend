import express, { Express } from 'express';
import dotenv from 'dotenv';
import {db} from "./src/database";
import bodyParser from 'body-parser';
let routeIndex = require("./src/route");
var cors = require('cors')

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(routeIndex);

db().then(async(_:any)=>{
  console.log("connected!");
  app.listen(port, async() => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
  });
})