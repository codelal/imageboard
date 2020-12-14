const express = require("express");
const app = express();
const db = require("./db");

// app.use(function (req, res, next) {
//     console.log("-------");
//     console.log(`${req.method} request coming in on route ${req.url}`);
//     next();
// });

app.use(express.static("public"));

app.get("/main", (req, res) => {
    db.getImages().then(({ rows }) => {
        // console.log(rows);
        res.json(rows);
    });
});

app.listen(8080, () => console.log("Imageboardserver is listenting"));
