const path = require('path')

function repoRoot(...args) {
  return path.join(__dirname, '..', ...args)
}

function repoFileUrl(...args) {
  let fullPath = repoRoot(...args)
  if (process.platform === 'win32') {
    fullPath = '/' + fullPath.replace(/\\/g, '/')
  }

  return 'file://' + fullPath
}

module.exports = {
  repoRoot,
  repoFileUrl,
}
