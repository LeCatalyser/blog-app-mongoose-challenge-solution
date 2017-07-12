const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");

const should = chai.should();

const { BlogPost } = require("../models");
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL } = require("../config");

chai.use(chaiHttp);

function seedBlogData() {
  console.info("seeding blog data");
  const seedData = [];

  for (let i = 1; i <= 10; i++) {
    seedData.push(generateBlogPost());
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

  describe("GET endpoint", function() {
    it("should return all existing posts", function() {
      let res;
      return chai
        .request(app)
        .get("/posts")
        .then(function(_res) {
          //the answer has => do i need this?
          res = _res;
          res.should.have.status(200);
          res.body.should.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          // expect(res.body.length).toBe(count)
          res.body.should.have.lengthOf(count);
        });
    });

    it("should return blog post with the right fields", function() {
      let resBlog;
      return chai.request(app).get("/posts").then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");
        res.body.should.have.length.of.at.least(1);

        res.body.forEach(function(post) {
          post.should.be.a("object");
          post.should.include.keys(
            "id",
            "title",
            "content",
            "author",
            "created"
          );
        });
        resBlog = res.body[0];
        //return post.findById(resBlog.id);
      });
      // .then(function(post) {
      //   //why don't I have all the same five as in line 95-99?
      //   resBlog.author.should.equal(post.author);
      //   resBlog.title.should.equal(post.title);
      //   resBlog.content.should.equal(post.content);
      // });
    });
  });
  describe("POST endpoint", function() {
    it("should add a new post", function() {
      const newPost = {
        title: faker.lorem.sentence(),
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        content: faker.lorem.text()
      };

      return chai
        .request(app)
        .post("/posts")
        .send(newPost)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.include.keys(
            "id",
            "title",
            "content",
            "author",
            "created"
          );
          res.body.title.should.equal(newPost.title);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.author.should.equal(
            `${newPost.author.firstName} ${newPost.author.lastName}`
          );
          res.body.content.should.equal(newPost.content);
          return BlogPost.findById(res.body.id).exec();
        })
        .then(function(post) {
          post.title.should.equal(newPost.title);
          post.content.should.equal(newPost.content);
          post.author.firstName.should.equal(newPost.author.firstName);
          post.author.lastName.should.equal(newPost.author.lastName);
        });
    });
  });

  describe("PUT endpoint", function() {
    it("should update fields you send over", function() {
      const updateData = {
        //why not  use fake data?
        title: "cats cats cats",
        content: "dogs dogs dogs",
        author: {
          firstName: "foo",
          lastName: "bar"
        }
      };
      return BlogPost.findOne()
        .exec()
        .then(post => {
          updateData.id = post.id;

          return chai.request(app).put(`/posts/${post.id}`).send(updateData);
        })
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.title.should.equal(updateData.title);
          res.body.author.should.equal(
            `${updateData.author.firstName} ${updateData.author.lastName}`
          );
          res.body.content.should.equal(updateData.content);

          return BlogPost.findById(res.body.id).exec();
        })
        .then(post => {
          post.title.should.equal(updateData.title);
          post.content.should.equal(updateData.content);
          post.author.firstName.should.equal(updateData.author.firstName);
          post.author.lastName.should.equal(updateData.author.lastName);
        });
    });
  });

  describe("DELETE endpoint", function() {
    it("should delete a post by id", function() {
      let post;
      return BlogPost.findOne()
        .exec()
        .then(_post => {
          post = _post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return BlogPost.findById(post.id);
        })
        .then(function(_post) {
          should.not.exist(_post);
        });
    });
  });
});
