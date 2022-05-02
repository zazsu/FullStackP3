var express = require('express');
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ type: 'application/*' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

require('dotenv').config()

// Take the module to use
var Schema = mongoose.Schema;

var user = process.env.MONGO_USERID
var pw = process.env.MONGO_PW;

const uri = "mongodb+srv://" + user + ":" + pw + "@cluster0.sm232.mongodb.net/Test?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const Movie = mongoose.model( "Movie", {
    title: String,
    year: Number
    },
    "movies"
)

app.get("/api/getall", function(req, res) 
{
    Movie.find({}, null, {limit:20}, function(err,results){
        //if err then return the fault code to browser
        if(err) {
            res.status(500).json("Fault in data search");
        } else {
        // Return the results as JSON-objects to browser
            res.status(200).json(results);
        }; 
    });
});

app.get("/api/:id", function(req, res) 
{
    var id = req.params.id;

    Movie.findById(id, function(err,results){
        //if err then return the fault code to browser
        if(err) {
        res.status(500).json("Fault in data search");
        } else {
        // Return the results as JSON-objects to browser
        res.status(200).json(results);
        }; 
    });
});

app.post("/api/add", function(req, res) {
 
    var newMovie = new Movie({
        title: req.body.title,
        year: req.body.year
    });

    newMovie.save(function(err, user) {
        if (err) return console.log(err);
        console.log(user);
        });

    res.send("Add one movie: " + req.body.title + 
    " (" + req.body.year + ")");
    }
);

app.patch("/api/update/:id", function(req, res) {

    var query = {id: req.body.id}
    var newData = {title: req.body.title, year : req.body.year}

    var options = { new: true };

    Movie.findOneAndUpdate(
        query,
        newData,
        options,
        function(err, results) {
        console.log(results);
        }
        );

    res.send("Update movie with id: " + req.params.id);
    }
 );

app.delete("/api/delete/:id", function(req, res) {
// Take the id for the delete operation
    var id = req.params.id;

    Movie.findByIdAndDelete(id, function (err, results) 
    {
    // Database error handling
        if (err) {
            console.log(err);
            res.status(500).json("Fault in deleteoperation.");
        } // Database ok, but object cannot be found
        else if (results == null) {
            res.status(200).json("Cannot be deleted as object cannot be found.");
        } // Successful delete operation
        else {
            console.log(results);
            res.status(200).json("Deleted " + id + " " + 
            results.title);
        }
    });
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  }); 