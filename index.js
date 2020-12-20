const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const config = require("./config.json");

app.use(
    express.urlencoded({
        extended: false,
    })
);

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
            // console.log("rows", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/main/:imageId", (req, res) => {
    const { imageId } = req.params;
    //console.log("imageId vom req.body", imageId);

    db.getSingleImage(imageId)
        .then(({ rows }) => {
            console.log("rows get single Image", rows);

            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/more/:latestId", (req, res) => {
    const { latestId } = req.params;
    //console.log("latesId", latestId);
    db.getMoreImages(latestId)
        .then(({ rows }) => {
            //  console.log("rows get more Images", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in getMoreImages", err);
        });
});

app.get("/comments/:imageId", (req, res) => {
    const { imageId } = req.params;
    //  console.log("imageId comments", imageId);
    db.getComments(imageId)
        .then(({ rows }) => {
            // console.log("res from getComments", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in getComments", err);
        });
});

app.post("/comments", (req, res) => {
    //   console.log("/comments req.body", req.body);
    const { comment, name, imageId } = req.body;
    // console.log(name, comment, imageId);
    db.insertComments(name, comment, imageId)
        .then(({ rows }) => {
            // console.log("res from insert comments", rows[0].created_at);
            res.json({
                name: name,
                comment: comment,
                created_at: rows[0].created_at,
            });
        })
        .catch((err) => {
            console.log("error in insertComments", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { userName, title, description } = req.body;
    // console.log(title, userName, description);
    const url = `${config.s3Url}${req.file.filename}`;
    // console.log("imageUrl", imageUrl);

    db.insertUserDataIntoImages(url, userName, title, description)
        .then(({ rows }) => {
            console.log("result from insertUserDataIntoImages", rows);
            if (req.file) {
                res.json({
                    url: url,
                    userName: userName,
                    title: title,
                    description: description,
                    id: rows[0].id
                });
            } else {
                res.json({ sucess: false });
            }
        })
        .catch((err) => {
            console.log("error in insertUserDataIntoImages", err);
        });
});

app.listen(8080, () => console.log("Imageboardserver is listenting"));
