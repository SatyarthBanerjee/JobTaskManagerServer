const express = require("express");
const cors = require("cors");
const allroutes = require("../server/Routes/routes")
require("dotenv").config()
const app = express();

const port = process.env.PORT;
const url  = process.env.MONGO_URI;
const mongoose = require("mongoose")
app.use(cors());
app.use(express.json());
app.use(allroutes)

mongoose.connect(url).then(()=>{
    app.listen(port,()=>{
        console.log(`DB connected and server is running on port ${port}`)
    }) 
})
