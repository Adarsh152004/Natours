const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

dotenv.config({ path: "./config.env" });

const DB =
  "mongodb://adarsh:Adarsh%402004@cluster0-shard-00-00.pp8hg.mongodb.net:27017,cluster0-shard-00-01.pp8hg.mongodb.net:27017,cluster0-shard-00-02.pp8hg.mongodb.net:27017/natours?authSource=admin&replicaSet=atlas-lrqi6k-shard-0&retryWrites=true&w=majority&appName=Cluster0&ssl=true";

mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
    userNewUrlParser: true,
    userCreateIndex: true,
    userFindAndModify: false,
    useUnifiedTopology: true,
    writeConcern: {
      w: "majority",
      timeout: 5000,
    },
  })
  .then(() => {
    console.log("DB connection successful!");
  });

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"),
);

// Import data into DB
const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Tour.create(tours);
    await Review.create(reviews);
    console.log("Data succesfully loaded");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
};

// Delete all data from collection
const deleteDate = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data successfully deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  // node dev-data/data/import-dev-data.js --import
  importData();
} else if (process.argv[2] === "--delete") {
  // node dev-data/data/import-dev-data.js --delete
  deleteDate();
}

console.log(process.argv);
