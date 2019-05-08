const knox = require("knox");
const fs = require("fs");

let secrets;

if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // secrets.json is in .gitignore
}

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: "imagesforimageboard"
});

exports.upload = function(req, res, next) {


    const s3Request = client.put(req.file.filename, {
        /// this is write stream
        // put method - puts files
        "Content-Type": req.file.mimetype,
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read" // says to make image public
    });
    const readStream = fs.createReadStream(req.file.path); /// this is read stream
    readStream.pipe(s3Request);

    s3Request.on("response", s3Response => {
        /// will listen when its done

        if (s3Response.statusCode == 200) {
            fs.unlink(req.file.path, () => {}); // to delete files
            next();
        } else {
            console.log(s3Response.statusCode);
            res.status(500).json({
                success: false
            });
        }

    });
};
