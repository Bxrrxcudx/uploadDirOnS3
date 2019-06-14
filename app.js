require('dotenv').config();
// Packages for server config
const express    = require('express');
let logger       = require('morgan');
let bodyParser   = require('body-parser');
let cookieParser = require('cookie-parser');
let session      = require('express-session');
let fs           = require('fs');

const aws        = require('aws-sdk');
const app        = express();
let s3           = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "eu-west-3"
});

// Server config packages configured
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboard_cat',
    resave: false,
    saveUninitialized: true
}));

// Directory you want to upload
let treatDir = 'path_to_file';
// Bucket you are targeting
let bucket   = 'bucket_name';

fs.readdir(treatDir, (err, files) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    let index = 0;

    (function uploadDirOnS3() {
        if (index < files.length) {
            let pathToFile = treatDir + '/' + files[index];
            let filename   = files[index];

            fs.readFile(pathToFile, (err, data) => {
                if (err)
                    throw err;
                s3.putObject({
                    Bucket: bucket,
                    Key: filename,
                    Body: data
                }, s3err => {
                    if (s3err) {
                        // an error occurred
                        console.log(s3err, s3err.stack);
                        return false
                    } else {
                        // successful response
                        console.log(`file called ${filename} was uploaded!`);
                        index++;
                        return uploadDirOnS3()
                    }
                })
            });
        } else {
            console.log('All files were uploaded!');
            return false
        }
    })();
});

app.listen(3000, () => {
    console.log('This app is ready!')
});