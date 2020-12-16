const express = require("express");
const app = express();
const db = require("./db");
// multer middleware for parsing multipart formdata and process files
const multer = require("multer");
// uid-safe for generating unique Ids
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const config = require("./config.json");

app.use(
    express.urlencoded({
        extended: false,
    })
);

// Multer configurations
// Specify file names and destinations
app.use(express.json());

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152, //1Mb
    },
});

app.use(express.static("public"));

app.get("/main", (req, res) => {
    db.getUserData()
        .then(({ rows }) => {
            // console.log(rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

// "/upload" POST route to handle the image upload ----------------------------
//  Add multer as a middleware for the route below

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("upload req.body", req.body);
    console.log("upload req.file filename", req.file); //multer sets up a file property on req object
    const { userName, title, description } = req.body;
    // console.log(title, userName, description);
    const imageUrl = `${config.s3Url}${req.file.filename}`;
    // console.log("imageUrl", imageUrl);
    db.insertUserDataIntoImages(imageUrl, userName, title, description)
        .then((result) => {
            // console.log("result from insertUserDataIntoImages", result);
        })
        .catch((err) => {
            console.log("error in insertUserDataIntoImages", err);
        });

    if (req.file) {
        res.json({
            imageUrl: imageUrl,
            userName: userName,
            title: title,
            imageDescription: description,
        });
    } else {
        res.json({ sucess: false });
    }
});

app.listen(8080, () => console.log("Imageboardserver is listenting"));
