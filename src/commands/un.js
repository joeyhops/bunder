const {Command, flags} = require('@oclif/command')

class UnCommand extends Command {
	async run() {
		const {flags} = this.parse(UnCommand)
		this.log("Test Un")
	}
}

UnCommand.description = `Uninstall package`

module.exports = UnCommand
