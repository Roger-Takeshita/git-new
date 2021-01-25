const inquirer = require('inquirer');
const path = require('path');

const { getSSHHosts } = require('../info/info');
const { listOrganizations } = require('../github/github');

const orgQuestion = async (repoAnswers, accObjArray) => {
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);
    const orgArray = await listOrganizations(profile);

    return inquirer.prompt([
        {
            type: 'list',
            name: 'org',
            message: 'In what organization do you want to create?',
            choices: orgArray,
            when: () => orgArray.length > 1,
        },
    ]);
};

const repoQuestions = (accNameArray, accObjArray) => {
    return inquirer.prompt([
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
            type: 'list',
            name: 'private',
            message: 'Is this a Private repository?',
            choices: ['true', 'false'],
            default: 'true',
        },
    ]);
};

const sshQuestion = (accObjArray, repoAnswers) => {
    const hosts = getSSHHosts(accObjArray);

    return inquirer.prompt([
        {
            type: 'list',
            name: 'ssh',
            message: 'What SSH key do you want to use?',
            choices: hosts,
            when: () => accObjArray.length > 1 && hosts && accObjArray[0].acc !== repoAnswers.acc,
        },
    ]);
};

module.exports = {
    orgQuestion,
    repoQuestions,
    sshQuestion,
};
