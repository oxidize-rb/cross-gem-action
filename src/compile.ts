import * as core from '@actions/core'
import {Input} from './input'
import {exec} from '@actions/exec'

export async function compileGem(input: Input): Promise<void> {
  core.debug(`Invoking rake-compiler-dock ${input.platform}`)

  const fullCommand = [input.setup, input.command]
    .filter(item => item != null && item !== '')
    .join('\n')

  const args: string[] = [
    'env',
    input.env || '',
    'bash',
    '-c',
    fullCommand
  ].filter(item => item !== '')

  try {
    await exec('rake-compiler-dock', args, {cwd: input.directory})
  } catch (error) {
    core.error('Error compiling gem')
    throw error
  }
}
