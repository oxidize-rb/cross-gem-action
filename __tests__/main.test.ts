import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {jest, expect, test} from '@jest/globals'
import {stderr} from 'process'
import {parseEnvString as parseEnv} from './../src/utils'
import {compileGem} from './../src/compile'

import * as core from '@actions/core'
import {Input} from '../src/input'

process.env['INPUT_RUBY-VERSIONS'] = '3.1, 3.0, 2.7, 2.6, 2.5, 2.4, 2.3'
process.env['INPUT_PLATFORM'] = 'x86_64-linux'
process.env['INPUT_VERSION'] = '0.9.34'

test('errors with invalid platform', () => {
  withExtraEnv({INPUT_PLATFORM: 'xafasdf'}, () => {
    const np = process.execPath
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.ExecFileSyncOptions = {
      env: process.env
    }
    const out = cp.spawnSync(np, [ip], options).stdout.toString()

    expect(out).toContain(
      '::error::Unsupported platform: xafasdf. Must be one of arm-linux,'
    )
  })
})

test('errors when no rakefile', () => {
  withExtraEnv({INPUT_PLATFORM: 'x86_64-linux'}, () => {
    const np = process.execPath
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.ExecFileSyncOptions = {
      env: process.env
    }
    const out = cp.spawnSync(np, [ip], options).stdout.toString()

    expect(out).toContain('::error::Could not find Rakefile in directory: ')
  })
})

test('errors with invalid ruby version', () => {
  withExtraEnv({'INPUT_RUBY-VERSIONS': '3'}, () => {
    const np = process.execPath
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.ExecFileSyncOptions = {
      env: process.env
    }
    const out = cp.spawnSync(np, [ip], options).stdout.toString()

    expect(out).toContain('::error::Invalid Ruby version: 3')
  })
})

test('valid ruby versions', () => {
  withExtraEnv({'INPUT_RUBY-VERSIONS': '3.1, 3.0'}, () => {
    const np = process.execPath
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.ExecFileSyncOptions = {
      env: process.env
    }
    const out = cp.spawnSync(np, [ip], options).stdout.toString()

    expect(out).toContain('Using Ruby versions: 3.1.0, 3.0.0')
  })
})

function withExtraEnv(env: {[key: string]: string}, callback: () => void) {
  let oldEnv = {...process.env}

  for (const key in env) {
    process.env[key] = env[key]
  }

  try {
    callback()
  } finally {
    for (const key in env) {
      process.env[key] = oldEnv[key]
    }
  }
}

test('parsing env string', () => {
  expect(parseEnv('FOO=bar\nBAZ="qux"\n')).toEqual({FOO: 'bar', BAZ: 'qux'})
  expect(parseEnv('FOO=bar\nBAZ=""\n\n')).toEqual({FOO: 'bar', BAZ: ''})
  expect(parseEnv('FOO=""bar""')).toEqual({FOO: '"bar"'})
  expect(parseEnv('')).toEqual({})
  expect(parseEnv('# FOO=bar')).toEqual({})
  expect(parseEnv('RUBY_CC_VERSION="3.1.0"')).toEqual({
    RUBY_CC_VERSION: '3.1.0'
  })
})

test('compiling gem with explicity RUBY_CC_VERSION', async () => {
  const input = fakeInput({
    env: 'RUBY_CC_VERSION=3.1.0'
  })

  const executor = await testCompileGem(input)

  expect(executor).toHaveBeenCalledWith(
    'rake-compiler-dock',
    ['bash', '-c', "export RUBY_CC_VERSION='3.1.0'\nrake compile"],
    expect.objectContaining({cwd: './tmp/test'})
  )
})

test('compiling gem with explicity env string', async () => {
  const input = fakeInput({
    env: 'FOO="bar"'
  })

  const executor = await testCompileGem(input)

  expect(executor).toHaveBeenCalledWith(
    'rake-compiler-dock',
    [
      'bash',
      '-c',
      "export FOO='bar'\nexport RUBY_CC_VERSION='3.1.0:3.0.0'\nrake compile"
    ],
    expect.objectContaining({cwd: './tmp/test'})
  )
})

test('compiling gem with explicity setup', async () => {
  const input = fakeInput({
    setup: 'bundle install\nrake setup'
  })

  const executor = await testCompileGem(input)

  expect(executor).toHaveBeenCalledWith(
    'rake-compiler-dock',
    [
      'bash',
      '-c',
      "export RUBY_CC_VERSION='3.1.0:3.0.0'\nbundle install\nrake setup\nrake compile"
    ],
    expect.objectContaining({cwd: './tmp/test'})
  )
})

test('compiling cargo linker for ruby', async () => {
  const input = fakeInput({
    useRubyLinkerForCargo: true
  })

  const executor = await testCompileGem(input)

  expect(executor).toHaveBeenCalledWith(
    'rake-compiler-dock',
    [
      'bash',
      '-c',
      "export RUBY_CC_VERSION='3.1.0:3.0.0'\nexport CARGO_TARGET_X86_64_UNKNOWN-LINUX-GNU_LINKER='x86_64-linux-gnu-gcc'\nrake compile"
    ],
    expect.anything()
  )
})

test('compiling gem with explicity RUBY_CC_VERSION', async () => {
  const input = fakeInput({
    rubyVersions: ['3.1.0', '3.0.0', '2.6.0']
  })

  const executor = await testCompileGem(input)

  expect(executor).toHaveBeenCalledWith(
    'rake-compiler-dock',
    ['bash', '-c', "export RUBY_CC_VERSION='3.1.0:3.0.0:2.6.0'\nrake compile"],
    expect.anything()
  )
})

async function testCompileGem(input: Input) {
  let executor = jest.fn().mockImplementationOnce(() => Promise.resolve())

  await compileGem(input, executor as any)

  return executor
}

function fakeInput(extraInputs: Partial<Input>) {
  return {
    platform: 'x86_64-linux',
    rubyVersions: ['3.1.0', '3.0.0'],
    version: '0.9.34',
    gem: 'test.gem',
    directory: './tmp/test',
    env: '',
    command: 'rake compile',
    useRubyLinkerForCargo: false,
    setup: null,
    ...extraInputs
  }
}
