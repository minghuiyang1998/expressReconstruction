var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs')
var path = require('path')
var multer = require('multer'); // v1.0.5
var upload = multer({dest:"uploads/"}); // for parsing multipart/form-data
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/article/new',function(req,res){
  console.log("new")
  res.render('new-article')
})

router.post('/articles',upload.any(),function(req,res){
  var id = Date.now().toString()
  console.log(req.files)
  console.log(req.body)
  var data = {}
  data.title = req.body.title
  data.content = req.body.content

  if(req.files){
    var fileName = id + '_poster'
    data.file = fileName
    var filePath = req.files[0].path
    console.log(data)
    var file = fs.readFileSync(filePath)
    console.log(file)
    fs.writeFileSync(path.resolve('public/images',fileName),file)
  }

  fs.writeFileSync(path.resolve('public/articles',id),JSON.stringify(data))
  res.redirect("http://127.0.0.1:3000/article/"+id)
})

router.get('/article/:articleId',function(req,res){
  console.log("article"+req.params.articleId)
  var id = req.params.articleId
  var article = fs.readFileSync(path.resolve('public/articles',id))
  var article_params = JSON.parse(article)

  if(article_params.file){
    article_params.file = "http://127.0.0.1:3000/images/"+article_params.file
  }

  res.render('show-article',{params:article_params})

})

router.get('/articles',function(req,res){
  var articles = fs.readdirSync("public/articles")
  res.render('article-list',{articles:articles})
})

router.get('/article/:articleId/edit',function(req,res){
  var id = req.params.articleId
  var article = fs.readFileSync(path.resolve('public/articles',id))
  var params = JSON.parse(article)
  params.id = id
  res.render('modify-article',{params:params})
})

router.put('/article/:articleId',upload.any(),function(req,res){
  var id = req.params.articleId
  console.log(id)
  var data = {}
  data.title = req.body.title
  data.content = req.body.content
 

  var article = fs.readFileSync(path.resolve('public/articles',id))
  var article_params = JSON.parse(article)
  for(var item in data){
    if(item != 'file' && data[item].length != 0 && article_params[item]!=data[item]){
      article_params[item] = data[item]
    }
  }
  
  if(req.files){
    
    var fileName = id + '_poster'
    data.file = fileName
    var filePath = req.files[0].path
    var file = fs.readFileSync(filePath)

    if(file.length != 0){
      fs.writeFileSync(path.resolve('public/images',fileName),file)
      fs.unlinkSync(path.resolve('public/images',article_params.file))
      article_params.file = data.file
    }
  }

  console.log(data)
  fs.writeFileSync(path.resolve('public/articles',id),JSON.stringify(article_params))
  console.log(111)
  if(req.get('accept')==='text/html'){
    res.send("http://127.0.0.1:3000/article/"+id)
  }
})

router.delete('/article/:articleId',function(req,res){
  var id = req.params.articleId
  var file = fs.readFileSync(path.resolve('public/articles',id))
  var params = JSON.parse(file)

  if(params.file){
    fs.unlinkSync(path.resolve('public/images',params.file))
  }

  fs.unlinkSync(path.resolve('public/articles',id))
  console.log(req.get('accept'))
  if(req.get('accept')==="text/plain"){
    console.log("delete")
    res.send("success")
  }
})
module.exports = router
