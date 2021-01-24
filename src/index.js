#! /usr/bin/env node

const inquirer = require('inquirer');
const { Octokit } = require('@octokit/core');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');
const execSync = require('child_process').execSync;

const gitconfig = path.join(os.homedir(), '.gitconfig');
const gitignoreGlobal = path.join(os.homedir(), '.gitignore_global');
const gitconfigExists = fs.existsSync(gitconfig);

const getGitHubAccounts = () => {
    if (!gitconfigExists) {
        console.log(`${gitconfig} not found. Please create one and try again`);
    } else {
        const gitconfigAccounts = execSync(
            'git config --get-regex user[0-9]*.acc',
            {
                encoding: 'utf-8',
            }
        );
        const re = /(user([0-9]?)*)/gim;
        const accArray = gitconfigAccounts.match(re);

        return accArray.map((profile) => {
            let acc = '';
            let token = '';

            try {
                acc = execSync(`git config ${profile}.acc`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
                token = execSync(`git config ${profile}.token`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
            } catch (error) {}

            return {
                acc,
                token,
                profile,
            };
        });
    }
};

const getSSHHosts = (accObjArray) => {
    if (accObjArray.length > 1) {
        const configPath = path.join(os.homedir(), '.ssh/config');
        const configFile = fs.readFileSync(configPath, 'utf8');
        const re = /Host (.*)/gim;
        return configFile.match(re).map((host) => host.replace('Host ', ''));
    }

    return null;
};

const repoQuestions = async (accountsName, accObjArray) => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'acc',
            message: 'What GitHub account do you want to use?',
            choices: accountsName,
            when: () => accObjArray.length > 1,
        },
        {
            type: 'text',
            name: 'repositoryName',
            message: 'What is the name of the repository/project?',
            default: path.basename(process.cwd()),
        },
        {
            type: 'list',
            name: 'private',
            message: 'Is this a Private repository?',
            choices: ['true', 'false'],
            default: 'true',
        },
    ]);
};

const sshQuestion = (accObjArray) => {
    const hosts = getSSHHosts(accObjArray);
    return inquirer.prompt([
        {
            type: 'list',
            name: 'ssh',
            message: 'What SSH key do you want to use?',
            choices: hosts,
            when: () => accObjArray.length > 1 && hosts,
        },
    ]);
};

const createCDFolder = (newFolderPath, newFolderName) => {
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
        process.chdir(newFolderPath);
    } else {
        console.log(
            chalk.red('Process aborted! ') +
                chalk.yellow(`A folder named ${newFolderName} already exists.`)
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
                `Looks like you don't have ${gitignoreGlobal}. The process will continue without creating one.`
            )
        );
    }
};

const createREADME = (repoAnswers) => {
    console.log(chalk.blue('——————› Creating README.md...'));
    const text = `<h1 id='contents'>Table of Contents</h1>\n\n- [${repoAnswers.repositoryName.toUpperCase()}](#${repoAnswers.repositoryName
        .trim()
        .replace(
            /\s+/g,
            '-'
        )})\n\n# ${repoAnswers.repositoryName.toUpperCase()}\n\n[Go Back to Contents](#contents)\n\n`;
    fs.writeFileSync('README.md', text);
};

const createRemoteRepo = async (repoAnswers, newFolderName, accObjArray) => {
    console.log(chalk.blue('——————› Creating GitHub repository...'));
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);
    const octokit = new Octokit({ auth: profile.token });

    try {
        return await octokit.request('POST /user/repos', {
            name: newFolderName,
            private: repoAnswers.private,
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

const createRepo = async () => {
    const accObjArray = getGitHubAccounts();
    const accountsName = accObjArray.map((profile) => profile.acc);
    const repoAnswers = await repoQuestions(accountsName, accObjArray);

    if (!repoAnswers.hasOwnProperty('acc')) {
        repoAnswers.acc = accObjArray[0].acc;
    }

    const newFolderName = repoAnswers.repositoryName
        .trim()
        .replace(/\s+/g, '_');
    const newFolderPath = path.join(process.cwd(), newFolderName);

    createCDFolder(newFolderPath, newFolderName);
    copyGitignore(gitignoreGlobal, newFolderPath);
    createREADME(repoAnswers);

    try {
        await createRemoteRepo(repoAnswers, newFolderName, accObjArray);
        await pushFirstCommit(repoAnswers, newFolderName, accObjArray);
        console.log(chalk.green('All Done!'));
    } catch (error) {
        console.log(chalk.red(error));
    }

    process.exit(0);
};

createRepo();
