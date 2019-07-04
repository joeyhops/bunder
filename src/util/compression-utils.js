const fs = require('fs')
const path = require('path')
const decompress = require('decompress')
const dexz = require('decompress-tarxz')
const debz2 = require('decompress-tarbz2')
const degz = require('decompress-targz')
const detar = require('decompress-tar')
const {spawn} = require('child_process')

module.exports = {
	uncompress: function (file, outdir='') {
		const compType = path.extname(file)
		console.log('Archive is type: ' + compType)
		console.log(`Extracting ${file} ${outdir ? `to ${outdir}` : ''}`)
		const plugins = pluginType(compType)
		if (outdir) {
			return decompress(file, outdir, {
				plugins
			}).then(() => {
				console.log(`Decompressed ${file} to ${outdir}`)
			})
		} else {
			return decompress(file, '.', {
				plugins: plugins
			}).then(() => {
				console.log(`Decompressed ${file}`)
			})
		}
	},
	trimArchExt: function (fileName){	
		var parts = fileName.split('.')
		console.log(parts)
		var filtered = parts.filter(part => {
			return (part !== 'tar' && part !== 'xz' && part !== 'bz2' && part !== 'gz' && part !== 'tgz')
		})
		return filtered.join('.')
	},
	createArch: function (src, bd, name, cb) {
		fs.access(src, fs.constants.F_OK, (err) => {
			if (err) {
				console.error(err)
			} else {
				console.log(`Creating package archive from ${src}`)
				const pkgPath = path.join(bd, name)
				const mkarcProc = spawn('tar', ['-czf', pkgPath, '-C', src, '.'], {
					cwd: bd
				})
				mkarcProc.stdout.on('data', (data) => {
					console.log(`BUN: MAKE: ${data}`)
				})
				mkarcProc.stderr.on('data', (data) => {
					console.log(`BUN: MAKE: ERROR: ${data}`)
				})
				mkarcProc.on('close', (code) => {
					console.log(`BUN: MAKE: finished with code ${code}`)
					cb()
				})
			}
		})
	}
}

function pluginType(type) {
	const plugins = []
	switch (type) {
		case '.tar':
			plugins.push(detar())
			break;
		case '.bz2':
			plugins.push(debz2())
			break;
		case '.xz':
			plugins.push(dexz())
			break;
		case '.gz':
			plugins.push(degz())
			break;
		case '.tgz':
			plugins.push(degz())
			break;
	}
	return plugins
}
