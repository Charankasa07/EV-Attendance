const express = require("express");
const mongoose = require("mongoose");
const body_parser = require("body-parser");
const ejs = require('ejs')
const cookie_parser = require('cookie-parser')
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const attendance = require("./models/attendance");
const app = express();
dotenv.config();

let start_time = "10:04:00 AM";
let end_time = "10:06:00 AM";
let extra_time = "10:14:00 AM"
// let count = 0;



app.set('view engine',"ejs");

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true },
  console.log("DB Connected")
);

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));
app.use(cookie_parser())

app.get("/", (req, res) => {
  res.render('index')
});

app.get('/register',(req,res)=>{
    res.clearCookie()
    res.render('register')
})

app.post("/register", async (req, res) => {
  const { name, id_number,passowrd } = req.body;
  const data = await attendance.findOne({ id: id_number.toLowerCase() });
  if (data) return res.status(400).send("Account Already Exists");

  const salt = await bcrypt.genSalt(10)
  const hashedpass = await bcrypt.hash(req.body.password,salt)

  const user_data = new attendance({
    name: name,
    id: id_number.toLowerCase(),
    password : hashedpass,
    total_present : 0
  });
  try {
    await user_data.save();
    res.redirect('/mark-attendance')
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/login',(req,res)=>{
    res.clearCookie()
    res.render('login')
})

app.post('/login',async (req,res)=>{
    const { id_number , password } = req.body

    const data = await attendance.findOne({id : id_number.toLowerCase()})
    if(!data) return res.status(400).send("Student Doesn't Exist")

    const validpass = await bcrypt.compare(req.body.password,data.password)
    if(!validpass) return res.status(400).send("Invalid Password")

    res.redirect('/mark-attendance')
})
// app.post('/register/user',async (req,res)=>{
//     // code for user registration here...
// })

app.get('/mark-attendance',(req,res)=>{
    res.render('mark_attendance')
})

app.post("/mark-attendance", async (req, res) => {
  const id_number = req.body.id_number.toLowerCase();
  console.log(req.body);

  const user_cookie = req.cookies.user_cookie || 'no cookie'
  console.log(user_cookie);

  const data = await attendance.findOne({ id: id_number });

  if (!data) return res.status(400).send("Student Doesn't Exist");

  const now_time = new Date().toLocaleTimeString();
  console.log(now_time);

  if (
    now_time >= start_time &&
    now_time <= end_time
  ) {
    if(user_cookie === 'no cookie'){
        const date_and_time = new Date();
        const date = date_and_time.toLocaleDateString();
        console.log(data);
        const new_date_array = data.dateArray;
        const new_attendance_array = data.attendanceArray;
        new_date_array.push(date);
        new_attendance_array.push("P");
        await attendance.findByIdAndUpdate(
            data._id,
            {
                $set: {
                    now_date: now_time,
                    dateArray: new_date_array,
                    attendanceArray: new_attendance_array,
                },
                $inc :{
                    total_present : 1
                }
            },
            { new: true }
            );
            // res.cookie('user_cookie','cookie',{maxAge : 30})
            res.cookie('user_cookie','cookie',{maxAge : 85900000})
            res.send("Attendance Marked");
        }
    else{
        // res.clearCookie('user_cookie')
        res.status(400).send("Attendance can be submitted only once")
    }    
  } else if (now_time > end_time && now_time <= extra_time) {
    if(user_cookie === 'no cookie')
    {
        const date_and_time = new Date();
        const date = date_and_time.toLocaleDateString();
        const time = date_and_time.toLocaleTimeString();
        const new_date_array = data.dateArray;
        const new_attendance_array = data.attendanceArray;
        new_date_array.push(date);
        new_attendance_array.push("A");
        await attendance.findByIdAndUpdate(
            data._id,
            {
                $set: {
                    now_date: time,
                    dateArray: new_date_array,
                    attendanceArray: new_attendance_array,
                },
            },
            { new: true }
            );
            res.cookie('user_cookie','cookie')
            res.send("Sorry,Time is up!!Attendance Marked as Absent");
        }
    else{
        res.status(400).send("Attendance can be submitted only once")
    }    
  }
  else if (now_time < start_time){
    res.status(400).send("Attendance not yet started")
  }
  else if(now_time > extra_time){
    res.send("Sorry,Time is up!!")
  }
  
});

app.get('/get-attendance',async ( req ,res )=>{
    const data = await attendance.find()
    const dates = ['19/07/2023','20/07/2023','21/07/2023','22/07/2023','23/07/2023','24/07/2023','25/07/2023','26/07/2023','27/07/2023','28/07/2023','29/07/2023','30/07/2023','31/07/2023','01/08/2023','02/08/2023','03/08/2023','04/08/2023','05/08/2023','06/08/2023','07/08/2023','08/08/2023','09/08/2023','10/08/2023','11/08/2023','12/08/2023','13/08/2023','14/08/2023','15/08/2023','16/08/2023','17/08/2023','18/08/2023']
    res.render('view_attendance', {details : data,dates : dates})
})


app.listen(5500, console.log("Listening on port 5500"));