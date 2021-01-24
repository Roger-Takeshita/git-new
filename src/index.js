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

const createFolder = (newFolderPath) => {
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
    } else {
        console.log('Folder already exists');
        process.exit(0);
    }
};

const copyGitignore = (gitignoreGlobal, newFolderPath) => {
    console.log('——————›Copying .gitignore_global into the repo...');
    if (fs.existsSync(gitignoreGlobal)) {
        fs.copyFileSync(gitignoreGlobal, `${newFolderPath}/.gitignore`);
        console.log('   Done!');
    } else {
        console.log(
            `Looks like you don't have ${gitignoreGlobal}. The process will continue without creating one.`
        );
    }
};

const createREADME = (answers) => {
    const text = `<h1 id='contents'>Table of Contents</h1>\n\n- [${answers.repositoryName.toUpperCase()}](#${answers.repositoryName
        .trim()
        .replace(
            /\s+/g,
            '-'
        )})\n\n# ${answers.repositoryName.toUpperCase()}\n\n[Go Back to Contents](#contents)\n\n`;
    fs.writeFileSync('README.md', text);
};

const createRepository = async (answers, newFolderName, accounts) => {
    execSync('git init; git add .; git commit -m "First Commit"');
    execSync('git branch -M main');
    execSync(
        `git remote add origin https://github.com/${answers.acc}/${newFolderName}.git`
    );

    const profile = accounts.find((prof) => prof.acc === answers.acc);
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

const buildConfig = async (accounts) => {
    const accountsName = accounts.map((profile) => profile.acc);
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'acc',
            message: 'What GitHub account do you want to use?',
            choices: accountsName,
            when: () => accounts.length > 1,
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

    if (!answers.hasOwnProperty('acc')) {
        answers.acc = accounts[0].acc;
    }

    const newFolderName = answers.repositoryName.trim().replace(/\s+/g, '_');
    const newFolderPath = path.join(process.cwd(), newFolderName);
    createFolder(newFolderPath);
    process.chdir(newFolderPath);
    copyGitignore(gitignoreGlobal, newFolderPath);
    createREADME(answers);

    try {
        await createRepository(answers, newFolderName, accounts);
        execSync('git push -u origin main');
        console.log('All Done!');
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
};

if (!gitconfigExists) {
    console.log(`${gitconfig} not found. Please create one and try again`);
} else {
    const config = execSync('git config --get-regex user[0-9]*.acc', {
        encoding: 'utf-8',
    });
    const re = /(user([0-9]?)*)/gim;
    const accountsArray = config.match(re);
    const accountsObj = accountsArray.map((profile) => {
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
    buildConfig(accountsObj);
}
