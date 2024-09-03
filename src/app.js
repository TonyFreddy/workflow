const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const route = require('./feature/workflowRoute');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use('/', route);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});