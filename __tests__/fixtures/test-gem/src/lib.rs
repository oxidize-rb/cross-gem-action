use rb_sys::rb_define_module;
use std::ffi::CString;

#[allow(non_snake_case)]
#[no_mangle]
extern "C" fn Init_test_gem_ext() {
    let name = CString::new("TestGem").unwrap();
    unsafe { rb_define_module(name.as_ptr()) };
}
