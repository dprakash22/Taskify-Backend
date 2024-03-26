const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')

const cors = require('cors')
const fs = require('fs')
const {User,Class} = require('./schema.js')
const mongoose = require('mongoose')

const app = express()
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({limit:'50mb'},{ extended: false }));
app.use(cors())

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads200/')
    },
    filename: (req,file,cb)=>{
        console.log(req.params.cid+file.originalname)
        cb(null,req.params.cid+file.originalname)
    }
})

const upload = multer({storage})


app.post('/create-task/:cid',upload.single('file'),async(req,res)=>{
    try {
        console.log("-=-=-=-=-=-=-====-=-=-=-=-",req.file,req.body)
        if (req.file){
            const data = await Class.findById(req.params.cid)
            data.tasks.push({
                'title':req.body.title,
                'desc':req.body.desc,
                'file':req.params.cid+req.file.originalname
            })
            await data.updateOne(data)
            res.status(200).json({
                "status":"sucess",
                "message":"Task created successfully."
            })
        }else{
            res.status(500).json({
                "status":"failiure",
                "message":"Task failed successfully."
            })
        }
    } catch (error) {
        
    }
})

app.get('/file/:fname',(req,res)=>{
    console.log("in get file....")
    const fn = './uploads/'+req.params.fname
    console.log(fn)
    var rs = fs.createReadStream(fn)
    rs.pipe(res)
})
 
app.get('/static/:file',(req,res)=>{
    console.log("irukken",req.params.file)
    const fn = './uploads/statics/'+req.params.file
    console.log(fn)
    var rs = fs.createReadStream(fn)
    rs.pipe(res)
})

app.post('/sign-up',async(req,res)=>{
    try{
        console.log("hello folks",req.body)
        const x = await User.create({
            "name":req.body.name,
            "password":req.body.password,
            "email":req.body.email
        })
        console.log(x)
        res.status(200).json({
            "status":"success",
            "message":"user created sucessfully"
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            "status":"error",
            "message":"user not created",
            "error":e
        })
    }
})

// app.post('/create-class',async(req,res)=>{
//     try {
//         const data = await Class.find()
//         const dat = data.map(e=>e.joinCode)
//         const cls = await Class.create({
//             "title":req.body.title,
//             "description":req.body.description,
//             "joinCode":createJoinCode(dat)
//         })
//         console.log(cls._id)
//         res.status(200).json({
//             "status":"success",
//             "message":"Class created sucessfully"
//         })
//     } catch (error) {
//         res.status(200).json({
//             "status":"failed",
//             "message":"Class was not created"
//         })
//     }
// })

app.post('/login',async(req,res)=>{
    if(req.body.username == "" || req.body.password == ""  ){
        res.status(200).json({
            "status":"fill the form"
    })
}
console.log(req.body)
    try{
        const filter = {"name":req.body.username,"password":req.body.password}
        console.log(filter)
        const loginverify = await User.find(filter)
        console.log(loginverify)
        if(!loginverify){
        res.status(200).json({
            
            "status":"not correct"
    })
    }
    else{
        console.log("user undu")
        res.status(200).json({
            "data":loginverify,
        "status":"correct and login successfully"
    })
    }
    }
    catch(error){
        res.status(500).json({
            "status":"catch block"
        })
    }
})

app.post("/create-class/:uid", async (req, res) => {
    try {
        console.log("this is class", req.body);
        const data = await Class.find();
        const dat = data.map((e) => e.joinCode);

        const x = await Class.create({
            title: req.body.title,
            description: req.body.desc,
            createdBy: req.params.uid,
            members: [],
            tasks: [],
            joinCode: createJoinCode(dat),
        });
        console.log("Uid", req.params.uid);
        const user = await User.findById(req.params.uid);
        console.log("user det", user);
        const use = user;
        use.created.push(x._id.toString().replace(/ObjectId\("(.*)"\)/, "$1"));
        console.log(use);
        await user.updateOne(use);
        console.log(user);
        res.status(200).json({
            status: "Success",
            message: "Successfull Class Created",
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: "Class not created",
            error: error,
        });
    }
});

