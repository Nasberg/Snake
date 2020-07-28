const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// connect to mongodb
mongoose.connect("mongodb+srv://maxedevents:maxedevents@eriksfirstcluster-0kjfp.gcp.mongodb.net/snake_db?retryWrites=true&w=majority");
let db = mongoose.connection;

// check connection
db.once('open', () => {
  console.log('Connected to mongodb');
})

// check for db errors
db.on('error', (err) => {
  console.log(err);
});

// highscores schema
let highscoreSchema = mongoose.Schema({
  player: String,
  score: Number
});

let Highscores = mongoose.model('highscores', highscoreSchema);


// initialize encoder parser
const urlEncoderParser = bodyParser.urlencoded({extended: false});

// init express
const app = express();

// set up template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set up static files
app.use(express.static('./public'));

// listen to port
app.listen(4200, () => {
  console.log('Server running on port 4200');
});



app.get('/', (req, res) => {
  res.render('index');
});

app.get('/get-highscore', (req, res) => {
  Highscores.find({}, (err, data) => {
    if (err) {
      console.error();(err);
    }
    else {
      res.json(data);
    }
  });
});

app.post('/new-highscore', urlEncoderParser, (req, res) => {
  const newHighscore = Highscores(req.body).save((err, data) => {
    if (err) {
      console.log(err);
    }
    else {
      res.json(data);
    }
  });
});
