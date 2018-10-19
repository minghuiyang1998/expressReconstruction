var express = require('express');
var router = express.Router()
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('myDatabase.db');

var md5 = require('md5')
const salt = '1234567'


/* GET users listing. */
router.get('/join', function (req, res) {
  res.render('register', { err: null })
})

router.post('/join', function (req, res) {
  console.log(req.body)
  var password = md5(md5(req.body.password) + salt)

  db.serialize(function () {
    db.run("INSERT INTO User(email,password) values($email, $password)",
      {
        $email: req.body.email,
        $password: password
      }, function (err) {
        if (err) {
          res.render('register',{err:"Fail!This email has been taken"}) 
        }
        res.send("success!")
      })
  })
})

router.get('/', function (req, res) {
  res.render('login')
})

router.post('/', function (req, res) {
  db.serialize(function () {
    db.get("SELECT password FROM User WHERE email = $email", { $email: req.body.email }, function (err, data) {
      if (err) throw err
      if (md5(md5(req.body.password) + salt) === data.password) {
        res.render('index', { title: 'Hello ' + req.body.email })
      } else {
        res.send(400)
      }
    })

  })
})

module.exports = router;
