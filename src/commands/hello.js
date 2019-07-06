const {flags} = require('@oclif/command')
const Base = require('../base')

class HelloCommand extends Base {
	async run() {
		console.dir(this.config)
    const {flags} = this.parse(HelloCommand)
    const name = flags.name || 'world'
    this.log(`hello ${name} from ./src/commands/hello.js`)
  }
}

HelloCommand.description = `Describe the command here
...
Extra documentation goes here
`

HelloCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = HelloCommand
