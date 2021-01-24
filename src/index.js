#! /usr/bin/env node

const inquirer = require('inquirer');
const { Octokit } = require('@octokit/core');
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

const askQuestions = async (accountsName, accObjArray) => {
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
            message: 'Is the repository Private?',
            choices: ['true', 'false'],
            default: 'true',
        },
    ]);
};

const createCDFolder = (newFolderPath) => {
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
        process.chdir(newFolderPath);
    } else {
        console.log('Folder already exists, process aborted!');
        process.exit(0);
    }
};

const copyGitignore = (gitignoreGlobal) => {
    console.log('——————› Copying .gitignore_global...');
    if (fs.existsSync(gitignoreGlobal)) {
        fs.copyFileSync(gitignoreGlobal, `.gitignore`);
        console.log('   Done!');
    } else {
        console.log(
            `Looks like you don't have ${gitignoreGlobal}. The process will continue without creating one.`
        );
    }
};

const createREADME = (answers) => {
    console.log('——————› Creating README.md...');
    const text = `<h1 id='contents'>Table of Contents</h1>\n\n- [${answers.repositoryName.toUpperCase()}](#${answers.repositoryName
        .trim()
        .replace(
            /\s+/g,
            '-'
        )})\n\n# ${answers.repositoryName.toUpperCase()}\n\n[Go Back to Contents](#contents)\n\n`;
    fs.writeFileSync('README.md', text);
};

const createRemoteRepo = async (answers, newFolderName, accObjArray) => {
    console.log('——————› Creating GitHub repository...');
    const profile = accObjArray.find((prof) => prof.acc === answers.acc);
    const octokit = new Octokit({ auth: profile.token });

    try {
        return await octokit.request('POST /user/repos', {
            name: newFolderName,
            private: answers.private,
        });
    } catch (error) {
        throw new Error(error);
    }
};

const pushFirstCommit = (answers, newFolderName) => {
    console.log('——————› Pushing first commit...');
    execSync('git init; git add .; git commit -m "First Commit"');
    execSync('git branch -M main');
    execSync(
        `git remote add origin https://github.com/${answers.acc}/${newFolderName}.git`
    );
    execSync('git push -u origin main');
};

const createRepo = async () => {
    const accObjArray = getGitHubAccounts();
    const accountsName = accObjArray.map((profile) => profile.acc);
    const answers = await askQuestions(accountsName, accObjArray);

    if (!answers.hasOwnProperty('acc')) {
        answers.acc = accObjArray[0].acc;
    }

    const newFolderName = answers.repositoryName.trim().replace(/\s+/g, '_');
    const newFolderPath = path.join(process.cwd(), newFolderName);

    createCDFolder(newFolderPath);
    copyGitignore(gitignoreGlobal, newFolderPath);
    createREADME(answers);

    try {
        await createRemoteRepo(answers, newFolderName, accObjArray);
        pushFirstCommit(answers, newFolderName);
        console.log('All Done!');
    } catch (error) {
        console.log(error);
    }

    process.exit(0);
};

createRepo();
