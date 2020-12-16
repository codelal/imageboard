const aws = require("aws-sdk");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; //  // in prod the secrets are environment variables variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

module.exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500);
    }
    const { filename, mimetype, size, path } = req.file;
    

    const promise = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read", //basically saing people can view the file
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise(); //this makes it return a promise

    promise
        .then(() => {
            console.log("amazon upload complete");
            next();
            //optional cleaning up
            fs.unlink(path, () => {});
            // this is called a noop // function "no operation"
        })
        .catch((err) => {
            console.log("Something went wrong in uploading to S3!", err);
            res.sendStatus(404);
        });
};
