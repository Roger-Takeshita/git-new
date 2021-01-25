const chalk = require('chalk');
const fs = require('fs');

const createCDFolder = (newFolderPath, newFolderName) => {
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
        process.chdir(newFolderPath);
    } else {
        console.log(
            chalk.red('Process aborted! ') +
                chalk.yellow(`A folder named ${newFolderName} already exists.`),
        );
        process.exit(0);
    }
};

const copyGitignore = (gitignoreGlobal) => {
    console.log(chalk.blue('——————› Copying .gitignore_global...'));
    if (fs.existsSync(gitignoreGlobal)) {
        fs.copyFileSync(gitignoreGlobal, `.gitignore`);
    } else {
        console.log(
            chalk.yellow(
                `Looks like you don't have ${gitignoreGlobal}. The process will continue without creating one.`,
            ),
        );
    }
};

const createREADME = (repoAnswers) => {
    console.log(chalk.blue('——————› Creating README.md...'));
    const text = `<h1 id='contents'>Table of Contents</h1>\n\n- [${repoAnswers.repositoryName.toUpperCase()}](#${repoAnswers.repositoryName
        .trim()
        .replace(
            /\s+/g,
            '-',
        )})\n\n# ${repoAnswers.repositoryName.toUpperCase()}\n\n[Go Back to Contents](#contents)\n\n`;
    fs.writeFileSync('README.md', text);
};

module.exports = {
    createCDFolder,
    copyGitignore,
    createREADME,
};