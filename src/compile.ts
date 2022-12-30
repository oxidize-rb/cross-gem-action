import * as core from '@actions/core'
import {Input} from './input'
import {exec} from '@actions/exec'
import {fetchRubyToRustMapping, parseEnvString, shellEscape} from './utils'

const LINKER_MAPPING: {[k: string]: string | undefined} = {
  'x86_64-linux': 'x86_64-linux-gnu-gcc',
  'x86_64-linux-musl': 'x86_64-unknown-linux-musl-gcc',
  'aarch64-linux': 'aarch64-linux-gnu-gcc',
  'arm64-darwin': 'aarch64-apple-darwin-clang',
  'x86_64-darwin': 'x86_64-apple-darwin-clang',
  'x64-mingw32': 'x86_64-w64-mingw32-gcc',
  'x64-mingw32-ucrt': 'x86_64-w64-mingw32-gcc'
}

export async function compileGem(
  input: Input,
  executor: typeof exec | undefined = exec
): Promise<void> {
  core.debug(`Invoking rake-compiler-dock ${input.platform}`)

  const steps = []
  const parsedEnv = parseEnvString(input.env || '')
  const versionString = input.rubyVersions.join(':')

  for (const [key, val] of Object.entries(parsedEnv)) {
    steps.push(`export ${key}='${shellEscape(val, true)}'`)
  }

  if (!parsedEnv.RUBY_CC_VERSION) {
    steps.push(`export RUBY_CC_VERSION='${versionString}'`)
  }

  if (input.useRubyLinkerForCargo) {
    const rustPlatform = (await fetchRubyToRustMapping())[input.platform]

    const envVar = `CARGO_TARGET_${rustPlatform}_LINKER`
      .replace(/-/g, '_')
      .toUpperCase()

    const linker = LINKER_MAPPING[input.platform]

    if (linker) {
      steps.push(`export ${envVar}='${linker}'`)
    } else {
      core.setOutput('warning', `No linker mapping for ${input.platform}`)
    }
  }

  if (input.setup) {
    steps.push(shellEscape(input.setup))
  }

  if (input.command) {
    steps.push(shellEscape(input.command))
  }

  const fullCommand = steps
    .filter(item => item != null && item !== '')
    .join('\n')

  const args: string[] = ['bash', '-c', fullCommand]

  try {
    await executor('rake-compiler-dock', args, {
      cwd: input.directory
    })
  } catch (error) {
    core.error('Error compiling gem')
    throw error
  }
}
