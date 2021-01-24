const { Octokit } = require('@octokit/core');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

const { sshQuestion } = require('../questions/questions');

const createRemoteRepo = async (repoAnswers, newFolderName, accObjArray) => {
    console.log(chalk.blue('——————› Creating GitHub repository...'));
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);
    const octokit = new Octokit({ auth: profile.token });

    try {
        return await octokit.request('POST /user/repos', {
            name: newFolderName,
            private: repoAnswers.private === 'true' ? true : false,
        });
    } catch (error) {
        throw new Error(error);
    }
};

const pushFirstCommit = async (repoAnswers, newFolderName, accObjArray) => {
    const sshAnswers = await sshQuestion(accObjArray);

    console.log(chalk.blue('——————› Pushing first commit...'));
    execSync('git init; git add .; git commit -m "First Commit"');
    execSync('git branch -M main');

    if (sshAnswers) {
        execSync(
            `git remote add origin git@${sshAnswers.ssh}:/${repoAnswers.acc}/${newFolderName}.git`
        );
    } else {
        execSync(
            `git remote add origin https://github.com/${repoAnswers.acc}/${newFolderName}.git`
        );
    }
    execSync('git push -u origin main');
};

module.exports = {
    createRemoteRepo,
    pushFirstCommit,
};
