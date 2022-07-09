const chalk = require('chalk');

const errorMsg = (type, msg) => {
    console.log();
    console.error(chalk.red(`  ${type}: `) + chalk.yellow(msg));
    console.log();
    process.exit(1);
};

const warningMsg = (type, msg) => {
    console.log();
    console.error(chalk.yellow(`  ${type}: `) + chalk.white(msg));
    console.log();
};

module.exports = { errorMsg, warningMsg };
