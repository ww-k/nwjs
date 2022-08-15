const fs = require('fs')
const path = require('path')
const home = require('user-home')

const cacheDir = path.join(home, '.nwjs')
fs.mkdirSync(cacheDir, { recursive: true })
