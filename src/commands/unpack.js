const {Command} = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const {uncompress} = require('../util/compression-utils')

class UnpackCommand extends Command {
	async run() {
		const {file, outdir} = this.parse(UnpackCommand).args
		if (file) {
			outdir
				? uncompress(file, outdir)
				: uncompress(file)
		}
	}
}

UnpackCommand.description = `Unpack package`

UnpackCommand.args = [
	{
		name: 'file',
		required: true,
		description: 'File to unpack'
	},
	{
		name: 'outdir',
		required: false,
		description: 'Optional Output Location'
	}
]

UnpackCommand.usage = 'bunder unpack [PACKAGE]'

module.exports=UnpackCommand
