require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 5000;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Running Bistro Boss Server');
})

app.listen(port, (req, res) => {
    console.log('Server Started at Port: ', port);
})