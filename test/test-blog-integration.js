const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");

const should = chai.should();

const { BlogPost } = require("../models"); //i forget why I am writting this...
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL } = require("../config");

chai.use(chaiHttp);

function seedBlogData() {
  console.info("seeding blog data");
  const seedData = [];

  for (let i = 1; i <= 10; i++) {
    seedData.push(generateBlogData());
  }
  return BlogPost.insertMany(seedData);
}

function generateBlogPostName() {
  const title = [
    "how to thrive in the tech field",
    "Perseverance: how you make it",
    "How coding can improve your carreer"
  ];
  return title[Math.floor(Math.random() * title.length)]; //used to generate a number between 0 and the lenght
}

function generateBlogPost() {
  return {
    author: faker.name.lastName(),
    title: faker.lorem.paragraph(),
    content: faker.lorem.text()
  };
}

function tearDownDb() {
  console.warn("Deleting database");
  return mongoose.connection.dropDatabase();
}

describe("BlogPost API resource", function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe("GET endpoint", function() {});
});
