$LOAD_PATH.unshift(File.join(ENV["GITHUB_WORKSPACE"], "gem", "lib")) if ENV["GITHUB_WORKSPACE"]

require "mkmf"
require "rb_sys/mkmf"

create_rust_makefile("test_gem_ext")
