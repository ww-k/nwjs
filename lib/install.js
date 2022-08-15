'use strict'

/**
 * Module dependencies
 */
 const fs = require('fs')
const path = require('path')
const co = require('co')
const os = require('./os')
const pget = require('pget')
const home = require('user-home')
const extract = require('extract-zip')
const pify = require('pify')
const exists = require('path-exists')
const figures = require('figures')
const config = require('./config')
const oldVersion = require('./old-version')

module.exports = co.wrap(function* (version, command) {
  try {
    // Create cache dir
    const cacheDir = path.join(home, '.nwjs')
    fs.mkdirSync(cacheDir, { recursive: true })
    // check if has cached nwjs in this version
    if (exists.sync(`${cacheDir}/${version}`)) {
      return console.log(`A cached nwjs already located in ${cacheDir}/${version}`.red)
    }
    // Download the nwjs
    const realVersion = version.split('-sdk').shift()
    const isNodeWebkit = oldVersion(version)
    const prefix = isNodeWebkit ? 'node-webkit' : 'nwjs'
    const arch = command.arch || arch;
    const fileName = version == realVersion ? `${prefix}-v${realVersion}-${os.platform}-${arch}` : `${prefix}-sdk-v${realVersion}-${os.platform}-${arch}`
    const ext = os.platform === 'linux' ? 'tar.gz' : 'zip'
    const baseUrl = (process.env.NWJS_MIRROR || 'http://dl.nwjs.io').replace(/\/$/, '');
    //const defaultMirror = 'https://registry.npmmirror.com/-/binary/nwjs';
    const url = `${baseUrl}/v${realVersion}/${fileName}.${ext}`
    // console.log(`start download from ${url}`);
    yield pget(url, {dir: cacheDir, target: `${version}.${ext}`, verbose: true, proxy: process.env.HTTP_PROXY})
    // extract both zip and tarball
    const from = `${cacheDir}/${version}.${ext}`
    if (os.platform === 'linux') {
      exec(`tar -xzvf ${from} -C ${cacheDir}`, {silent: true})
    } else {
      yield pify(extract)(from, {dir: cacheDir})
    }
    fs.renameSync(`${cacheDir}/${fileName}`, `${cacheDir}/${version}`)
    // remove zip
    fs.rmSync(from)
    // update the current using version
    config.set('current', version)
    // print success info
    console.log(`${figures.tick} Version ${version} is installed and activated`.green)
  } catch (e) {
    console.log(`Failed to install ${figures.cross} Version ${version}`.red)
    console.log(e.stack)
  }
})
