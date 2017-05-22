// exports.myMiddleware = (req, res, next) => {
//   req.name = req.query.username || 'wesbos';
//   if (req.name === 'error') {
//     throw Error('I have triggered an error for you');
//   };
//   next();
// };

exports.homePage = (req, res) => {
console.log(req.name);
  res.render('index');
};
