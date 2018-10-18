"use strict"
var express = require('express');
var fs = require('fs')
var path = require('path')
var multer = require('multer'); // v1.0.5
var upload = multer({ dest: "uploads/" }); // for parsing multipart/form-data
var router = express.Router();
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('myDatabase.db')


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET article/new page*/
router.get('/article/new', function (req, res) {
  console.log("new")
  res.render('new-article',{article:null})
})

/*POST articles */
router.post('/articles', upload.any(), function (req, res) {
  var article = {}
  article.title = req.body.title
  article.content = req.body.content
  console.log(req.files[0])

  if (req.files.length && req.files[0].fieldname == 'poster') {
    article.poster = req.files[0].filename
    fs.writeFileSync(path.resolve('data/images', article.poster), fs.readFileSync(req.files[0].path))
  }


  if(article.title.length>20){
    article.err = "title cannot exceed 20 letters!"
    res.render('new-article',{article:article})
  }else{
    db.serialize(function(){
      db.run("INSERT INTO Article(title,content,poster) values($title, $content, $poster)",
        { 
          $title: article.title,
          $content: article.content,
          $poster: article.poster
        }, function(err) {
          if(err) throw err 
          res.redirect("/article/" + this.lastID)
        })
    })
  }
})

/*GET article/:articleId page */
router.get('/article/:articleId', function (req, res) {
  var id = req.params.articleId

  db.serialize(function () {
    db.get("SELECT * FROM Article WHERE id = $aid", { $aid: id }, function (err, article) {
      if(err) throw err 

      if (article) {
        res.render('show-article', { article_params: article })
      } else {
        res.send(404)
      }
    })

  })
})

/*GET articles page */
router.get('/articles', function (req, res) {

  db.serialize(function () {
    db.all("SELECT * FROM Article", function (err, articles) {
      if(err) throw err
      
      res.render('article-list', { articles: articles })
    })
  })
})


/* GET article/:articleId/edit page */
router.get('/article/:articleId/edit', function (req, res) {
  var id = req.params.articleId
  db.serialize(function () {
    db.get('SELECT * FROM Article WHERE id = $aid', { $aid: id }, function (err, article) {
      if(err)throw err

      if(article){
        res.render('modify-article', { article_params: article})
      }else{
        res.send(404)
      }

    })
  })
})

/* PUT article/:articleId */
router.put('/article/:articleId', upload.any(), function (req, res) {
  console.log("PUT success")
  var id = req.params.articleId
  var data = {}
  data.title = req.body.title
  data.content = req.body.content

  //读取原文件
  db.serialize(function () {
    db.get("SELECT * FROM Article WHERE id = $aid", { $aid: id }, function (err, article) {
      if(err)throw err

      console.log(article)
      var article_params = article

      // 改完PUT的form 再来优化下，好像有点累赘
      for (var item in data) {
        if (data[item].length != 0 && article_params[item] != data[item]) {
          article_params[item] = data[item]
        }
      }

      var posterName = article_params.poster
      console.log(posterName)
      if (req.files.length != 0) {
        posterName = Date.now().toString() + "_poster"
        var posterPath = req.files[0].path
        fs.writeFileSync(path.resolve('data/images', posterName), fs.readFileSync(posterPath))
      }

      db.serialize(function(){
        db.run("UPDATE Article SET title = $title, content = $content, poster = $poster WHERE id = $id",{$title:article_params.title, $content:article_params.content, $poster:posterName, $id:id}
              ,function(err){
                if(err)throw err
                console.log(req.accepts('text/html') === 'text/html')
                //res.redirect("/article/" + id) 
                // if (req.query['_method']) {
                //   res.redirect("/article/" + id)
                // } else {
                //   res.send("/article/" + id)
                // }
                if(req.accepts('text/html')=== "text/html"){
                  res.redirect("/article/"+id)
                }else{
                  res.send("/article/"+id)
                }
              })
      })

    })

  })

})

/*DELETE article/:articleId */
//删除只做文件替换，不做真正的删除，存储成本低
router.delete('/article/:articleId', function (req, res) {
  var id = req.params.articleId

  db.serialize(function(){
    db.run("DELETE FROM Article WHERE id=$id",{$id:id},function(err){
      if(err){
        throw new Error(err)
      }
      res.send("success")
      // if (req.accepts('text/plain') === 'text/plain') {
      //   console.log("delete")
      //   res.send("success")
      // }else{

      // }

    })
  })
})

module.exports = router
  