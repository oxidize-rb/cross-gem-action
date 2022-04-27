import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {stderr} from 'process'

test('errors with invalid platform', () => {
  process.env['INPUT_PLATFORM'] = 'xafasdf'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  const out = cp.spawnSync(np, [ip], options).stdout.toString()

  expect(out).toContain(
    '::error::Unsupported platform: xafasdf. Must be one of x86_64-linux, aarch64-linux, arm-linux, x86_64-darwin, arm64-darwin, x64-mingw32, x64-mingw-ucr'
  )
})

test('errors when no rakefile', () => {
  process.env['INPUT_PLATFORM'] = 'x86_64-linux'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  const out = cp.spawnSync(np, [ip], options).stdout.toString()

  expect(out).toContain('::error::Could not find Rakefile in directory: ')
})
