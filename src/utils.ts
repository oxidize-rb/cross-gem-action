import {HttpClient} from '@actions/http-client'

const http = new HttpClient('cross-gem-action')

let RUBY_TO_RUST: Record<string, string>

export async function fetchRubyToRustMapping(): Promise<typeof RUBY_TO_RUST> {
  if (RUBY_TO_RUST) {
    return RUBY_TO_RUST
  }

  const res = await http.get(
    'https://raw.githubusercontent.com/oxidize-rb/rb-sys/main/data/derived/ruby-to-rust.json'
  )
  const body = await res.readBody()
  const json = JSON.parse(body)

  RUBY_TO_RUST = json

  return json
}

export async function fetchValidPlatforms(): Promise<string[]> {
  const mappings = await fetchRubyToRustMapping()

  return Object.keys(mappings)
}

export function parseEnvString(env: string): {[k: string]: string} {
  const result: {[k: string]: string} = {}

  for (const line of env.split('\n')) {
    const [key, value] = line.split('=', 2)

    if (key && value && key.match(/^[a-zA-Z0-9_]+$/)) {
      const quoteRemoved = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '')
      result[key] = quoteRemoved
    }
  }

  return result
}

export function shellEscape(
  arg: string | null | undefined,
  quoted = false
): string {
  if (arg == null) {
    return ''
  }
  // eslint-disable-next-line no-control-regex
  let result = arg.replace(/[\0\u0008\u001B\u009B]/gu, '')

  if (quoted) {
    result = result.replace(/'/gu, `'\\''`)
  }

  result = result.replace(/\r(?!\n)/gu, '')

  return result
}
