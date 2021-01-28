const chalk = require('chalk');
const fs = require('fs');

const createCDFolder = (newFolderPath, newFolderName) => {
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
        process.chdir(newFolderPath);
    } else {
        console.log(
            chalk.red('ERROR: ') + chalk.yellow(`A folder named ${newFolderName} already exists.`),
        );
        process.exit(1);
    }
};

const copyGitignore = (gitignoreGlobal, repoAnswers) => {
    if (repoAnswers.gitignore) {
        if (fs.existsSync(gitignoreGlobal)) {
            fs.copyFileSync(gitignoreGlobal, '.gitignore');
        } else {
            console.log(
                chalk.yellow(
                    `WARNING: Looks like you don't have ${gitignoreGlobal}. The process will continue without creating a .gitignore file.`,
                ),
            );
        }
    }
};

const createREADME = (repoAnswers) => {
    const text = `# ${repoAnswers.repositoryName.toUpperCase()}\n\n`;
    fs.writeFileSync('README.md', text);
};

module.exports = {
    createCDFolder,
    copyGitignore,
    createREADME,
};
