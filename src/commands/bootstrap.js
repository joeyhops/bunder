const {Command} = require('@oclif/command')
const fs = require('fs-extra')
const installed = require('../util/installed')
const {cli} = require('cli-ux')
const path = require('path')

class BootstrapCommand extends Command {
	async run() {
		const isRoot = process.getuid && process.getuid() === 0
		if (!isRoot) this.exit('You need to be root in order to bootstrap Bunder')
		const isInstalled = await installed()
		if (isInstalled) this.exit('Bunder already bootstrapped')

		console.log('Thank you for downloading Bunder')
		const confirm = cli.confirm('Beginning installation. Would you like to continue? (y/n)')
		if (confirm) installBun(this.config).then(() => console.log('Toasty Buns! Bunder has been successfully installed!'))
		else this.exit('Fare Thee Well')
	}
}

async function installBun (vars) {
	const protoConf = await fs.readJson(path.join(vars.config.root, 'src/config/config.base.json'))
	const bunDirs = Object.keys(protoConf).map(key => {
		if (typeof protoConf[key] === 'string') {
			return protoConf[key]
		}
	})
	for (var dir of bunDirs) {
		if (typeof dir !== 'undefined') {
			let exists = await fs.pathExists(dir)
			exists ? null : await createBunDir(dir)
		}
	}
	await installConf(protoConf['bun_confdir'], path.join(vars.config.root, 'src/config/config.base.json'))
}

async function installConf(confDir, proto) {
	try {
		await fs.copy(proto, `${confDir}/config.json`)
		console.log('Successfully Installed Bunder config.json')
	} catch(err) {
		console.error(err)
	}
}

async function createBunDir (dir) {
	try {
		fs.ensureDir(dir)
		console.log('successfully initialized ' + dir)
	} catch (err) {
		console.error(err)
	}
}

module.exports = BootstrapCommand
