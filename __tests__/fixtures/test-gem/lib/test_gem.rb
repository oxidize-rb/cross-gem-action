begin
  RUBY_VERSION =~ /(\d+\.\d+)/
  require "#{$1}/test_gem_ext"
rescue LoadError
  require "test_gem_ext"
end
