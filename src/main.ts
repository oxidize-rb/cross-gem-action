import * as core from '@actions/core'
import {Input, loadInput} from './input'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    const input = loadInput()
    core.debug(`Compiling native gem for ${input.platform}`)
    await Promise.all([setupDocker(input), installDeps()])

    await compileGem(input)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function compileGem(input: Input): Promise<void> {
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

async function installDeps(): Promise<void> {
  try {
    await exec('gem', ['install', 'rake-compiler', 'rake-compiler-dock'])
  } catch (error) {
    core.error('Error compiling gem')
    throw error
  }
}

async function setupDocker(input: Input): Promise<void> {
  try {
    core.debug('Setup docker buildx')
    await exec('docker', [
      'buildx',
      'create',
      '--driver',
      'docker-container',
      '--name',
      'cross-gem-builder',
      '--use'
    ])
  } catch (error) {
    core.error('Could not setup buildx driver')
    throw error
  }

  try {
    const image = `rbsys/rcd:${input.platform}`
    core.debug(`Downloading docker image: ${image}`)
    await exec('docker', ['pull', image, '--quiet'])
  } catch (error) {
    core.error('Error pulling rcd image')
    throw error
  }

  setEnv('RCD_DOCKER_BUILD', 'docker buildx build')
  setEnv('RCD_IMAGE', `rbsys/rcd:${input.platform}`)
}

function setEnv(name: string, value: string): void {
  core.exportVariable(name, value)
  process.env[name] = value
}

run()
