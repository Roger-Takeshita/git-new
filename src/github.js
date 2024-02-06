const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Octokit } = require('@octokit/core');
const { execSync } = require('child_process');
const { errorMsg } = require('./msg');

const getGithubData = async (url) => {
    const octokit = new Octokit();

    try {
        return await octokit.request(url);
    } catch (error) {
        errorMsg('GitHub ERROR', error.message);
    }
};

const getGitHubAccounts = () => {
    const gitconfig = path.join(os.homedir(), '.gitconfig');
    const gitconfigExists = fs.existsSync(gitconfig);
    let accObjArray = [];

    if (!gitconfigExists) {
        errorMsg(
            '.gitconfig ERROR',
            chalk.blue(gitconfig) + chalk.yellow(' not found. Please create one in and try again.'),
        );
    }

    try {
        const gitconfigAccounts = execSync('git config --get-regex user[0-9]*.acc', {
            encoding: 'utf-8',
        });
        const re = /(user\d*)/gim;
        const accArray = gitconfigAccounts.match(re);

        accObjArray = accArray.map((profile) => {
            const user = {};

            try {
                user.acc = execSync(`git config ${profile}.acc`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
                user.name = execSync(`git config ${profile}.name`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
                user.token = execSync(`git config ${profile}.token`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
            } catch (error) {
                // don't do anything
            }

            return user;
        });
    } catch (error) {
        errorMsg(
            '.gitconfig ERROR',
            chalk.yellow(' user.acc not found. Please add an account using the command') +
                chalk.blue('git config --global user.acc "your_github_account"') +
                chalk.yellow(' and try again.'),
        );
    }

    return accObjArray;
};

const getOrganizations = async (profile) => {
    try {
        if (profile.token === '') {
            errorMsg(
                '.gitconfig ERROR',
                chalk.yellow(' user.token not found. Please add a token using the command ') +
                    chalk.blue('git config --global user.token "your_github_personal_token"') +
                    chalk.yellow(' and try again.'),
            );
        }

        const octokit = new Octokit({ auth: profile.token });
        const organizations = await octokit.request('GET /user/orgs');
        const orgNamesArray = organizations.data.map((org) => org.login);
        orgNamesArray.unshift('Personal');

        return orgNamesArray;
    } catch (error) {
        errorMsg('GitHub ERROR', error.message);
    }
};

const createRemoteRepo = async (repoAnswers, newFolderName, accObjArray) => {
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);

    if (profile.token === '') {
        errorMsg(
            '.gitconfig ERROR',
            chalk.yellow(' user.token not found. Please add a token using the command ') +
                chalk.blue('git config --global user.token "your_github_personal_token"') +
                chalk.yellow(' and try again.'),
        );
    }

    try {
        const octokit = new Octokit({ auth: profile.token });
        if (repoAnswers.org === 'Personal') {
            return await octokit.request('POST /user/repos', {
                name: newFolderName,
                private: repoAnswers.private,
            });
        }
        return await octokit.request('POST /orgs/{org}/repos', {
            org: repoAnswers.org,
            name: newFolderName,
            private: repoAnswers.private,
        });
    } catch (error) {
        errorMsg('GitHub ERROR', error.errors[0].message);
    }
};

const pushFirstCommit = async (repoAnswers, newFolderName, sshAnswers) => {
    const files = [];
    let filesStr = '';
    let pushCommit = false;

    if (repoAnswers.gitignoreConfirm || repoAnswers.readmeConfirm || repoAnswers.licenseConfirm) {
        if (repoAnswers.gitignoreConfirm) files.push('.gitignore');
        if (repoAnswers.licenseConfirm) files.push('LICENSE');
        if (repoAnswers.readmeConfirm) files.push('README');
        if (files.length > 2) {
            const lastFile = files.pop();
            filesStr = files.join(', ');
            filesStr += `, and ${lastFile}`;
        } else if (files.length === 2) {
            filesStr = files.join(' and ');
        } else {
            [filesStr] = files;
        }

        pushCommit = true;
    }

    if (pushCommit) {
        execSync(`git init && git add . && git commit -m "docs: Should add ${filesStr}"`);
        execSync('git branch -M main');
    }

    if (Object.prototype.hasOwnProperty.call(sshAnswers, 'ssh')) {
        if (repoAnswers.org === 'Personal') {
            execSync(
                `git remote add origin git@${sshAnswers.ssh}:${repoAnswers.acc}/${newFolderName}.git`,
            );
        } else {
            execSync(
                `git remote add origin git@${sshAnswers.ssh}:${repoAnswers.org}/${newFolderName}.git`,
            );
        }
    } else if (repoAnswers.org === 'Personal') {
        execSync(
            `git remote add origin https://github.com/${repoAnswers.acc}/${newFolderName}.git`,
        );
    } else {
        execSync(
            `git remote add origin https://github.com/${repoAnswers.org}/${newFolderName}.git`,
        );
    }

    if (pushCommit) {
        console.log();
        execSync('git push -u origin main');
    }
};

module.exports = {
    getGithubData,
    getGitHubAccounts,
    getOrganizations,
    createRemoteRepo,
    pushFirstCommit,
};
