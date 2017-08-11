const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if user is authenticated
  if (req.isAuthenticated() ){
    next(); // carry on, they are logged in
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res, next) => {
   // 1. See if user exists
   const user = await User.findOne( { email: req.body.email });
   if (!user) {
     req.flash('error', 'If an account with that email exists, a reset email has been sent');
     return res.redirect('/login');
   }
   // 2. Set reset token and expiry on account
   user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
   user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
   await user.save();
   // 3. Send an email with the token
   const resetURL = `http://${req.headers.host}/account/reset/${ user.resetPasswordToken}`;
   req.flash('success', `You have been email a password link.  ${ resetURL }`)
   // 4. Redirect to the login page
   res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne( {
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user){
    req.flash('error', 'Passord reset token is invalid or has expired.');
    return res.redirect('/login');
  }
  // if there is a suer, show the reset password form
  res.render('reset', { title: 'Reset your password' } );
};

exports.confirmedPasswords = (req, res, next) => {
  // Having to use square brackets and value in quotes as it has a hyphen in it
  if (req.body.password === req.body['password-confirm']){
    next();
    return;
  } else {
    req.flash('error', 'The passwords do not match - please try again.');
    res.redirect('back');
  };
};

exports.update = async (req, res) => {
  const user = await User.findOne( {
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user){
    req.flash('error', 'Passord reset token is invalid or has expired.');
    return res.redirect('/login');
  }

  // We get setPassword from passportJS but, it's not promsified...uses a callback
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Steps above don't actually save the data...need this step to.
  const updatedUser = await user.save();
  // Next bit is pretty near, can automatically log the user in.
  await req.login(updatedUser);
  req.flash('success', "Your password has been reset and you've been logged in");
  res.redirect('/');
};
