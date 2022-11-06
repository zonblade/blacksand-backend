import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const database:string = (process.env.MONGO)?.toString()!;

async function db(){
    try{
        return await mongoose.connect(database);
    }catch(e){
        throw e;
    }
    
}
export {db};