app.get("/get-class/:id/:tas", async (req, res) => {
    try {
        console.log("in get class",req.params.id,req.params.tas)
        const userfet = await User.findById(req.params.id)
        var data =await Class.find()
        if(req.params.tas==0){
            result = data.filter((id) => {
                return userfet.joined.includes(id._id)
            });
            res.status(200).json({"data":result});
        }else{
            result = data.filter((id) => {
                return userfet.created.includes(id._id)
            });
            res.status(200).json({"data":result});
        }
        // const data = await Class.find();
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "failed",
            message: "Class data not fetched",
            error: error,
        });
    }
});

app.get("/get-cls-code/:cid", async (req, res) => {
    try {
        var cls = await Class.findById(req.params.cid);
        console.log(cls.members.length);
        res.status(200).json({ values: cls.joinCode, siz: cls.members.length });
    } catch (error) {
        res.status(505).json({
            Sattus: "Error",
            message: "Classcode for each class is not fetched",
            Error: error,
        });
    }
});

app.get("/get-task/:cid", async (req, res) => {
    try {
        var cls = await Class.findById(req.params.cid);
        var task_data = [];
        console.log(cls);
        cls.tasks.forEach((per) => {
            task_data.push(per);
        });
        // console.log(cls.title);
        res.status(200).json({ values: task_data, class_title: cls.title,creator:cls.createdBy });
    } catch (error) {
        res.status(505).json({
            Sattus: "Error",
            message: "Task from each class is not fetched",
            Error: error,
       });
    }
})


const data = [58963, 87452, 98745];

function getRandomInt() {
    return Math.floor(Math.random() * 100000);
}

const createJoinCode = (data) => {
    const generatedValue = getRandomInt();

    const isDuplicate = data.some((element) => element === generatedValue);

    if (isDuplicate) {
        console.log("Duplicate value found. Regenerating...");
        return createJoinCode(data);
    } else {
        console.log("Unique join code created:", generatedValue);
        return generatedValue;
    }
};

const joinCode = createJoinCode(data);
console.log("The value is:", joinCode);




app.get('/join-class/:uid/:tid',async(req,res)=>{
    try{
        
        const user = await User.findById(req.params.uid)
        const cls = await Class.findOne({"joinCode":req.params.tid})
        console.log("injoin",user,cls)
        if(cls){
            console.log("-------------------in if===================")
            // const join = user
            // const clJoin = cls
            
            user.joined.push(cls.id)
            cls.members.push(req.params.uid)
            // console.log(clJoin,join)
            // join.push(req.params.tid)
            await user.updateOne(user)
            await cls.updateOne(cls)
            console.log("in the jon classroom",user,cls)
            res.status(200).json({
                "status":"success",
                "message":"Class joined"
            })
        }
        else{
            res.status(404).json({
                "status":"fail",
                "message":"Class not found with the given class code"
            })
        }
    }catch(e){

    }
})

app.get('/get-user/:uid',async(req,res)=>{
    try {
        const data = await User.findById(req.params.uid)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            "status":"error",
            "message":"user not fetched",
            "error":error
        })
    }
})
app.listen(5256,async()=>{
    console.log("listening at 5256...")
    try{
        await mongoose.connect("mongodb+srv://dharun:Dharun2005@dharun.wqnlpqo.mongodb.net/TaskifyDB?retryWrites=true&w=majority&appName=dharun")
        console.log("connected to db")
    }catch(e){
        console.log(e)
        console.log("coundn't establish connection....")
    }
        
})

// const conToDB = async() =>{
//     try{
//         await mongoose.connect("mongodb+srv://dharun:Dharun2005@dharun.wqnlpqo.mongodb.net/TaskifyDB?retryWrites=true&w=majority&appName=dharun")
//         console.log("connected to db")
//         app.listen(5256,()=>{console.log("listening at 5256...")})
//     }catch(e){
//         console.log(e)
//         console.log("coundn't establish connection....")
//     }
// }

// conToDB()