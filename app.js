const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');



const personDatabase = ("/database/personDatabase");



const app = express();
app.use(express.json());


app.use("/database/personDatabase")
