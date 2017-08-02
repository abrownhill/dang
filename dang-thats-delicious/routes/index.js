const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// This is using object destructuring
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
// router.get('/', storeController.myMiddleware, storeController.homePage);
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);

router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore));

router.get('/stores/:id/edit', catchErrors(storeController.editStore))

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoreByTag));
// next daals with a single tag but the ':tag' could be replaced by ':tag*?' and all done on a single line
// This wasn't shown to work in the videos so test it.  Uses an optional regexp.
router.get('/tags/:tag', catchErrors(storeController.getStoreByTag));

/////////////////////////////////////////////////////
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
