const inquirer = require('inquirer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const execSync = require('child_process').execSync;
const gitconfig = `${os.homedir()}/.gitconfig`;
const gitconfigExists = fs.existsSync(gitconfig);

const buildConfig = async (accounts) => {
    const accountsName = accounts.map((profile) => profile.acc);
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'acc',
            message: 'what GitHub account do you want to use?',
            choices: accountsName,
        },
        {
            type: 'text',
            name: 'name',
            message: 'What is the name of the repository/project?',
            default: path.basename(process.cwd()),
        },
        {
            type: 'text',
            name: 'name',
            message: 'What is the name of the repository?',
        },
    ]);
    console.log(answers);
};

if (!gitconfigExists) {
    console.log(`Please double check if ${gitconfig} exists.`);
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
