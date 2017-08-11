const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add',
  authController.isLoggedIn,
  storeController.addStore
);

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
// next deals with a single tag but the ':tag' could be replaced by ':tag*?' and all done on a single line
// This wasn't shown to work in the videos so test it.  Uses an optional regexp.
router.get('/tags/:tag', catchErrors(storeController.getStoreByTag));

router.get('/login', catchErrors(userController.loginForm));

router.post('/login', authController.login);


router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. Register the user
// 3, We need to log them in
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);

router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));

router.get('/account/reset/:token', catchErrors(authController.reset));

router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

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
