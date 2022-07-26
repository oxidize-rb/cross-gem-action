import * as core from '@actions/core'
import {compileGem} from './compile'
import {loadInput} from './input'
import {setup} from './setup'
import {uploadGem} from './upload'

async function run(): Promise<void> {
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
