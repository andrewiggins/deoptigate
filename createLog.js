const { writeFile } = require('fs').promises
const path = require('path')
const { spawnSync, execSync } = require('child_process')
const puppeteer = require('puppeteer')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const root = (...args) => path.join(__dirname, ...args)

// const htmlFile = root('examples/html-inline/adders.html')
// const logFile = root('test/logs/html-inline-%p.v8.log')

const htmlFile = root('examples/html-external/index.html')
const logFile = root('test/logs/html-external-%p.v8.log')

async function puppeteerMain() {
  var browser = await puppeteer.launch({
    // headless: false,
    ignoreDefaultArgs: ['about:blank'],
    args: [
      '--disable-extensions',
      '--no-sandbox',
      `--js-flags=--logfile=${logFile} --trace-ic --nologfile-per-isolate`,
      htmlFile,
    ],
  })

  var page = (await browser.pages())[0]

  console.log('Waiting...')
  // await page.waitForNavigation()
  // await page.waitForNavigation({ waitUntil: 'load' })
  // await page.waitForNavigation({ waitUntil: 'networkidle2' })

  // process.stdout.write('Waiting')
  // const start = Date.now()
  // while (Date.now() - start < 5000) {
  //   await delay(1000)
  //   process.stdout.write('.')
  // }

  await browser.close()
}

async function manualMain() {
  const chromeBin = root(
    'node_modules/puppeteer/.local-chromium/win64-737027/chrome-win/chrome.exe'
  )

  const args = [
    '--disable-extensions',
    '--no-sandbox',
    '--js-flags=--logfile=/temp/trace/manual-main-2-%p.log --trace-ic --nologfile-per-isolate',
    '--enable-logging=stderr',
    '--v=1',
    htmlFile,
  ]

  console.log(`$ ${chromeBin} ${args.join(' ')}`)
  const cp = spawnSync(chromeBin, args, { encoding: 'utf8' })

  // const stdout = execSync([chromeBin, ...args].join(' '), { encoding: 'utf8' })
  // console.log(stdout)

  console.log(cp.stdout)
  await writeFile('stderr.log', cp.stderr, { encoding: 'utf8' })
}

puppeteerMain()
// manualMain()
