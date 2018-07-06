var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = process.env.PORT || 3000;
var app = express();

// app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var databaseUri = mongoose.connect('mongodb://localhost/Mongo');

if(process.env.MONGODB_URI) {

  mongoose.connect(process.env.MONGODB_URI || "mongodb://heroku_l20tc740:Gogriz09!@ds223161.mlab.com:23161/heroku_l20tc740");
} else {
  mongoose.connect(databaseUri)
  .then(function(connection){
    console.log(('Mongo connect Success'));
  })
  .catch(function(error){
    console.log("Mongo connect error: ", error.message);
  })
}

// var dbs = mongoose.connection;

// dbs.on('error', function(err) {
//   console.log('Mongoose Error: ', err);
  
// });

// dbs.once('open', function() {
//   console.log('Mongoose connection successful');
// })

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/Mongo");

// Routes

app.get("/scrape", function(req, res) {
  console.log("scrape");
  
  axios.get("https://www.wired.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    // console.log(response.data);
    
    $(".card-component").each(function(i, element) {
      console.log("___________________");
      
      var result = {};
      result.title = $(this)
        .find("h2")
        .text();
        
      result.link = 'https://www.wired.com' + $(this)
        .find("a")
        .attr("href");
        // console.log(result.link);

      console.log("Result" + JSON.stringify(result));

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          // console.log(err);
          
          // return res.json(err);
        });
    });
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({}).then(dbArticle => {
    res.json(dbArticle)
  })
  .catch(err => {
    res.json(err)
  })
});

app.get("/articles/:id", function(req, res) {
  let articleId = req.params.id;
  db.Article.findById(articleId)
    .populate("note")
    .then(article => res.json(article))
    .catch(err => res.json(err))
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({_id: req.params.id}, { $set: {note: dbNote._id} }, {new: true});
    })
    .then(function(dbArticleNote) {
      res.json(dbArticleNote);

    })
    .catch(function(err) {
      res.json(err);
    })
});

app.delete("/notes/:id", function(req, res) {
  db.Note.findByIdAndRemove(req.params.id)
  .populate("article")
  .then(note => res.json(note))
  .catch(err => res.json(err))
})
 
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
