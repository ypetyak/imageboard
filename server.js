const express = require("express");
const app = express();

app.use(express.static("./public"));

const db = require("./sql/db.js");

////////////

const bp = require("body-parser");

const fs = require("fs");

const s3 = require("./s3");
const config = require("./config");

//////

app.use(
    bp.urlencoded({
        extended: false
    })
);

app.use(bp.json());

///////////  This is a multer middleware and its boilerplate
///////////

var multer = require("multer"); // will do some magic to upload files to our computer
var uidSafe = require("uid-safe"); // takes the files we upload and gives them a completely new name
var path = require("path");

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        // where to save files into
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            // 24 is a number of characters we tell uidSafe to create for new files
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    // we pass file to multer
    storage: diskStorage,
    limits: {
        fileSize: 2097152 /// the only limit to the files we have, its size, around 2 mb.
        // it will work without limits, but we do this for security reasons.
    }
});

///////////////
///////////////

app.get("/images", (req, res) => {
    db.getImages()
        .then(results => {
            res.json(results.rows);
        })
        .catch(err => {
            console.log("Error in extracting images:", err);
        });
});

/////////////
////////////

app.get("/moreImages", (req, res) => {
    console.log("More Images Req: ", req.query.lastImageId);

    db.getMoreImages(req.query.lastImageId)
        .then(results => {
            res.json(results.rows);
            console.log(results.rows);
        })
        .catch(err => {
            console.log("Error in extracting MORE images:", err);
        });
});

///// Here we will create a new GET request for a modal to get information from the Table for our single image page.

app.get("/images/:image_id", (req, res) => {
    // console.log("this is: ", req);
    var imageID = req.params.image_id;
    // console.log("Image ID?", req.params.image_id);
    db.getOneImage(imageID)
        .then(result => {
            // console.log("First Result", result.rows);
            var ImageInfo = result.rows;
            db.selectComments(req.params.image_id).then(result => {
                // console.log("Second Results", result.rows);
                var totalInfo = ImageInfo.concat(result.rows);
                // console.log("All Results: ", totalInfo);
                res.json(totalInfo);
            });
            // console.log("Here are the results:", results.rows);
            // res.json = results.rows;

            // res.render("index");
        })
        .catch(err => {
            console.log("Error in extracting One Image:", err);
        });
});

////// Post request for modals

app.post("/images/:image_id", (req, res) => {
    // console.log("Our request: ", req);
    console.log("Our Body: ", req.body.comment);
    console.log("Hre is our post request for images", req.params.image_id);

    db.insertComments(req.params.image_id, req.body.comment, req.body.username)
        .then(results => {
            res.json(results.rows);
        })
        .catch(err => {
            console.log("Error in writeFileTo: ", err);
            res.status(500).json({
                success: false
            });
        });
});
//////////
//////////

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    db.writeFileTo(
        config.s3Url + req.file.filename,
        req.body.title,
        req.body.description,
        req.body.username
    )
        .then(({ rows }) => {
            console.log("Anything hwread");
            res.json({
                image: rows[0]
            });
        })
        .catch(err => {
            console.log("Error in writeFileTo: ", err);
            res.status(500).json({
                success: false
            });
        });

});

app.listen(8080, () => console.log(`Let't rock!`));
