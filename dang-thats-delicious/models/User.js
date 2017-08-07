const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
// Need to do the above as mongoose promises are broken WB says.

const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [ validator.isEmail, 'Invalid Email Address' ],
    required: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  }
});

userSchema.virtual('gravatar').get(function() {
  const hash = mnd5(this.email);
  return `https://gravatar.com/avatar/${hash}.s=200`;
});

// This tells something to use the email as the username
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
// mongodbErrorHandler converts rather unfriendly error messages into friendly error messages
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
// using module.exports instead of exports.something because
// it's the main thing that will be exported from the module
