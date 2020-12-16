const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

module.exports.getUserData = () => {
    return db.query(
        `SELECT url, username, title, description FROM images ORDER BY created_at DESC`
    );
};

module.exports.insertUserDataIntoImages = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description) VALUES($1, $2, $3, $4)`,
        [url, username, title, description]
    );
};
