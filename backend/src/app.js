const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const route = require('./routes/workflowRoute');
const bodyParser = require('body-parser');
//const dotenv = require('dotenv');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


app.use((req, res, next) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    next();
});   

app.use('/workflow', route);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});