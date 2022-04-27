import * as core from '@actions/core'
import {Input, loadInput} from './input'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    const input = loadInput()
    core.debug(`Compiling native gem for ${input.platform}`)
    await Promise.all([setupDockerBuildx(), installDeps()])

    await compileGem(input)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function compileGem(input: Input): Promise<void> {
  const cmd = `
    set -e
    bundle --local
    rake native:${input.platform}} gem
  `
  try {
    await exec('rake-compiler-dock', ['bash', '-c', cmd], {
      cwd: input.directory
    })
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

async function setupDockerBuildx(): Promise<void> {
  try {
    await exec('docker', [
      'buildx',
      'create',
      '--driver',
      'docker-container',
      '--use'
    ])
  } catch (error) {
    core.error('Could not setup buildx driver')
    throw error
  }
  core.exportVariable('RCD_DOCKER_BUILD', 'docker buildx build')
}

run()
