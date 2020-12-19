const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

module.exports.getUserData = () => {
    return db.query(
        `SELECT id, url, username, title, description, created_at FROM images ORDER BY id DESC LIMIT 9`
    );
};
module.exports.getSingleImage = (imageId) => {
    return db.query(
        `SELECT id, url, username, title, description, created_at FROM images WHERE id = ($1)`,
        [imageId]
    );
};

module.exports.insertUserDataIntoImages = (
    url,
    username,
    title,
    description
) => {
    return db.query(
        `INSERT INTO images (url, username, title, description) VALUES($1, $2, $3, $4)`,
        [url, username, title, description]
    );
};

module.exports.getMoreImages = (lastId) => {
    return db.query(
        `SELECT url, title, id, (
     SELECT id FROM images
     ORDER BY id ASC
     LIMIT 1
 ) AS "lowestId" FROM images
 WHERE id < $1
 ORDER BY id DESC
 LIMIT 3`,
        [lastId]
    );
};

module.exports.getComments = (imageId) => {
    return db.query(
        `SELECT  comment, name, created_at FROM comments WHERE image_id =$1 ORDER BY id DESC`,
        [imageId]
    );
};

module.exports.insertComments = (name, comment, imageId) => {
    return db.query(
        `INSERT INTO comments (name, comment, image_id) VALUES($1, $2, $3) RETURNING created_at`,
        [name, comment, imageId]
    );
};
