const Sequelize = require('sequelize');
var sequelize = new Sequelize('d3ebthkpq4digc', 'nrodnaffybvhho', '4cf5af7f2e2992b563045d181f55b8420e1a494cf0c755a5d2ebb1ea116f58e5', {
    host: 'ec2-54-80-122-11.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

var Post = sequelize.define("Post", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });


module.exports.initialize = () => {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(function () {
        resolve("database synced Successfully");
      })
      .catch(function () {
        reject("Unable to sync the database");
      });
  });
};

module.exports.getAllPosts = () => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Post.findAll()
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
};

module.exports.getPublishedPosts = () => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Post.findAll({
        where: { published: true },
      })
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
};

module.exports.getCategories = () => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Category.findAll()
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
};

module.exports.addPost = (postData) => {
  return new Promise((resolve, reject) => {
    for (var i in postData) {
      if (postData[i] == "") {
        postData[i] = null;
      }
    }
    postData.published = postData.published ? true : false;
    postData.postDate = new Date();
    sequelize.sync().then(function () {
      Post.create(postData)
        .then(resolve(console.log("Post created successfully")))
        .catch(function () {
          reject("Unable to create post");
        });
    });
  });
};

module.exports.getPostsByCategory = (cat) => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      Post.findAll({
        where: { category: cat },
      })
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
}


module.exports.getPublishedPostsByCategory = (input) => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Post.findAll({
        where: {
          published: true,
          category: input,
        },
      })
        .then(resolve(Post.findAll({ where: { published: true, category: input } })))
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });

}
module.exports.getPostsByMinDate = (minDateStr) => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Post.findAll({
        where: {
          postDate: {
            [gte]: new Date(minDateStr),
          },
        },
      })
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
}

module.exports.getPostById = (identity) => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      Post.findAll({
        where: { id: identity },
      })
        .then(function (data) {
          resolve(data[0]);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
}

module.exports.addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    if (categoryData.category == "") {
      categoryData.category = null;
    }
    sequelize.sync().then(function () {
      Category.create(categoryData)
        .then(resolve(console.log("category created successfully ")))
        .catch(reject("Unable to create category"));
    });
  });
};

module.exports.deleteCategoryById = (identity) => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      Category.destroy({
        where: { id: identity },
      })
        .then(resolve(console.log("category deleted successfully")))
        .catch(reject("Unable to delete category"));
    });
  });
};

module.exports.deletePostById = (identity) => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      Post.destroy({
        where: { id: identity },
      })
        .then(resolve(console.log("post deleted  successfully")))
        .catch(reject("Unable to delete category"));
    });
  });
};