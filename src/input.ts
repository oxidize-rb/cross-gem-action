import {getInput} from '@actions/core'
import path from 'path'
import {statSync} from 'fs'

// Parsed action input
export interface Input {
  platform: string
  directory: string
  env: string | null
  command: string
}

export const VALID_PLATFORMS = [
  'x86_64-linux',
  'aarch64-linux',
  'arm-linux',
  'x86_64-darwin',
  'arm64-darwin',
  'x64-mingw32',
  'x64-mingw-ucrt'
]

export function loadInput(): Input {
  const platform = getInput('platform', {required: true})

  if (!VALID_PLATFORMS.includes(platform)) {
    throw new Error(
      `Unsupported platform: ${platform}. Must be one of ${VALID_PLATFORMS.join(
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
    env: getInput('env') || null,
    command:
      getInput('command') ||
      `bundle --local || bundle install || true; rake native:${platform} gem`
  }
}
