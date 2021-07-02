var express = require("express");
var app = express();
cors = require("cors");
var server = require("http").createServer(app);
var fs = require("fs");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());

const authorsFile = "./data/authors.json";

app.get("/authors", function(req, res) {
  fs.readFile(authorsFile, "utf8", function(err, data) {
    var directory = JSON.parse(data);
    if (err) {
      throw err;
    }
    res.send(directory);
  });
});

var port = 3000;
server.listen(port, function () {
  console.log("Listening on port ".concat(port));
});
