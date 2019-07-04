const {Command} = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const {uncompress, trimArchExt} = require('../util/compression-utils')
const BUNDIR = path.join(process.env.HOME, '.bundir')

class InCommand extends Command {
	async run() {
		const {bunfile} = this.parse(InCommand).args
		const prefix = path.join(process.env.HOME, '.test')
		const pkg = path.resolve(bunfile)
		this.log(`package location: ${pkg}`)
		this.log('Installing...')
		if (!fs.existsSync(prefix)) {
			fs.mkdir(prefix, {}, (err) => {
				if (err) throw err
				doInstall(pkg, prefix)
			})	
		} else {
			doInstall(pkg, prefix)
		}
	}
}

function doInstall (fullPkg, prefix) {
	uncompress(fullPkg, prefix)
	const nicePkgName = trimArchExt(path.basename(fullPkg))
	console.log(`${nicePkgName} installed to ${prefix}`)
	console.log('TODO: MOVE THIS SOMEWHERE ELSE. DEV STINK HERE')
	console.log('moving bunfile to bundir')
	var pkgStore = path.join(BUNDIR, 'pkgs')
	if (!fs.existsSync(BUNDIR)) {
		fs.mkdirSync(pkgStore, { recursive: true })
	}
	fs.copyFileSync(fullPkg, path.join(pkgStore, path.basename(fullPkg)))
	console.log('Installation is complete')
	console.log('TODO: DELETE FILE AFTERWARDS')
}

InCommand.description = `USAGE bunder in [pkgname]

'''
Installs a package
`

InCommand.args = [
	{
		name: 'bunfile',
		required: true,
		description: 'Bunder package to install [PACKAGE_NAME.bun.tgz]'
	}
] 

module.exports = InCommand
