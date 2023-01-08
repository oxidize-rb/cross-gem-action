# Cross Gem Action

![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)
[![Join the discussion](https://img.shields.io/badge/slack-chat-blue.svg)](https://join.slack.com/t/oxidize-rb/shared_invite/zt-16zv5tqte-Vi7WfzxCesdo2TqF_RYBCw)
![Continuous integration](https://github.com/oxidize-rb/cross-gem-action/workflows/build-test/badge.svg)

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
      matrix:
        platform:
          - x86_64-linux
          - x86_64-linux-musl
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

      - uses: oxidize-rb/cross-gem-action@v7
        with:
          platform: ${{ matrix.platform }}
          version: 'latest' # optional
          ruby-versions: '3.1, 3.0, 2.7' # optional
          setup: | # optional
            echo "Do something custom before compiling..."
          env: | # optional
            SOME_OTHER_ENV=some_value

      - uses: actions/download-artifact@v3
        with:
          name: cross-gem
          path: pkg/

      - name: Display structure of built gems
        run: ls -R
        working-directory: pkg/
```

## Inputs

| Name            | Required | Description                             | Type   | Default                             |
| --------------- | :------: | --------------------------------------- | ------ | ----------------------------------- |
| `platform`      |   Yes    | Target Ruby platform                    | string |                                     |
| `ruby-versions` |          | Ruby versions to build for              | string | `3.2, 3.1, 3.0, 2.7, 2.6, 2.5, 2.4, 2.3` |
| `directory`     |          | Directory of the Rakefile               | string |                                     |
| `env`           |          | Extra env to set in the container       | string |                                     |
| `setup`         |          | Custom setup script for the container   | string |                                     |
| `artifact-name` |          | Name of the uploaded artifact           | string | `cross-gem`                         |
| `version`       |          | Version tag for the docker image to use | string | latest rb-sys version               |

## License

This Action is distributed under the terms of the MIT license, see [LICENSE](https://github.com/oxidize-rb/cross-gem-action/blob/master/LICENSE) for details.
