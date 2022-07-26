import {getInput} from '@actions/core'
import path from 'path'
import {HttpClient} from '@actions/http-client'
import {statSync} from 'fs'

// Parsed action input
export interface Input {
  platform: string
  directory: string
  version: string
  env: string | null
  command: string
  setup: string | null
}

const http = new HttpClient('cross-gem-action')

async function fetchValidPlatforms(): Promise<string[]> {
  const res = await http.get(
    'https://raw.githubusercontent.com/oxidize-rb/rb-sys/main/data/derived/ruby-to-rust.json'
  )
  const body = await res.readBody()
  const json = JSON.parse(body)

  return Object.keys(json)
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
    env: getInput('env') || null,
    setup: getInput('setup') || '',
    command:
      getInput('command') ||
      `bundle --local || bundle install || true; rake native:${platform} gem`
  }
}
