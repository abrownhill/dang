// exports.myMiddleware = (req,
// res, next) => {
// exports.myMiddleware = (req, res, next) => {
//   req.name = req.query.username || 'wesbos';
//   if (req.name === 'error') {
//     throw Error('I have triggered an error for you');
//   };
//   next();
// };
const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({
        message: 'That filetype isn\'t allowed!'
      }, false);
    }
  }
};

exports.homePage = (req, res) => {
  // console.log(req.name);
  // req.flash('error', `Error: Something went wrong!`);
  // req.flash('info', `Info: Something went wrong!`);
  // req.flash('warning', `Warning: Something went wrong!`);
  // req.flash('success', `Success: Something went wrong!`);
  // req.flash('brian', `brian: Something went wrong!`);
  // res.render('index');
};

exports.addStore = (req, res) => {
  // Next line removed but showed how can pass data to the editStore page
  // res.render('editStore', {title: 'Add Store'});
  res.render('editStore');
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async(req, res, next) => {
  //  check if there is no new file to resize
  if (!req.file){
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`; // this creates a new filename with the extension.
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we've written the photo to our filesystem, keep going!
  next();
};

exports.createStore = async(req, res) => {
  // Handy Tip: Can Console Log the request.body
  // console.log(req.body);

  // Create the new store
  // const store = new Store(req.body); // the original line
  const store = await (new Store(req.body)).save();
  // connect to DB and store it
  // await store.save(); // This line removed when the store creation was merged into one line (above)
  req.flash('success', `Sucessfully created ${store.name}. Care to leave a review?`);
  // Added the slug but, it won't exist yet so, have to go and change the line where we define store (above)
  res.redirect(`/store/${store.slug}`);
  //  console.log("It worked");
};

exports.getStores = async(req, res) => {
  // 1. Query the database for a list of all stores
  // To do this need to make it aync
  const stores = await Store.find();
  // console.log(stores);
  res.render('stores', {
    title: 'Stores',
    stores
  }); // This used the ES6 principle of omitting the variable name when it's the same as the value name.
};

exports.editStore = async(req, res) => {
  // 1 find the store given the ID
  const store = await Store.findOne({
    _id: req.params._id
  });
  // Wondered if the above line should be _id instead of id but works do guess not.
  // res.json(store);
  // if the above line is skipped and nothing rendered or returned it will look like the service has hung.

  // 2. Confirm they are the owner of the store - this is on hold as need log-in functionality for this
  // TODO

  // 3. Render the edit for so the user can update their store.
  res.render('editStore', {
    title: `Edit ${store.name}`,
    store
  });
};

exports.updateStore = async(req, res) => {
  // Set the location data to be a Point
  req.body.location.type = 'Point';
  //  Find and udpate the store
  const store = await Store.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true, // return the new store instead of the old one - this is because by default mongo returns the original 'thing' we find
    runValidators: true // this forces the validators to be run e.g. to prevent creating a new object with a name then deleting that name after creation
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>.  <a href="/store/${store.slug}">View Store</a>`);
  res.redirect(`/store/${store._id}/edit`);
  // note that findOneAndUpdate is a mongodb method

  //  Redirect them to the store and tell them it worked

};

exports.getStoreBySlug = async (req, res, next) => {
  // req.json(req.params);
  const store = await Store.findOne({ slug: req.params.slug })
  if (!store) return next();
    // What the next does here is look at the router in app.js, it doesn't find What
    // it needs to moves onto the next middleware - in our case 'errorHandlers.notFound'
  res.render('store', { store, title: store.name })
}

exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  // Next just gets the ones where the tag exists in the tags array - just does it
  const storesPromise = Store.find({ tags: tagQuery });
  // WB points out could add another await here but, they'd be run in sequence whereas we want parallel

  // Next bit makes use of ES6 features...could do the below to get and split but, can actually do the uncommented line
  // const result = await Promise.all([tagsPromise, storesPromise]);
  // var tags = result[0];
  // var stores = result[1];
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', {tags, title: 'Tags', tag, stores });

  // This all works pretty nicely but good improvements would be:
  //   1. Remove all tag filters
  //   2. Allow multiple selection e.g. 'open late' && 'wifi'
}
