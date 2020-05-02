const { readFile, writeFile, mkdir } = require('fs').promises
const path = require('path')
const { tmpdir } = require('os')
const { spawnSync } = require('child_process')
const test = require('tape')
const { repoRoot, repoFileUrl } = require('./utils')

const renderDataPath = path.join(
  tmpdir(),
  'deoptigate',
  'deoptigate.render-data.js'
)

const testOutPath = (...args) =>
  path.join(tmpdir(), 'deoptigate-tests', ...args)

const binPath = repoRoot('bin/deoptigate')

async function runDeoptigate(srcPath) {
  spawnSync(process.execPath, [binPath, srcPath])

  const contents = await readFile(renderDataPath, 'utf8')

  const outDir = path.dirname(path.relative(repoRoot(), srcPath))
  await mkdir(testOutPath(outDir), { recursive: true })

  const newContents = `function deoptigateRender(info) { return info; }; \nmodule.exports = ${contents.trim()};`
  const outPath = testOutPath(outDir, 'deoptigate.render-data.js')
  await writeFile(outPath, newContents, 'utf8')

  return require(outPath.replace(/.js$/, ''))
}

test('deoptigate simple/adders.js', async (t) => {
  const srcPath = repoRoot('examples/simple/adders.js')

  const renderData = await runDeoptigate(srcPath)
  t.equal(renderData.length, 1, 'number of files')

  const fileName = renderData[0][0]
  t.equal(fileName, srcPath, 'filename in render data')

  const fileData = renderData[0][1]
  t.equal(fileData.fullPath, srcPath, 'fullPath')
  t.assert(Array.isArray(fileData.ics), 'ics key is an Array')
  t.assert(Array.isArray(fileData.deopts), 'deopts key is an Array')
  t.assert(Array.isArray(fileData.codes), 'codes key is an Array')

  const fileSrc = await readFile(srcPath, 'utf8')
  t.equal(fileData.src, fileSrc, 'file source')
})

test('deoptigate two-modules/adders.js', async (t) => {
  const srcPaths = [
    repoRoot('examples/two-modules/adders.js'),
    repoRoot('examples/two-modules/objects.js'),
  ]

  const renderData = await runDeoptigate(srcPaths[0])
  t.equal(renderData.length, 2, 'number of files')

  for (let i = 0; i < renderData.length; i++) {
    const fileName = renderData[i][0]
    t.equal(fileName, srcPaths[i], `filename in render data ${i}`)

    const fileData = renderData[i][1]
    t.equal(fileData.fullPath, srcPaths[i], `fullPath ${i}`)
    t.assert(Array.isArray(fileData.ics), `ics key is an Array ${i}`)
    t.assert(Array.isArray(fileData.deopts), `deopts key is an Array ${i}`)
    t.assert(Array.isArray(fileData.codes), `codes key is an Array ${i}`)

    const fileSrc = await readFile(srcPaths[i], 'utf8')
    t.equal(fileData.src, fileSrc, `file source ${i}`)
  }
})

test('deoptigate html-inline/adders.html', async (t) => {
  const filePath = repoRoot('examples/html-inline/adders.html')
  const fileUrl = repoFileUrl('examples/html-inline/adders.html')

  const renderData = await runDeoptigate(filePath)
  t.equal(renderData.length, 1, 'number of files')

  const fileName = renderData[0][0]
  t.equal(fileName, fileUrl, 'filename in render data')

  const fileData = renderData[0][1]
  t.equal(fileData.fullPath, filePath, 'fullPath')
  t.assert(Array.isArray(fileData.ics), 'ics key is an Array')
  t.assert(Array.isArray(fileData.deopts), 'deopts key is an Array')
  t.assert(Array.isArray(fileData.codes), 'codes key is an Array')

  const fileSrc = await readFile(filePath, 'utf8')
  t.equal(fileData.src, fileSrc, 'file source')
})

test('deoptigate html-external/index.html', async (t) => {
  const srcPath = repoRoot('examples/html-external/index.html')
  const jsPaths = [
    repoRoot('examples/html-external/adders.js'),
    repoRoot('examples/html-external/objects.js'),
  ]
  const jsUrls = [
    repoFileUrl('examples/html-external/adders.js'),
    repoFileUrl('examples/html-external/objects.js'),
  ]

  const renderData = await runDeoptigate(srcPath)
  t.equal(renderData.length, 2, 'number of files')

  for (let i = 0; i < renderData.length; i++) {
    const fileName = renderData[i][0]
    t.equal(fileName, jsUrls[i], `filename in render data ${i}`)

    const fileData = renderData[i][1]
    t.equal(fileData.fullPath, jsPaths[i], `fullPath ${i}`)
    t.assert(Array.isArray(fileData.ics), `ics key is an Array ${i}`)
    t.assert(Array.isArray(fileData.deopts), `deopts key is an Array ${i}`)
    t.assert(Array.isArray(fileData.codes), `codes key is an Array ${i}`)

    const fileSrc = await readFile(jsPaths[i], 'utf8')
    t.equal(fileData.src, fileSrc, `file source ${i}`)
  }
})
