var express = require('express');
var router = express.Router()
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('myDatabase.db');

var md5 = require('md5')
const salt = '1234567'


/* GET users listing. */
router.get('/',function(req,res){
  res.render('register')
})

router.post('/', function(req, res, next) {
  console.log(req.body)
  var password = md5(md5(req.body.password)+salt)
  db.serialize(function () {
    db.run("INSERT INTO User(name,password) values($name, $password)",
      {
        $name: req.body.email,
        $password: password
      }, function (err) {
        if (err) throw err
        res.send("success!")
      })
  })
});

module.exports = router;
