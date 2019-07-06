const Base = require('../base')
const {flags} = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process')
const {uncompress, trimArchExt, createArch} = require('../util/compression-utils')
// dev
const util = require('util')

class MkpkgCommand extends Base {
	async run() {
		const {flags, args} = this.parse(MkpkgCommand)
		const {file} = args
		const buildDir = flags.dir
		const pkgName = (flags.hasOwnProperty('name') && flags.name) 
			? flags.name
			: trimArchExt(file)
		const {prefix} = this.config.bun
		console.log(util.inspect(process.env))
		if (file) {
			this.log('Begin Packaging for ' + file)
			this.log('Unpacking...')
			await uncompress(file, 'pkg_tmp')
			const src = fs.readdirSync('pkg_tmp')[0]
			console.log(src)
			fs.access(`pkg_tmp/${src}/configure`, fs.constants.F_OK, async (err) => {
				if (err) {
					console.error(err)
				} else {
					await configBunPkg(prefix, src, flags, buildDir, (bd, srcDir) => {
						fs.access(`${bd}/Makefile`, fs.constants.F_OK, async (err) => {
							if (err) {
								console.log(err)
							} else {
								console.log('Build was configured successfully!')
								console.log('Preparing to make!')
								compileBunPkg(flags, buildDir, bd, srcDir, () => {
									console.log('Package Successfully compiled!')
									console.log(`Installing to package ${pkgName}.bun.tgz now`)
									mkpkg(prefix, pkgName, flags, bd, srcDir, (cur) => {
										process.chdir(cur)
										cleanup(this.config.bun, `${pkgName}.bun.tgz`, bd, srcDir)
									})
								})
							}
						})
					})
				}
			})
		}
	}
}

async function configBunPkg (prefix, src, flags, buildDir, cb) {
	console.log('Found config file')
	console.log('Creating build directory: ' + buildDir)
	fs.mkdir(`pkg_tmp/${buildDir}`, {}, (err) => {
		console.log(err)
	})
	console.log('Successfully created ' + buildDir)
	var bd = path.resolve(`pkg_tmp/${buildDir}`)
	const srcDir = path.join(path.resolve('pkg_tmp'), src)
	const configArgs = [`--prefix=${prefix}`]
	console.log('Checking for config options')
	if (flags.hasOwnProperty('configOptions') && flags.configOptions.length > 0){
		configArgs.concat(flags['configOptions'])
	}
	console.log('Running config script now!')
	const configure = spawn(`${srcDir}/configure`, configArgs, {
		shell: true,
		cwd: bd,
		uid: process.getuid(),
		gid: process.getuid()
	})
	configure.stdout.on('data', (data) => {
		console.log('BUN: CONFIGURE: ' + data)
	})
	configure.stderr.on('data', (data) => {
		console.log('BUN: CONFIGURE: ERR: ' + data)
	})
	configure.on('close', (code) => {
		console.log('BUN: CONFIGURE finished with code ' + code)
		if (code == 0) cb(bd, srcDir)
	})
}

function compileBunPkg (flags, buildDir, bd, srcDir, cb) {
	const makeArgs = ['-k']
	if (flags.hasOwnProperty('makeOptions') && flags.makeOptions.length > 0) {
		makeArgs.concat(flags.makeOptions)
	}
	console.log('MAKING...')
	const makeProc = spawn('make', makeArgs, {
		cwd: bd,
		uid: process.getuid(),
		gid: process.getgid()
	})
	makeProc.stdout.on('data', (data) => {
		console.log(`BUN: MAKE: ${data}`)
	})
	makeProc.stderr.on('data', (data) => {
		console.log(`BUN: MAKE: ERROR: ${data}`)
	})
	makeProc.on('close', (code) => {
		console.log(`BUN: MAKE: finished with code ${code}`)
		cb()
	})
}

async function mkpkg(prefix, name, flags, bd, srcDir, cb) {
	const cur = path.resolve('./')
	process.chdir(bd)
	const {output} = flags
	const pkg = `${name}.bun.tgz`
	fs.mkdir('_destdir', {}, (err) => {
		console.log(err)
	})
	const installArgs = ['install']
	if (flags.hasOwnProperty('installOptions') && flags.installOptions.length > 0) {
		installArgs.concat(flags.installOptions)
	}
	const dest = path.resolve('_destdir')
	const envVars = {...process.env, prefix: prefix, PREFIX: prefix, DESTDIR: dest}
	console.log(installArgs)
	const installProc = spawn('make', installArgs, {
		cwd: bd,
		uid: process.getuid(),
		gid: process.getgid(),
		env: envVars
	})	
	installProc.stdout.on('data', (data) => {
		console.log(`BUN: MAKE INSTALL: ${data}`)
	})
	installProc.stderr.on('data', (data) => {
		console.log(`BUN: MAKE INSTALL: ERROR: ${data}`)
	})
	installProc.on('close', (code) => {
		console.log(`BUN: MAKE INSTALL: finished with code ${code}`)
		console.log(`Install to _destdir successful, creating archive`)
		const pkgSrc = path.join(dest, prefix)
		createArch(pkgSrc, bd, pkg, () => {
			console.log('Package Archive successfully created')
			cb(cur)
		})	
	})
}

function cleanup(bconf, pkgFile, bd, sd) {
	console.log(`Package creation was successful!`)
	console.log('Cleaning Up')
	var pkgBd = path.join(bd, pkgFile)
	var pkgTo = path.join(bconf.packages, pkgFile)
	var delDir = path.resolve('./pkg_tmp')
	fs.copyFile(pkgBd, pkgTo, (err) => {
		if (err) throw err
		console.log(`Copied ${pkgFile} from ${pkgBd} to ${pkgTo}`)
		console.log('Deleting pkg_tmp directory')
		const removeFiles = spawn('rm', ['-rvf', delDir])
		removeFiles.stdout.on('data', (data) => {
			console.log(`BUN: CLEANUP: ${data}`)
		})
		removeFiles.stderr.on('data', (data) => {
			console.log(`BUN: CLEANUP: ERROR: ${data}`)
		})
		removeFiles.on('close', (code) => {
			console.log(`BUN: CLEANUP: finished with code ${code}`)
			console.log(`Congratulations you have successfully built a package for ${pkgFile}`)
			console.log(`You can now install it using 'bunder in ${pkgFile}'`)
		})
	})
}

MkpkgCommand.usage = `bunder mkpkg tar_file [bunder options] [make options]`

MkpkgCommand.description = `Create Bunder Package`

MkpkgCommand.args = [
	{
	name: 'file',
		required: true,
		description: 'Source Tarball to create package from'
	}
]

MkpkgCommand.flags = {
	name: flags.string({
		char: 'n',
		description: 'Optional name of package bun file',
		required: false
	}),
	dir: flags.string({
		char: 'd',
		description: 'Optional build directory',
		required: false,
		default: 'bundir'
	}),
	output: flags.string({
		char: 'o',
		description: 'Optional output directory for bun file',
		required: false
	}),
	makeOptions: flags.string({
		char: 'm',
		description: 'Options for make when building package',
		required: false,
		multiple: true
	}),
	configOptions: flags.string({
		char: 'c',
		description: 'Options for ./configure when building package',
		required: false,
		multiple: true
	}),
	installOptions: flags.string({
		char: 'i',
		description: 'Options for make install when building package',
		required: false,
		multiple: true
	})
}

module.exports = MkpkgCommand
