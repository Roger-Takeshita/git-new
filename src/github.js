const { Octokit } = require('@octokit/core');
const chalk = require('chalk');
const { execSync } = require('child_process');

// eslint-disable-next-line consistent-return
const listGitignore = async () => {
    try {
        const octokit = new Octokit();
        const response = await octokit.request('GET /gitignore/templates');
        const gitIgnoreArray = response.data;
        gitIgnoreArray.unshift('gitignore_global');

        return gitIgnoreArray;
    } catch (error) {
        console.log(chalk.red('GitHub ERROR:') + chalk.yellow(` ${error.errors[0].message}`));
        process.exit(1);
    }
};

const listOrganizations = async (profile) => {
    try {
        if (profile.token === '') {
            console.log(
                chalk.red('.gitconfig ERROR:') +
                    chalk.yellow(' user.token not found. Please add a token using the command ') +
                    chalk.blue('git config --global user.token "your_github_personal_token"') +
                    chalk.yellow(' and try again.'),
            );
            process.exit(1);
        }

        const octokit = new Octokit({ auth: profile.token });
        const organizations = await octokit.request('GET /user/orgs');
        const orgNamesArray = organizations.data.map((org) => org.login);
        orgNamesArray.unshift('Personal');

        return orgNamesArray;
    } catch (error) {
        throw new Error(error);
    }
};

// eslint-disable-next-line consistent-return
const createRemoteRepo = async (repoAnswers, newFolderName, accObjArray) => {
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);

    if (profile.token === '') {
        console.log(
            chalk.red('.gitconfig ERROR:') +
                chalk.yellow(' user.token not found. Please add a token using the command ') +
                chalk.blue('git config --global user.token "your_github_personal_token"') +
                chalk.yellow(' and try again.'),
        );
        process.exit(1);
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
        console.log(chalk.red('GitHub ERROR:') + chalk.yellow(` ${error.errors[0].message}`));
        process.exit(1);
    }
};

const pushFirstCommit = async (repoAnswers, newFolderName, sshAnswers) => {
    execSync('git init && git add . && git commit -m "First Commit"');
    execSync('git branch -M main');

    if (Object.prototype.hasOwnProperty.call(sshAnswers, 'ssh')) {
        if (repoAnswers.org === 'Personal') {
            execSync(
                `git remote add origin git@${sshAnswers.ssh}:/${repoAnswers.acc}/${newFolderName}.git`,
            );
        } else {
            execSync(
                `git remote add origin git@${sshAnswers.ssh}:/${repoAnswers.org}/${newFolderName}.git`,
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

    console.log();
    execSync('git push -u origin main');
};

module.exports = {
    listGitignore,
    createRemoteRepo,
    pushFirstCommit,
    listOrganizations,
};
