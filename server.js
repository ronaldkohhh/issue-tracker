'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');
require('dotenv').config();

// + Require mongoose for database
const mongoose = require('mongoose');

// + Require mongodb's DB and mongodb's MongoClient
const Db = require('mongodb').Db;
const MongoClient = require('mongodb').MongoClient;

// + Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

// + For database connection
const myDB = async function main(callback) {
  const URI = process.env.MONGO_URI;
  const client = new MongoClient(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    // Make the appropriate DB calls
    await callback(client)
  } catch (err) {
    console.error(err);
    throw new Error('Unable to Connect to Database');
  }
}

myDB(async client => {
  const myDatabase = await client.db('database').collection('projects');
  console.log("Connected to Database!");
})
  .catch((err) => {
    console.log(err);
  });


//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function() {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
