const fs = require('fs-extra')
const path = require('path')
const {cli} = require('cli-ux')

module.exports = async function (options) {
	const first = await checkInstalled(options)
	if (first) {
		return
	}
	console.log('Bundir is not currently installed on the system')
	console.log('Preparing to install; You must be root (or sudo) to install')
	const confirm = await cli.confirm('Do you wish to continue? y/n')
	if (confirm) installBun(options)
	else this.exit(1)
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

async function checkInstalled (vars) {
	const confExists = await fs.pathExists('/usr/bunder/conf/config.json')
	if (confExists) {
		return true
	} else {
		return false
	}
}
