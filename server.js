const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
// const Tour = require('./models/tourModel');


const DB = 'mongodb://adarsh:Adarsh%402004@cluster0-shard-00-00.pp8hg.mongodb.net:27017,cluster0-shard-00-01.pp8hg.mongodb.net:27017,cluster0-shard-00-02.pp8hg.mongodb.net:27017/natours?authSource=admin&replicaSet=atlas-lrqi6k-shard-0&retryWrites=true&w=majority&appName=Cluster0&ssl=true';

mongoose.connect(DB, {
  // .connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  writeConcern: {
    w: 'majority',
    timeout: 5000
  }
})
  .then(() => {console.log('DB connection successful!');

}).catch(err => {
  console.error('DB connection error:', err.message);
});

// 4) Start the server
const port = process.env.PORT || 3001;
const server = app.listen(port, () =>{
  console.log(`App is running on port ${port}.......`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

