/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Dhruvit Sanjaykumar Shah  Student ID: 129110219   Date: 12-12-2022
*
*  Cyclic Web App URL:
*
*  GitHub Repository URL: 
*
********************************************************************************/
const authData = require('./auth-service.js');
var express = require("express");
var app = express();
var path = require("path");
var blogservice = require(__dirname + '/blog-service.js');
var HTTP_PORT = process.env.PORT || 8080;
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const clientSessions = require('client-sessions');


cloudinary.config({
  cloud_name: 'dvquvfdjo',
    api_key: '647791765135922',
    api_secret: 'buyzTMaQKU5ian1kFTnt-W7A1Ok',
    secure: true
});

const upload = multer(); 


app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    safeHTML: function (context) {
      return stripJs(context);
    },
    formatDate: function (dateObj) {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

  }
}));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', '.hbs');

app.get("/", function (req, res) {
  res.redirect("/blog");
});


app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));
app.use(express.static('views'));


app.use(clientSessions( {
  cookieName: "session",
  secret: "dsshah11@myseneca.ca",
  duration: 2*60*1000,
  activeDuration: 1000*60
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


ensureLogin = (req,res,next) => {
  if (!(req.session.user)) {
      res.redirect("/login");
  }
  else {
      next();
  }
};


app.get("/about", function (req, res) {
  res.render('about')
});

app.get('/blog', async (req, res) => {

  
  let viewData = {};

  try {

    
    let posts = [];

   
    if (req.query.category) {
      
      posts = await blogservice.getPublishedPostsByCategory(req.query.category);
    } else {
      
      posts = await blogservice.getPublishedPosts();
    }

   
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    
    let post = posts[0];

   
    viewData.posts = posts;
    viewData.post = post;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
   
    let categories = await blogservice.getCategories();

    
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  
  res.render("blog", { data: viewData })

});

app.get('/blog/:id', async (req, res) => {

  
  let viewData = {};

  try {

   
    let posts = [];

    
    if (req.query.category) {
      
      posts = await blogservice.getPublishedPostsByCategory(req.query.category);
    } else {
     
      posts = await blogservice.getPublishedPosts();
    }

    
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    
    viewData.posts = posts;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    
    viewData.post = await blogservice.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    
    let categories = await blogservice.getCategories();

    
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  
  res.render("blog", { data: viewData })
});

app.get("/posts",ensureLogin, function (req, res) {
 
  if (req.query.category < 6 && req.query.category > 0) {
    blogservice.getPostsByCategory(req.query.category).then((data) => {
      if (data.length > 0) {
        res.render("posts", { posts: data });
      }
      else {
        res.render("posts", { message: "No results" });
      }
    })
      .catch(() => {
        res.render("posts", { message: "No results" });
      });
  }

  
  else if (req.query.minDate != null) {
    blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
      if (data.length > 0) {
        res.render("posts", { posts: data });
      }
      else {
        res.render("posts", { message: "No results" });
      }
    }).catch(function () {
      res.render("posts", { message: "No results" });
    })
  }
  else {
    blogservice.getAllPosts().then(function (data) {
      if (data.length > 0) {
        res.render("posts", { posts: data });
      }
      else {
        res.render("posts", { message: "No results" });
      }
    })
      .catch(function (err) {
        res.render("posts", { message: "no results" });
      });
  }
}
);


app.get('/post/:id', ensureLogin,(req, res) => {
  blogservice.getPostById(req.params.id).then((data) => {
    res.json(data);
  }).catch(function (err) {
    res.json({ message: err });
  });
});

app.get("/categories", ensureLogin,function (req, res) {
  blogservice.getCategories().then(function (data) {
    if (data.length > 0) {
      res.render("categories", { categories: data });
    }
    else {
      res.render("categories", { message: "No results" });
    }
  })
    .catch(function () {
      res.render("categories", { message: "No results" });
    })
});

app.get("/categories/add", ensureLogin,(req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", ensureLogin,(req, res) => {
  blogservice.addCategory(req.body).then(() => {
    res.redirect("/categories");
  }).catch(console.log("Unable to Add category"));
});

app.get("/categories/delete/:id", ensureLogin,(req, res) => {
  blogservice.deleteCategoryById(req.params.id).then(() => {
    res.redirect("/categories");
  }).catch(console.log("Unable to Remove Category / Category not found)"));
});

app.get("/posts/add", ensureLogin,function (req, res) {
  blogservice.getCategories().then((data) => {
    res.render("addPost", {
      categories: data,
    });
  }).catch(() => {
    res.render("addPost"), { categories: [] };
  });
});

app.get("/posts/delete/:id", ensureLogin,(req, res) => {
  blogservice.deletePostById(req.params.id).then(() => {
    res.redirect("/posts");
  }).catch(console.log("Unable to Remove Post / Post not found"));
});

app.post('/posts/add',ensureLogin, upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    
    blogservice.addPost(req.body).then(() => {
      res.redirect('/posts');
    }).catch((data) => { res.send(data); })
  }
});


app.get("/login", (req,res) => {
  res.render("login");
});

app.get("/register", (req,res) => {
  res.render("register");
});

app.post("/register", (req,res) => {
  authData.registerUser(req.body)
  .then(() => res.render("register", {successMessage: "User created" } ))
  .catch (err => res.render("register", {errorMessage: err, userName:req.body.userName }) )
});

app.post("/login", (req,res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
  .then(user => {
      req.session.user = {
          userName:user.userName,
          email:user.email,
          loginHistory:user.loginHistory
      }
      res.redirect("/posts");
  })
  .catch(err => {
      res.render("login", {errorMessage:err, userName:req.body.userName} )
  }) 
});


app.get("/logout", (req,res) => {
  req.session.reset();
  res.redirect("/login");
});

app.get("/userHistory", ensureLogin, (req,res) => {
  res.render("userHistory", {user:req.session.user} );
})

app.get("*", (req, res) => {
  res.status(404).render("404");
});


blogservice.initialize()
.then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch(() => {
    console.log("Error- server is not properly working");
  });