#!/usr/bin/env node

const chalk = require('chalk');
const os = require('os');
const path = require('path');

const { repoQuestions, orgQuestion, sshQuestion } = require('./questions');
const { createFolder, createGitignoreLicense, createREADME } = require('./filesAndFolders');
const { getGitHubAccounts, createRemoteRepo, pushFirstCommit } = require('./github');
const { errorMsg } = require('./msg');

const createRepoMenu = async (repositoryName, privateFlag) => {
    try {
        const gitignoreGlobal = path.join(os.homedir(), '.gitignore');
        const accObjArray = getGitHubAccounts();
        const accNameArray = accObjArray.map((profile) => profile.acc);
        const repoAnswers = await repoQuestions(accNameArray, accObjArray, repositoryName);
        let url = '';

        if (repositoryName) {
            repoAnswers.repositoryName = repositoryName;
            repoAnswers.private = privateFlag;
        }

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

        createFolder(newFolderPath, newFolderName);
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
        if (repoAnswers.private) {
            console.log(chalk.gray('Private:      ') + chalk.green(`${repoAnswers.private}`));
        } else {
            console.log(chalk.gray('Private:      ') + chalk.red(`${repoAnswers.private}`));
        }
        console.log(chalk.gray('Url:          ') + chalk.blue(`${url}`));
        console.log();
        console.log(chalk.green.inverse('All Done!'));
        console.log();

        process.exit(0);
    } catch (error) {
        errorMsg('Question ERROR', error.message);
    }
};

const init = () => {
    if (process.argv.length > 2) {
        const args = process.argv;
        const newArgs = args.slice(2, args.length);
        const repoNameArray = [];
        let privateFlag = false;

        newArgs.forEach((arg) => {
            if (arg !== '--private' && arg !== '-p') {
                repoNameArray.push(arg);
            } else {
                privateFlag = true;
            }
        });

        const repositoryName = repoNameArray.join('_');

        createRepoMenu(repositoryName, privateFlag);
    } else {
        createRepoMenu();
    }
};

init();
