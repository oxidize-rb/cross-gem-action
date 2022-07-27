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
