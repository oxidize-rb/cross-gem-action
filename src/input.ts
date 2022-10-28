import {getInput, info} from '@actions/core'
import path from 'path'
import {statSync} from 'fs'
import {fetchValidPlatforms} from './utils'

// Parsed action input
export interface Input {
  platform: string
  directory: string
  version: string
  rubyVersions: string[]
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
  const rubyVersions = parseRubyVersions(getInput('ruby-versions'))

  try {
    statSync(path.join(directory, 'Rakefile')).isFile()
  } catch (_e) {
    throw new Error(`Could not find Rakefile in directory: ${directory}`)
  }

  return {
    platform,
    directory,
    rubyVersions,
    version: getInput('version'),
    useRubyLinkerForCargo: getInput('use-ruby-linker-for-cargo') === 'true',
    env: getInput('env') || null,
    setup: getInput('setup') || 'bundle install || gem install rb_sys',
    command: getInput('command') || `bundle exec rake native:${platform} gem`
  }
}

function parseRubyVersions(input: string): string[] {
  const rawVersions = input.split(',').map(s => s.trim())

  // Add a patch version if it's missing
  const sanitizedVersions = rawVersions
    .map(version => {
      return version.split('.').length === 2 ? `${version}.0` : version
    })
    .sort(undefined)
    .reverse()

  // Remove duplicates
  const filtered = sanitizedVersions.filter(
    (version, index) => sanitizedVersions.indexOf(version) === index
  )

  // Ensure valid versions
  for (const version of filtered) {
    if (!version.match(/^\d\.\d\.0$/)) {
      throw new Error(`Invalid Ruby version: ${version}`)
    }
  }

  info(`Using Ruby versions: ${filtered.join(', ')}`)
  return filtered
}
