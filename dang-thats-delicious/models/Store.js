const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String ,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [ {
        type: Number,
        required: 'You must supply coordinates'
      } ],
    address: {
      type: String,
      required: 'You must supply an address'
    }
  },
  photo: String
});

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')){
    next(); // skip it
    return; //stop this function from running
  };
  // Improvement for the future will be to change this as it won't deal with
  // stores without unique names.
  this.slug = slug(this.name);
  // find other stores that have a slug of wes, wes-1, wes-2
  // the 'i' means it is case-insensitive
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  // Can't use the store here as it's not created yet so need to use the constructor
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  // now look if we found anything - if we did add a number to the end of it
  if (storesWithSlug.length) {
    this.slug = `${ this.slug }-${storesWithSlug.length + 1}`
  }
  next();
});

storeSchema.statics.getTagsList = function() {
  // So this needs to be a proper function and not an ES2015 function as needs to be bound to this.
  return this.aggregate([
     { $unwind: '$tags'},
     { $group: { _id: '$tags', count: { $sum: 1} } },
     { $sort: { count: -1} }
  ]);
  // So this pipes the data through various stages:
  // 1. Unwind duplicates when there is more than 1 tag per store, get each store with only 1 tag
  // 2. Group the stores by tag and count then (sum) adding 1 each time
  // 3. Order them in descending numerical order
}

module.exports = mongoose.model('Store', storeSchema);
