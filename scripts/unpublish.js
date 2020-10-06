const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const currentVersion = require('../package.json').version
const { prompt } = require('enquirer')
const execa = require('execa')

const isDryRun = args.dry
const skipPush = args.skipPush

const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'))

const skippedPackages = []

const run = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts })
const dryRun = (bin, args, opts = {}) => console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
const runIfNotDry = isDryRun ? dryRun : run
const getPkgRoot = pkg => path.resolve(__dirname, '../packages/' + pkg)
const step = msg => console.log(chalk.cyan(msg))

async function main() {
  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `unpublish v${currentVersion}. Confirm?`
  })

  if (!yes) {
    return
  }

  // publish packages
  step('\nPublishing packages...')
  for (const pkg of packages) {
    await unpublishPackage(pkg, currentVersion, runIfNotDry)
  }

  // generate changelog
  await run(`yarn`, ['changelog'])

  await runIfNotDry('git', ['add', '-A'])
  await runIfNotDry('git', ['commit', '--allow-empty', '-m', `revert: v${currentVersion}`])

  // push to GitHub
  step('\nPushing to GitHub...')
  if (!skipPush) {
    await runIfNotDry('git', ['push', '--set-upstream', 'origin', 'master'])
  } else {
    console.log(`(skipped)`)
  }
}

async function unpublishPackage(pkgName, version, runIfNotDry) {
  if (skippedPackages.includes(pkgName)) {
    return
  }
  const pkgRoot = getPkgRoot(pkgName)
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  if (pkg.private) {
    return
  }

  step(`Unpublishing ${pkgName}...`)
  try {
    await runIfNotDry(
      'npm',
      ['unpublish', '--force', '--registry=https://registry.npmjs.org', `@web-steps-2/${pkgName}@${version}`],
      {
        cwd: pkgRoot,
        stdio: 'pipe'
      }
    )
    console.log(chalk.green(`Successfully unpublish ${pkgName}@${version}`))
  } catch (e) {
    console.error(e)
  }
}

main().catch(err => {
  console.error(err)
})
