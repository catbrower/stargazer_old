/**
 * Created by Cat on 11/29/2016.
 */

var MongoClient = require('mongodb').MongoClient;
var express = require('express');

const DB_CONN_STR = "mongodb://localhost:27017/StarGazer";
var app = new express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static('dist'));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/dist/index.html");
});

app.get("/api/constellation/:name", function(req, res) {
    // Connection URL
    var url = DB_CONN_STR;

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        var constellation = db.collection("hip_" + req.params.name.toLowerCase() + "_lines");
        constellation.find({}).toArray(function (err, items) {
            res.send(items);
        });
    });
});

app.get("/api/hip_count", function(req, res) {
    // Use connect method to connect to the Server
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        var collection = db.collection('hip_stars');
        collection.count({}, function(err, count) {
            res.send("" + count);
        });
    });
});

app.get("/api/get_hip/:pageSize/:page", function(req, res) {
    // Use connect method to connect to the Server
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        var pageSize = parseInt(req.params.pageSize);
        var page = parseInt(req.params.page);
        var skip = pageSize * (page - 1);
        var collection = db.collection('hip_stars');
        collection.find().skip(skip).limit(pageSize).toArray(function(err, items) {
            var results = [];

            for(var i = 0; i < items.length; i++) {
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
