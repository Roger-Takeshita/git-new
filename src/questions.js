const inquirer = require('inquirer');
const path = require('path');

const { getSSHHosts } = require('./getInfo');
const { getGithubData, getOrganizations } = require('./github');

inquirer.registerPrompt('search-list', require('inquirer-search-list'));

const orgQuestion = async (repoAnswers, accObjArray) => {
    const profile = accObjArray.find((prof) => prof.acc === repoAnswers.acc);
    const orgArray = await getOrganizations(profile);
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
    const gitIgnoreArray = await getGithubData('GET /gitignore/templates');
    const licenseArray = await getGithubData('GET /licenses');
    const onlyGitIgnoreArray = gitIgnoreArray.data;
    onlyGitIgnoreArray.unshift('gitignore_global');
    const onlyLicenseArray = licenseArray.data.map((item) => item.spdx_id);

    const answers = await inquirer.prompt([
        {
            type: 'text',
            name: 'repositoryName',
            message: 'What is the name of the repository/project?',
            default: path.basename(process.cwd()),
        },
        {
            type: 'list',
            name: 'acc',
            message: 'Which GitHub account do you want to use?',
            choices: accNameArray,
            when: () => accObjArray.length > 1,
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
            choices: onlyGitIgnoreArray,
            when: (prevAnswer) => prevAnswer.gitignoreConfirm,
        },
        {
            type: 'confirm',
            name: 'licenseConfirm',
            message: 'Do you want to add a LICENSE file?',
            default: true,
        },
        {
            type: 'search-list',
            name: 'license',
            message: 'What type of LICENSE do you want to use?',
            choices: onlyLicenseArray,
            when: (prevAnswer) => prevAnswer.licenseConfirm,
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
