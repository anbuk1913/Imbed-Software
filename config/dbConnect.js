const mongoose = require('mongoose')

module.exports = mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log('MongoDB Connected!'))
  .catch((error) => console.log(error))
