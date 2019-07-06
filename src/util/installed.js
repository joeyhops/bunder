const fs = require('fs-extra')

module.exports = async function() {
	return await fs.pathExists('/usr/bunder/conf/config.json')
}
