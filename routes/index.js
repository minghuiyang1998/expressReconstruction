var express = require('express');
var fs = require('fs')
var path = require('path')
var multer = require('multer'); // v1.0.5
var upload = multer({ dest: "uploads/" }); // for parsing multipart/form-data
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/article/new', function (req, res) {
  console.log("new")
  res.render('new-article')
})

router.post('/articles', upload.any(), function (req, res) {
  var id = Date.now().toString()
  var data = {}
  data.title = req.body.title
  data.content = req.body.content

  if (req.files.length != 0) {
    var fileName = id + '_poster'
    data.file = fileName
    var filePath = req.files[0].path
    var file = fs.readFileSync(filePath)
    fs.writeFileSync(path.resolve('data/images', fileName), file)
  }

  fs.writeFileSync(path.resolve('data/articles', id), JSON.stringify(data))
  res.redirect("/article/" + id)
})

router.get('/article/:articleId', function (req, res) {
  var id = req.params.articleId
  var article = fs.readFileSync(path.resolve('data/articles', id))
  var article_params = JSON.parse(article)

  if (article_params.file) {
    article_params.file = "/images/" + article_params.file
  }

  res.render('show-article', { params: article_params })

})

router.get('/articles', function (req, res) {
  var articles = fs.readdirSync("data/articles")
  res.render('article-list', { articles: articles })
})

router.get('/article/:articleId/edit', function (req, res) {
  var id = req.params.articleId
  var article = fs.readFileSync(path.resolve('data/articles', id))
  var params = JSON.parse(article)
  params.id = id
  res.render('modify-article', { params: params })
})

router.put('/article/:articleId', upload.any(), function (req, res) {
  console.log("PUT success")
  var id = req.params.articleId
  var data = {} 
  data.title = req.body.title
  data.content = req.body.content

  console.log(req.body)
  console.log(req.files)

  //读取原文件
  var article = fs.readFileSync(path.resolve('data/articles', id))
  var article_params = JSON.parse(article)

  // 改完PUT的form 再来优化下，好像有点累赘
  for (var item in data) {
    if (data[item].length != 0 && article_params[item] != data[item]) { 
      article_params[item] = data[item]
    }
  }  
 
  console.log(111)
  //如果上传了文件直接替换，不上传新图片data就没有file字段
  if (req.files.length != 0) { 
    var fileName = id + "_poster" 
    data.file = fileName
    var filePath = req.files[0].path 
    var file = fs.readFileSync(filePath)
    if (article_params.file) {
      fs.unlinkSync(path.resolve('data/images', article_params.file))
    }
    fs.writeFileSync(path.resolve('data/images', fileName), file)
    article_params.file = data.file
  }
 
  fs.writeFileSync(path.resolve('data/articles', id), JSON.stringify(article_params))

  if(req.query['_method']) { 
    res.redirect("/article/" + id)
  }else {
    res.send("/article/" + id)   
  }
})

router.delete('/article/:articleId', function (req, res) {
  var id = req.params.articleId
  var file = fs.readFileSync(path.resolve('data/articles', id))
  var params = JSON.parse(file)

  if (params.file) {
    fs.unlinkSync(path.resolve('data/images', params.file))
  }

  fs.unlinkSync(path.resolve('data/articles', id))
  console.log(req.get('accept'))
  if (req.accepts('text/plain') === 'text/plain') {
    console.log("delete")
    res.send("success")
  }
})

module.exports = router
