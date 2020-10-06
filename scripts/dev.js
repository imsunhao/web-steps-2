const execa = require('execa')
const { targets: allTargets, fuzzyMatchTarget } = require('./utils')
const args = require('minimist')(process.argv.slice(2))

const targets = args._.length ? fuzzyMatchTarget(args._) : allTargets
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

targets.forEach(target => {
  execa(
    'rollup',
    [
      '-wc',
      '--environment',
      [`COMMIT:${commit}`, `NODE_ENV: development`, `TARGET:${target}`].filter(Boolean).join(',')
    ],
    {
      stdio: 'inherit'
    }
  )
})
