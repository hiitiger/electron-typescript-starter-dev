const fse = require('fs-extra')
const path = require('path')

console.log('copy begin...')
fse.copyFileSync(
  path.join(__dirname, '../build_Win32/Release/app_core.node'),
  path.join(__dirname, '../nativelib/app_core/app_core.node')
)
console.log('copy end...')
