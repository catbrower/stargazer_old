/**
 * Created by Cat on 11/29/2016.
 */

let MongoClient = require('mongodb').MongoClient;
let express = require('express');

const DB_CONN_STR = "mongodb://localhost:27017/StarGazer";
const PORT = 3001;
const STAR_COUNT = 120404;
let app = new express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static('build'));

MongoClient.connect(DB_CONN_STR, {useUnifiedTopology: true}, async (err, client) => {
    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/index.html");
    });

    app.get("/api/hip_count", (req, res, next) => {
        try {
            if(!client) throw new Error('Could not connect to db');
            if(err) throw err;

            const db = client.db('hip_stars');
            const collection = db.collection('stars');

            collection.countDocuments({}, (err, count) => {
                res.send("" + count);
            });
        } catch(error) {
            next(error);
        }
    });

    app.get("/api/get_stars", (req, res, next) => {
        try {
            if(!client) throw new Error('Could not connect to db');
            if(err) throw err;

            const db = client.db('hip_stars');
            let query = db.collection('stars').find();
            query.stream().on("data", (d) => {res.write(JSON.stringify(d))});
            query.stream().on("end", () => {res.end()});

        } catch(error) {
            next(error);
        }
    });
});

app.listen(PORT, () => {
    console.log("App listening");
});
