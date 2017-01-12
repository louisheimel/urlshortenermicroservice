var express = require('express');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var app = express();
var base_url = "https://camper-api-project-galaxyhitcher.c9users.io/";

var path = require('path');

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) { res.redirect('/static/index.html'); });

app.get(/^\/\d+/, function(req, res) {
  var short = +req.originalUrl.slice(1),
      long;
  MongoClient.connect("mongodb://localhost:27017/data", function(err, db) {
    if (err) throw err;
    db.collection('urls').find({'short': short}, function(err, data) {
									 if (err) throw err;
									 data.toArray((err, data) => { res.redirect(data[0].original);})
									  });
    db.close();
  });
});

app.get(/^\/new\/(.+)/, function(req, res) {
  function validURL(str) {
    addressMatcher = /https?:\/\/www\.(.+)\.com/;
    return str.match(addressMatcher);
  }

  function getRandom() {
    return Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
  }

  var url = req.params[0],
      output;
  if (validURL(url)) {
    MongoClient.connect("mongodb://localhost:27017/data", function(err, db) {
      db.createCollection('urls');
      var output = {"original":url,"short":getRandom()};
      db.collection("urls").save(output);
      var copy = _.pick(output, 'original', 'short');
      copy["short"] = base_url + copy["short"];
      res.end(JSON.stringify(copy));
      db.close();
    });
  } else {
    res.end('invalid url');
  }
});

app.listen(8080);
