var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/article/new',function(req,res){
  console.log("new")
  res.render('new-article')
})

router.post('/articles',function(req,res){
  var id = Date.now().toString()
  console.log(req.body)
})

router.get('/article/:articleId',function(req,res){

})

module.exports = router;
