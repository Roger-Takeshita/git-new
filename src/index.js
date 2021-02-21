#!/usr/bin/env node

const chalk = require('chalk');
const os = require('os');
const path = require('path');

const { repoQuestions, orgQuestion, sshQuestion } = require('./questions');
const { getGitHubAccounts } = require('./getInfo');
const { createCDFolder, createGitignoreLicense, createREADME } = require('./filesAndFolders');
const { createRemoteRepo, pushFirstCommit } = require('./github');

const createRepo = async () => {
    const gitignoreGlobal = path.join(os.homedir(), '.gitignore_global');
    const accObjArray = getGitHubAccounts();
    const accNameArray = accObjArray.map((profile) => profile.acc);
    const repoAnswers = await repoQuestions(accNameArray, accObjArray);
    let url = '';

    if (!Object.prototype.hasOwnProperty.call(repoAnswers, 'acc')) {
        repoAnswers.acc = accObjArray[0].acc;
    }

    const orgAnswer = await orgQuestion(repoAnswers, accObjArray);

    if (!Object.prototype.hasOwnProperty.call(orgAnswer, 'org')) {
        repoAnswers.org = 'Personal';
    } else {
        repoAnswers.org = orgAnswer.org;
    }

    const newFolderName = repoAnswers.repositoryName.trim().replace(/\s+/g, '_');
    const newFolderPath = path.join(process.cwd(), newFolderName);

    createCDFolder(newFolderPath, newFolderName);
    await createGitignoreLicense(gitignoreGlobal, repoAnswers, newFolderPath, accObjArray);
    createREADME(repoAnswers);

    await createRemoteRepo(repoAnswers, newFolderName, accObjArray);
    const sshAnswers = await sshQuestion(accObjArray, repoAnswers);
    await pushFirstCommit(repoAnswers, newFolderName, sshAnswers);

    if (repoAnswers.org === 'Personal') {
        url = `https://github.com/${repoAnswers.acc}/${newFolderName}`;
    } else {
        url = `https://github.com/${repoAnswers.org}/${newFolderName}`;
    }

    console.log();
    console.log(chalk.gray('Account:      ') + chalk.green(`${repoAnswers.acc}`));
    console.log(chalk.gray('Organization: ') + chalk.green(`${repoAnswers.org}`));
    console.log(chalk.gray('Repo Name:    ') + chalk.green(`${newFolderName}`));
    console.log(chalk.gray('Private:      ') + chalk.green(`${repoAnswers.private}`));
    console.log(chalk.gray('Url:          ') + chalk.blue(`${url}`));
    console.log();
    console.log(chalk.green.inverse('All Done!'));
    console.log();

    process.exit(0);
};

createRepo();
