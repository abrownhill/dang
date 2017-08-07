const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login'})
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' })
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply  name!').notEmpty();
  req.checkBody('email', 'That Email is not valid').notEmpty();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots:false,
    remove_extension: true,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', "Password confirmation cannot be blank!").notEmpty();
  req.checkBody('password-confirm', 'Oops, your passwords do not match - pleae try again.').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    // stop errors being handled elsewhere - handle it here
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next();
};

// We use 'next' in our parameters as it's a middleware - needs to pass on to something else
exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  // Capitalised User is the model
  // As User.register is a callback function we are using 'promisify' to wrap it.
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  console.log(req.body);
  next(); // pass to auth controller
};
