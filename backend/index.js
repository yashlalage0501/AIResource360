import express from "express";

const app = express();
const port = 3000;
app.use(express.json());

app.get("/",(req,res)=>{
    return res.json({
        "msg" : "Home page"
    })
})

app.listen(port,(req,res)=>{
    console.log(`App listning on port ${port}`);
})