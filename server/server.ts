require("dotenv").config();

const app = require("./index");
const chalk = require("chalk");

const {client} = require("./database/connection");

async function startServer() {
  try {
    await client`SELECT 1`;
    console.log(chalk.green("✓ Database connected successfully"));

    app.listen(process.env.PORT, () => {
      console.log(
        chalk.yellow("Server is listening on port", process.env.PORT),
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red("✗ Failed to connect to database:"), message);
    process.exit(1);
  }
}

startServer();
