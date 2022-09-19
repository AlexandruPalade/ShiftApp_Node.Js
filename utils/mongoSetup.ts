import mongoose from "mongoose";
import { Config } from "../types";

const { name } = require('../package.json');

const config = require('config') as Config;

const { MONGODB: { URI } } = config;

export const setup = async () => {
    await mongoose.connect(URI, { dbName: name });
    console.log('Successfully connected to the DB');
}

