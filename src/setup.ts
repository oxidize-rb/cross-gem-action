import * as core from '@actions/core'
import {Input} from './input'
import {exec} from '@actions/exec'

async function installDeps(): Promise<void> {
  core.debug(`Installing dependencies`)

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

export async function setup(input: Input): Promise<void> {
  core.debug(`Compiling native gem for ${input.platform}`)
  await Promise.all([setupDocker(input), installDeps()])
}
