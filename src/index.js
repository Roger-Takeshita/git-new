#! /usr/bin/env node

const chalk = require('chalk');
const os = require('os');
const path = require('path');

const { repoQuestions } = require('./questions/questions');
const { getGitHubAccounts } = require('./info/info');
const {
    createCDFolder,
    copyGitignore,
    createREADME,
} = require('./files/files');
const { createRemoteRepo, pushFirstCommit } = require('./github/github');

const createRepo = async () => {
    const gitignoreGlobal = path.join(os.homedir(), '.gitignore_global');
    const accObjArray = getGitHubAccounts();
    const accNameArray = accObjArray.map((profile) => profile.acc);
    const repoAnswers = await repoQuestions(accNameArray, accObjArray);

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
