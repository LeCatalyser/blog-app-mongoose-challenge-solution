const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = requires("faker");
const mongoose = require("mongoose");

const should = chai.should();

const { BlogPost } = require("../models"); //i forget why I am writting this...
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL } = require("../confing");

chai.use(chaiHttp);

function seedBlogData() {
  console.info("seeding blog data");
  const seedData = [];

  for (let i = 1; i <= 1; i++) {
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
  return title[Math.floor(Math.random() * title.length)]; //is Math a method?
}

function generateBlogPost() {
  const content = ["STEM", "Women in Tech", "Diversity"];
  return content[Math.floor(Math.random() * content.length)];
}

function generateAuthor() {
  const authors = ["Luisa S.", "Eli M.", "Derrek"];
  const author = author[Math.floor(Math.random() * author.length)];
  return {
    author: faker.author.past() //not sure this is correct
  };
}
