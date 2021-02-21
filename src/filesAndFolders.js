const chalk = require('chalk');
const fs = require('fs');
const axios = require('axios');

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

const copyGitignore = async (gitignoreGlobal, repoAnswers, newFolderPath) => {
    try {
        if (repoAnswers.gitignoreConfirm) {
            if (repoAnswers.gitignore === 'gitignore_global') {
                if (fs.existsSync(gitignoreGlobal)) {
                    fs.copyFileSync(gitignoreGlobal, '.gitignore');
                } else {
                    console.log(
                        chalk.yellow(
                            `WARNING: Looks like you don't have ${gitignoreGlobal}. The process will continue without creating a .gitignore file.`,
                        ),
                    );
                }
            } else {
                const response = await axios({
                    method: 'GET',
                    url: `https://raw.githubusercontent.com/github/gitignore/master/${repoAnswers.gitignore}.gitignore`,
                });

                fs.writeFileSync(`${newFolderPath}/.gitignore`, response.data);
            }
        }
    } catch (error) {
        console.log(error);
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
