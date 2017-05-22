const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Do work here
router.get('/', storeController.myMiddleware, storeController.homePage);

router.get('/adb', (req, res) => {
  // res.send('Hey! It works!');
  // res.send(req.query.name);
  // res.render('hello');
  res.render('hello', {
    test: 'some text',
    username: req.query.username
    });
});

router.get('/adb/reverse/:name/:flex', (req, res) => {
  // ADB this will return to the client the name value entered e.g. "url.com/bob" would print bob to the screen

  // ADB so seems we can add additional paths to the url but they will be ignored if not present
  //  e.g. "url.com/bob/margo"
  // res.json(req.params.flex);
  const reverse = [...req.params.name].reverse().join("");
  res.send(reverse);
});

module.exports = router;
