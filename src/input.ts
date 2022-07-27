import {getInput} from '@actions/core'
import path from 'path'
import {statSync} from 'fs'
import {fetchValidPlatforms} from './utils'

// Parsed action input
export interface Input {
  platform: string
  directory: string
  version: string
  env: string | null
  command: string
  useRubyLinkerForCargo: boolean
  setup: string | null
}

export async function loadInput(): Promise<Input> {
  const platform = getInput('platform', {required: true})
  const validPlatforms = await fetchValidPlatforms()

  if (!validPlatforms.includes(platform)) {
    throw new Error(
      `Unsupported platform: ${platform}. Must be one of ${validPlatforms.join(
        ', '
      )}`
    )
  }

  const directory = getInput('directory') || process.cwd()

  try {
    statSync(path.join(directory, 'Rakefile')).isFile()
  } catch (_e) {
    throw new Error(`Could not find Rakefile in directory: ${directory}`)
  }

  return {
    platform,
    directory,
    version: getInput('version') || '0.9.27',
    useRubyLinkerForCargo: getInput('use-ruby-linker-for-cargo') === 'true',
    env: getInput('env') || null,
    setup: getInput('setup') || 'bundle install || gem install rb_sys',
    command: getInput('command') || `bundle exec rake native:${platform} gem`
  }
}
