const { Octokit } = require('@octokit/core');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

const listOrganizations = async (profile) => {
    try {
        const octokit = new Octokit({ auth: profile.token });
        const organizations = await octokit.request('GET /user/orgs');
        const orgNamesArray = organizations.data.map((org) => org.login);
        orgNamesArray.unshift('Personal');
        return orgNamesArray;
    } catch (error) {
        throw new Error(error);
    }
};

const createRemoteRepo = async (repoAnswers, newFolderName, accObjArray) => {
    console.log(chalk.blue('——————› Creating GitHub repository...'));
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);
    const octokit = new Octokit({ auth: profile.token });

    try {
        if (repoAnswers.org === 'Personal') {
            return await octokit.request('POST /user/repos', {
                name: newFolderName,
                private: repoAnswers.private === 'true' ? true : false,
            });
        } else {
            await octokit.request('POST /orgs/{org}/repos', {
                org: repoAnswers.org,
                name: newFolderName,
                private: repoAnswers.private === 'true' ? true : false,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
};

const pushFirstCommit = async (repoAnswers, newFolderName, sshAnswers) => {
    console.log(chalk.blue('——————› Pushing first commit...'));
    execSync('git init; git add .; git commit -m "First Commit"');
    execSync('git branch -M main');

    if (sshAnswers.hasOwnProperty('ssh')) {
        if (repoAnswers.org === 'Personal') {
            execSync(
                `git remote add origin git@${sshAnswers.ssh}:/${repoAnswers.acc}/${newFolderName}.git`,
            );
        } else {
            execSync(
                `git remote add origin git@${sshAnswers.ssh}:/${repoAnswers.org}/${newFolderName}.git`,
            );
        }
    } else {
        if (repoAnswers.org === 'Personal') {
            execSync(
                `git remote add origin https://github.com/${repoAnswers.acc}/${newFolderName}.git`,
            );
        } else {
            execSync(
                `git remote add origin https://github.com/${repoAnswers.org}/${newFolderName}.git`,
            );
        }
    }

    execSync('git push -u origin main');
};

module.exports = {
    createRemoteRepo,
    pushFirstCommit,
    listOrganizations,
};
