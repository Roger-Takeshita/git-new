const fs = require('fs');
const os = require('os');
const path = require('path');
const execSync = require('child_process').execSync;

const getGitHubAccounts = () => {
    const gitconfig = path.join(os.homedir(), '.gitconfig');
    const gitconfigExists = fs.existsSync(gitconfig);

    if (!gitconfigExists) {
        console.log(`${gitconfig} not found. Please create one and try again`);
    } else {
        const gitconfigAccounts = execSync('git config --get-regex user[0-9]*.acc', {
            encoding: 'utf-8',
        });
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

const getSSHHosts = (accObjArray) => {
    if (accObjArray.length > 1) {
        const configPath = path.join(os.homedir(), '.ssh/config');
        const configFile = fs.readFileSync(configPath, 'utf8');
        const re = /Host (.*)/gim;
        return configFile.match(re).map((host) => host.replace('Host ', ''));
    }

    return null;
};

module.exports = {
    getGitHubAccounts,
    getSSHHosts,
};
