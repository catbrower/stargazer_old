/**
 * Created by Cat on 11/29/2016.
 */

let MongoClient = require('mongodb').MongoClient;
let express = require('express');

const DB_CONN_STR = "mongodb://localhost:27017/StarGazer";
let app = new express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static('build'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/hip_count", (req, res) => {
    // Use connect method to connect to the Server
    MongoClient.connect(DB_CONN_STR, { useUnifiedTopology: true },(err, client) => {
        const db = client.db('hip_stars');
        const collection = db.collection('stars');

        collection.countDocuments({}, (err, count) => {
            res.send("" + count);
        });
    });
});

app.get("/api/get_hip/:pageSize/:page", (req, res) => {
    // Use connect method to connect to the Server
    MongoClient.connect(DB_CONN_STR, { useUnifiedTopology: true }, (err, client) => {
        let pageSize = parseInt(req.params.pageSize);
        let page = parseInt(req.params.page);
        let skip = pageSize * (page - 1);

        const db = client.db('hip_stars');
        const collection = db.collection('stars');
        collection.find().skip(skip).limit(pageSize).toArray((err, items) => {
            let results = [];

            for(let i = 0; i < items.length; i++) {
                try {
                    results[i] = {
                        id: items[i]._id,
                        x: items[i].x,
                        y: items[i].y,
                        z: items[i].z,
                        r: items[i].r,
                        g: items[i].g,
                        b: items[i].b,
                        B_V: items[i].B_V,
                        Hpmag: items[i].Hpmag
                    }
                } catch(err) {
                    console.log(err);
                }
            }

            res.send(results);
        });
    });
});

app.listen(3000);
console.log("App listening");
