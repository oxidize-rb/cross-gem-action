# Cross Gem Action

![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)
[![Join the discussion](https://img.shields.io/badge/slack-chat-blue.svg)](https://join.slack.com/t/oxidize-rb/shared_invite/zt-16zv5tqte-Vi7WfzxCesdo2TqF_RYBCw)
![Continuous integration](https://github.com/oxidize-rb/cross-gem-action/workflows/build-test/badge.svg)
![Dependabot enabled](https://api.dependabot.com/badges/status?host=github&repo=oxidize-rb/cross-gem-action)

This action makes it easy to compile and package native Rubygems that are written in Rust. Under the hood, it uses a customized version [`rake-compiler-dock`](https://github.com/rake-compiler/rake-compiler-dock) to compile a gem, and is meant to be used in tandem with [`rb-sys`](https://github.com/oxidize-rb/rb-sys).

**Table of Contents**

- [Example workflow](#example-workflow)
- [Inputs](#inputs)
- [License](#license)

## Example workflow

```yaml
# Adjust this based on your release workflow
on:
  workflow_dispatch:

jobs:
  native_gem:
    name: Compile native gem
    runs-on: ubuntu-latest
    strategy:
      platform:
        - x86_64-linux
        - aarch64-linux
        - arm-linux
        - x86_64-darwin
        - arm64-darwin
        - x64-mingw32
        - x64-mingw-ucrt
    steps:
      - uses: actions/checkout@v2

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true

      - uses: oxidize-rb/cross-gem@v1
        with:
          platform: ${{ matrix.platform }}
          env: | # optional
            RUBY_CC_VERSION=3.1.0:3.0.0:2.7.0
            SOME_OTHER_ENV=some_value
```

## Inputs

| Name        | Required | Description                       | Type   | Default |
| ----------- | :------: | --------------------------------- | ------ | ------- |
| `platform`  |          | Target Ruby platform              | string |         |
| `directory` |          | Directory of the Rakefile         | string |         |
| `env`       |          | Extra env to set in the container | string |         |

## License

This Action is distributed under the terms of the MIT license, see [LICENSE](https://github.com/oxidize-rb/cross-gem-action/blob/master/LICENSE) for details.
