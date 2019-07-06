const Base = require('../base')
const {flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const {spawn} = require('child_process')
const {uncompress, trimArchExt} = require('../util/compression-utils')
const {cli} = require('cli-ux')
const targz = require('targz')
// dev
const util = require('util')

class BunpkgCommand extends Base {
	async run () {
		const {flags, args} = this.parse(BunpkgCommand)
		const {file} = args
		const BUN_PATHS = {
			...this.config.bun,
			pkgPath: path.resolve(file),
			bunName: trimArchExt(file),
			tmpdir: path.resolve('./tmpbld')
		}
		console.dir(BUN_PATHS)
		BUN_PATHS.workdir = path.resolve(BUN_PATHS.tmpdir, 'bunwrk')
		BUN_PATHS.destdir = path.resolve(BUN_PATHS.workdir, '_destdir')
		this.runBunPkg(file, flags, BUN_PATHS)
	}

	runBunPkg(file, flags, BUN_PATHS) {
		if (file) {
			console.log(`Reading ${file} source archive`)
			uncompress(file, BUN_PATHS.tmpdir).then((cDir) => {
				if (cDir.type === 'directory') {
					console.log('Looking for CONFIGURE file so we know what to do with this package')
					let src = fs.readdirSync(BUN_PATHS.tmpdir)
						.filter(dir => {
							return dir + '/' === cDir.path
						})
					BUN_PATHS.src = src.length > 1 ? this.exit('This functionality is not yet present in Bunder\nplease try a different package') : path.resolve(BUN_PATHS.tmpdir, src[0])
					let hasConfig = fs.pathExistsSync(path.resolve(BUN_PATHS.src, 'configure'))
					if (!hasConfig) this.exit('Unsure of what to do next, exiting')
					const that = this
					this.runConfig(BUN_PATHS, flags, () => that.runMake(BUN_PATHS, flags, () => that.runInstall(BUN_PATHS, flags, () => that.pkgBun(BUN_PATHS, () => that.cleanAll(BUN_PATHS)))))
				}
			}).catch((err) => console.log(err))
		}	
	}

	runConfig(BUN_PATHS, flags, done) {
		console.log(`Configuring ${BUN_PATHS.bunName}`)
		fs.ensureDirSync(BUN_PATHS.workdir)
		let cConfig = flags.hasOwnProperty('configOps') ? [`--prefix=${BUN_PATHS.prefix}`, ...flags['configOps']] : [`--prefix=${BUN_PATHS.prefix}`]
		console.log('Running Configure')
		let cspwnOps = {
			shell: true,
			cwd: BUN_PATHS.workdir
		}
		cli.action.start('CONFIG')
		const config = spawn(path.resolve(BUN_PATHS.src, 'configure'), cConfig, cspwnOps)
		config.stdout.pipe(this.createLog(BUN_PATHS.tmpdir, 'config'))
		config.stderr.on('data', (data) => console.log(`CONFIG ERR: ${data}`))
		config.on('close', (code) => {
			cli.action.stop(`CONFIG finished with code ${code}`)
			done()
		})	
	}

	runMake(BUN_PATHS, flags, done) {
		console.log(`Preparing to make ${BUN_PATHS.bunName}`)
		let mConfig = flags.hasOwnProperty('makeOps') ? ['-k', ...flags['makeOps']] : ['-k']
		let mspawnOps = {cwd: BUN_PATHS.workdir}
		cli.action.start('MAKE')
		const compile = spawn('make', mConfig, mspawnOps)
		compile.stdout.pipe(this.createLog(BUN_PATHS.tmpdir, 'make'))
		compile.stderr.on('data', (data) => console.log(`MAKE ERR: ${data}`))
		compile.on('close', (code) => {
			cli.action.stop(`MAKE finished with exit code ${code}`)
			done()
		})
	}

	runInstall(BUN_PATHS, flags, done) {
		console.log(`Preparing to install ${BUN_PATHS.bunName} for packaging`)
		fs.ensureDirSync(BUN_PATHS.destdir)
		let iConfig = flags.hasOwnProperty('installOps') ? ['install', ...flags['installOps']] : ['install']
		let envVars = {...process.env, prefix: BUN_PATHS.prefix, PREFIX: BUN_PATHS.prefix, DESTDIR: BUN_PATHS.destdir}
		let ispawnOps = {cwd: BUN_PATHS.workdir, env: envVars}
		cli.action.start('INSTALL')
		const inst = spawn('make', iConfig, ispawnOps)
		inst.stdout.pipe(this.createLog(BUN_PATHS.tmpdir, 'install'))
		inst.stderr.on('data', (data) => console.log(`INSTALL ERROR: ${data}`))
		inst.on('close', (code) => {
			cli.action.stop(`MAKE INSTALL finished with exit code ${code}`)
			done()
		})
	}

	pkgBun(BUN_PATHS, done) {
		let bunpkgFile = `${BUN_PATHS.bunName}.bun.tar.gz`
		let bunsrc = path.join(BUN_PATHS.destdir, BUN_PATHS.prefix)
		console.log('Creating Bunfile')
		targz.compress({src: bunsrc, dest: path.join(process.cwd(), bunpkgFile)}, (err) => {
			if (err) console.log(err)
			else done()
		})
	}

	cleanAll(BUN_PATHS) {
		if (BUN_PATHS.bun_keep_dest) this.exit('Keeping dest dir; exiting')
		const del = spawn('rm', ['-rvf', `${BUN_PATHS.tmpdir}`])
		del.on('close', (code) => console.log(`RM exited with code ${code}`))
	}

	createLog(pathName, proc) {
		return fs.createWriteStream(path.resolve(pathName, `${proc}.bun.log`), {flags: 'a'})
	}
}

BunpkgCommand.args = [
	{
		name: 'file',
		required: true,
		description: "Source Tarball to create bunfile from"
	}
]

BunpkgCommand.flags = {
	makeOps: flags.string({
		char: 'm',
		description: 'Options for Make command',
		required: false,
		multiple: true
	}),	
	configOps: flags.string({
		char: 'c',
		description: 'Options for ./configure operation',
		required: false,
		multiple: true
	}),	
	installOps: flags.string({
		char: 'i',
		description: 'Options for Make Install command',
		required: false,
		multiple: true
	})	
}

module.exports = BunpkgCommand
