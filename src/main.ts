import * as core from '@actions/core'
import {compileGem} from './compile'
import {loadInput} from './input'
import {setup} from './setup'
import {uploadGem} from './upload'

async function run(): Promise<void> {
  core.warning(
    'This action is deprecated. Please use oxidize-rb/actions/cross-gem instead (https://github.com/oxidize-rb/actions/blob/main/cross-gem/readme.md).'
  )

  try {
    const input = await loadInput()

    await setup(input)
    await compileGem(input)
    await uploadGem(input)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
