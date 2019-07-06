const Base = require('../base')
const fs = require('fs')
const path = require('path')
const {uncompress, trimArchExt} = require('../util/compression-utils')

class InCommand extends Base {
	async run() {
		const {bunfile} = this.parse(InCommand).args
		const {prefix} = this.config.bun
		const pkg = path.resolve(bunfile)
		this.log(`package location: ${pkg}`)
		this.log('Installing...')
		if (!fs.existsSync(prefix)) {
			fs.mkdir(prefix, {}, (err) => {
				if (err) throw err
				doInstall(pkg, prefix)
			})	
		} else {
			doInstall(pkg, prefix, this.config.bun.packages)
		}
	}
}

function doInstall (fullPkg, prefix, pkgdir) {
	uncompress(fullPkg, prefix)
	const nicePkgName = trimArchExt(path.basename(fullPkg))
	console.log(`${nicePkgName} installed to ${prefix}`)
	fs.copyFileSync(fullPkg, path.join(pkgdir, path.basename(fullPkg)))
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
