const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const getGitHubAccounts = () => {
    const gitconfig = path.join(os.homedir(), '.gitconfig');
    const gitconfigExists = fs.existsSync(gitconfig);
    let accObjArray = [];

    if (!gitconfigExists) {
        console.log(
            chalk.red('.gitconfig ERROR: ') +
                chalk.blue(gitconfig) +
                chalk.yellow(' not found. Please create one in and try again.'),
        );
        process.exit(1);
    }

    try {
        const gitconfigAccounts = execSync('git config --get-regex user[0-9]*.acc', {
            encoding: 'utf-8',
        });
        const re = /(user([0-9]?)*)/gim;
        const accArray = gitconfigAccounts.match(re);

        accObjArray = accArray.map((profile) => {
            const user = {};

            try {
                user.acc = execSync(`git config ${profile}.acc`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
                user.name = execSync(`git config ${profile}.name`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
                user.token = execSync(`git config ${profile}.token`, {
                    encoding: 'utf-8',
                }).replace('\n', '');
            } catch (error) {
                // empty
            }

            return user;
        });
    } catch (error) {
        console.log(
            chalk.red('.gitconfig ERROR:') +
                chalk.yellow(' user.acc not found. Please add an account using the command') +
                chalk.blue('git config --global user.acc "your_github_account"') +
                chalk.yellow(' and try again.'),
        );
        process.exit(1);
    }

    return accObjArray;
};

const getSSHHosts = (accObjArray) => {
    if (accObjArray.length > 1) {
        const configPath = path.join(os.homedir(), '.ssh/config');

        if (fs.existsSync(configPath)) {
            const configFile = fs.readFileSync(configPath, 'utf8');

            if (configFile) {
                const re = /Host (.*)/gim;
                const hosts = configFile.match(re).map((host) => host.replace('Host ', ''));

                return hosts;
            }

            console.log(
                chalk.red('ssh ERROR: ') +
                    chalk.yellow(' Looks like your ') +
                    chalk.blue(configPath) +
                    chalk.yellow(' is empty.'),
            );
            process.exit(1);
        }
        console.log(
            chalk.red('ssh ERROR: ') + chalk.blue(configPath) + chalk.yellow(' not found.'),
        );
        process.exit(1);
    }

    return null;
};

module.exports = {
    getGitHubAccounts,
    getSSHHosts,
};
