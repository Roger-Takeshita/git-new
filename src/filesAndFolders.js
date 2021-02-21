const chalk = require('chalk');
const fs = require('fs');
const axios = require('axios');
const { getGithubData } = require('./github');

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

const createGitignoreLicense = async (gitignoreGlobal, repoAnswers, newFolderPath, accObjArray) => {
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
                const response1 = await axios({
                    method: 'GET',
                    url: `https://raw.githubusercontent.com/github/gitignore/master/${repoAnswers.gitignore}.gitignore`,
                });

                fs.writeFileSync(`${newFolderPath}/.gitignore`, response1.data);
            }
        }
        if (repoAnswers.licenseConfirm) {
            const response2 = await getGithubData(`GET /licenses/${repoAnswers.license}`);
            const user = accObjArray.find((u) => u.acc === repoAnswers.acc);
            const date = new Date();
            const license = response2.data.body
                .replace(/\[year\]/gm, date.getFullYear())
                .replace(/\[fullname\]/gm, user.name);
            fs.writeFileSync(`${newFolderPath}/LICENSE`, license);
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
    createGitignoreLicense,
    createREADME,
};
