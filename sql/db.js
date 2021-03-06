const spicedPg = require("spiced-pg");

let secrets;

if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // secrets.json is in .gitignore
}


const dbUrl = secrets.dbUrl;


const db = spicedPg(process.env.DATABASE_URL || dbUrl);



exports.getImages = () => {
    const q = `
        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 9;
    `;

    return db.query(q);
};

exports.getMoreImages = lastId => {
    const q = `
    SELECT * FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 9;
    `;

    return db.query(q, [lastId]);
};

exports.getOneImage = image_id => {
    const q = `
        SELECT * FROM images
        WHERE id = ($1);
    `;

    return db.query(q, [image_id]);
};

exports.selectComments = image_id => {
    const q = `
        SELECT comment, username FROM comments
        WHERE image_id = ($1);
    `;

    return db.query(q, [image_id]);
};

exports.insertComments = (image_id, comment, username) => {
    const q = `
    INSERT INTO comments (image_id, comment, username)
    VALUES ($1, $2, $3)
    RETURNING comment, username
    `;
    return db.query(q, [image_id, comment, username]);
};

exports.writeFileTo = (url, title, description, username) => {
    const q = `
    INSERT INTO images (url, title, description, username)
    VALUES ($1, $2, $3, $4)
    RETURNING url, title, id
    `;
    return db.query(q, [
        url || null,
        title || null,
        description || null,
        username || null
    ]);
};
