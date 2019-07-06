const {Command} = require('@oclif/command')
const isInstalled = require('./util/installed')
const fs = require('fs-extra')

class Base extends Command {

	async init() {
		const installed = await isInstalled()
		if (!installed) {
			console.log("Please install Bunder")
			this.exit('ERROR: Not installed')
		}
		const bunConfig = await fs.readJson('/usr/bunder/conf/config.json')
		this.config = {...this.config, bun: bunConfig}
	}

}

module.exports = Base
