require("dotenv").config();

const app = require("./index");
const chalk = require("chalk");

// const DBConnection = require('./database/DBConnect.js');

// if (DBConnection) {
app.listen(process.env.PORT, () => {
  console.log(chalk.yellow("Server is listenning on port", process.env.PORT));
});
// }
