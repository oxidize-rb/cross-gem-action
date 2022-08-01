import * as core from '@actions/core'
import {Input} from './input'
import {exec} from '@actions/exec'
import {fetchRubyToRustMapping} from './utils'

const LINKER_MAPPING: {[k: string]: string | undefined} = {
  'x86_64-linux': 'x86_64-linux-gnu-gcc',
  'aarch64-linux': 'aarch64-linux-gnu-gcc',
  'arm64-darwin': 'aarch64-apple-darwin-clang',
  'x86_64-darwin': 'x86_64-apple-darwin-clang',
  'x64-mingw32': 'x86_64-w64-mingw32-gcc',
  'x64-mingw32-ucrt': 'x86_64-w64-mingw32-gcc'
}

export async function compileGem(input: Input): Promise<void> {
  core.debug(`Invoking rake-compiler-dock ${input.platform}`)

  const steps = [input.setup, input.command]

  if (input.useRubyLinkerForCargo) {
    const rustPlatform = (await fetchRubyToRustMapping())[input.platform]

    const envVar = `CARGO_TARGET_${rustPlatform}_LINKER`
      .replace('-', '_')
      .toUpperCase()

    const linker = LINKER_MAPPING[input.platform]

    if (linker) {
      steps.unshift(`export ${envVar}="${linker}"`)
    } else {
      core.setOutput('warning', `No linker mapping for ${input.platform}`)
    }
  }

  const fullCommand = steps
    .filter(item => item != null && item !== '')
    .join('\n')

  const args: string[] = [
    'env',
    (input.env || '').replace('\n', ' '),
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
