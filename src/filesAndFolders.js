const axios = require('axios');
const fs = require('fs');
const { getGithubData } = require('./github');
const { errorMsg, warningMsg } = require('./msg');

const createFolder = (newFolderPath, newFolderName) => {
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
        process.chdir(newFolderPath);
    } else {
        errorMsg('ERROR', `A folder named ${newFolderName} already exists.`);
    }
};

const createGitignoreLicense = async (gitignoreGlobal, repoAnswers, newFolderPath, accObjArray) => {
    try {
        if (repoAnswers.gitignoreConfirm) {
            if (repoAnswers.gitignore === 'gitignore') {
                if (fs.existsSync(gitignoreGlobal)) {
                    fs.copyFileSync(gitignoreGlobal, '.gitignore');
                } else {
                    warningMsg(
                        'WARNING',
                        `Looks like you don't have ${gitignoreGlobal}. The process will continue without creating a .gitignore file.`,
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
        errorMsg('GitHub ERROR', error.message);
    }
};

const createREADME = (repoAnswers) => {
    if (repoAnswers.readmeConfirm) {
        const text = `# ${repoAnswers.repositoryName.toUpperCase()}\n\n`;
        fs.writeFileSync('README.md', text);
    }
};

module.exports = {
    createFolder,
    createGitignoreLicense,
    createREADME,
};
