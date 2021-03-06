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
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in main", err);
            res.json({ sucess: false });
        });
});

app.get("/main/:imageId", (req, res) => {
    const { imageId } = req.params;
    if (imageId == null) {
        return;
    } else {
        db.getSingleImage(imageId)
            .then(({ rows }) => {
                res.json(rows);
            })
            .catch((err) => {
                console.log("err in getSingleImage", err);
                res.json({ sucess: false });
            });
    }
});

app.get("/more/:latestId", (req, res) => {
    const { latestId } = req.params;
    db.getMoreImages(latestId)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in getMoreImages", err);
            res.json({ sucess: false });
        });
});

app.get("/comments/:imageId", (req, res) => {
    const { imageId } = req.params;
    db.getComments(imageId)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in getComments", err);
            res.json({ sucess: false });
        });
});

app.post("/comments", (req, res) => {
    const { comment, name, imageId } = req.body;
    db.insertComments(name, comment, imageId)
        .then(({ rows }) => {
            res.json({
                comment: comment,
                name: name,
                created_at: rows[0].created_at,
            });
        })
        .catch((err) => {
            console.log("error in insertComments", err);
            res.json({ sucess: false });
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { userName, title, description } = req.body;
    const url = `${config.s3Url}${req.file.filename}`;

    db.insertUserDataIntoImages(url, userName, title, description)
        .then(({ rows }) => {
            if (req.file) {
                res.json({
                    url: url,
                    userName: userName,
                    title: title,
                    description: description,
                    id: rows[0].id,
                });
            } else {
                res.json({ sucess: false });
            }
        })
        .catch((err) => {
            console.log("error in insertUserDataIntoImages", err);
            res.json({ sucess: false });
        });
});

app.listen(8080, () => console.log("Imageboardserver is listenting"));
