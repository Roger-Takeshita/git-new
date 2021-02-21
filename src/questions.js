const inquirer = require('inquirer');
const path = require('path');

const { getSSHHosts } = require('./getInfo');
const { listGitignore, listOrganizations } = require('./github');

inquirer.registerPrompt('search-list', require('inquirer-search-list'));

const orgQuestion = async (repoAnswers, accObjArray) => {
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);
    const orgArray = await listOrganizations(profile);
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'org',
            message: 'In what organization do you want to create?',
            choices: orgArray,
            when: () => orgArray.length > 1,
        },
    ]);

    return answers;
};

const repoQuestions = async (accNameArray, accObjArray) => {
    const gitIgnoreArray = await listGitignore();
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'acc',
            message: 'What GitHub account do you want to use?',
            choices: accNameArray,
            when: () => accObjArray.length > 1,
        },
        {
            type: 'text',
            name: 'repositoryName',
            message: 'What is the name of the repository/project?',
            default: path.basename(process.cwd()),
        },
        {
            type: 'confirm',
            name: 'private',
            message: 'Is this a private repository?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'gitignoreConfirm',
            message: 'Do you want to add a .gitignore file?',
            default: true,
        },
        {
            type: 'search-list',
            name: 'gitignore',
            message: 'What type of .gitignore do you want to use?',
            choices: gitIgnoreArray,
            when: (prevAnswer) => prevAnswer.gitignoreConfirm,
        },
    ]);

    return answers;
};

const sshQuestion = async (accObjArray, repoAnswers) => {
    const hosts = getSSHHosts(accObjArray);
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'ssh',
            message: 'What SSH key do you want to use?',
            choices: hosts,
            when: () => accObjArray.length > 1 && hosts && accObjArray[0].acc !== repoAnswers.acc,
        },
    ]);

    return answers;
};

module.exports = {
    orgQuestion,
    repoQuestions,
    sshQuestion,
};
