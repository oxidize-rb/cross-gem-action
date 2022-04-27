import * as core from '@actions/core'
import {Input} from './input'
import {exec} from '@actions/exec'

export async function compileGem(input: Input): Promise<void> {
  core.debug(`Invoking rake-compiler-dock ${input.platform}`)

  try {
    await exec(
      'rake-compiler-dock',
      ['env', input.env, '/bin/bash', '-c', input.command],
      {
        cwd: input.directory
      }
    )
  } catch (error) {
    core.error('Error compiling gem')
    throw error
  }
}
