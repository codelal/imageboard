const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

module.exports.getUserData = () => {
    return db.query(
        `SELECT url, title, username, description FROM images ORDER BY created_at DESC`
    );
};

module.exports.insertUserData = (url, title, username, description) => {
    return db.query(
        `INSERT INTO images (url, title, username, description) VALUES($1, $2, $3, $4)`,
        [url, title, username, description]
    );
};
