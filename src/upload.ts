import * as artifact from '@actions/artifact'
import * as glob from '@actions/glob'
import {Input} from './input'
import {setOutput} from '@actions/core'

export async function uploadGem(
  input: Input
): Promise<artifact.UploadResponse> {
  const artifactClient = artifact.create()
  const artifactName = 'cross-gem'
  const files = await findGem(input)
  const rootDirectory = input.directory
  const options = {continueOnError: false}

  const uploadResponse = artifactClient.uploadArtifact(
    artifactName,
    files,
    rootDirectory,
    options
  )
  setOutput('artifact-upload-response', JSON.stringify(uploadResponse))
  return uploadResponse
}

async function findGem(input: Input): Promise<string[]> {
  const patterns = [`**/pkg/*-${input.platform}.gem`]
  const globber = await glob.create(patterns.join('\n'))
  return globber.glob()
}
