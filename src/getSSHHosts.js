const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { errorMsg } = require('./msg');

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

            errorMsg(
                'ssh ERROR',
                chalk.yellow(' Looks like your ') +
                    chalk.blue(configPath) +
                    chalk.yellow(' is empty.'),
            );
        }
        errorMsg('ssh ERROR', chalk.blue(configPath) + chalk.yellow(' not found.'));
    }

    return null;
};

module.exports = {
    getSSHHosts,
};
