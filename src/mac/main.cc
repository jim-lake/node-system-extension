#include "InstallController.h"
#include <napi.h>

using namespace Napi;

static ThreadSafeFunction g_tsfn = NULL;
static bool g_debug = false;

static struct CallbackParams {
  std::string reason;
  std::string identifier;
  long result;
};
static auto napiCallback = [](Env env, Function cb, CallbackParams *params) {
  cb.Call({String::New(env, params->reason),
           String::New(env, params->identifier),
           Number::New(env, params->result)});

  delete params;
};
static void _installCallback(const std::string reason, const std::string identifier,
                      const long result) {
  printf("_installCallback: %s, %s, %ld\n", reason.c_str(), identifier.c_str(),
         result);
  if (g_tsfn != NULL) {
    const auto param = new CallbackParams();
    param->reason = reason;
    param->identifier = identifier;
    param->result = result;
    const auto status = g_tsfn.BlockingCall(param, napiCallback);
    printf("blocking call result: %d\n", status);
  } else {
    printf("No threadsafefunction available!\n");
  }
}
Value Install(const Napi::CallbackInfo &info) {
  const Napi::Env env = info.Env();
  Value ret = env.Null();

  if (info.Length() < 2) {
    ret = String::New(env, "Expected 2 arguments");
  } else if (!info[0].IsString()) {
    ret = String::New(env, "Expected string arg 0");
  } else if (!info[1].IsFunction()) {
    ret = String::New(env, "Expected function arg 1");
  } else {
    Function cb = info[1].As<Function>();

    g_tsfn =
        ThreadSafeFunction::New(env, cb, "System Extension Callback", 0, 1);

    setInstallCallback(&_installCallback);
    installExtension(info[0].As<String>().Utf8Value());
  }
  return ret;
}
Value SetDebug(const Napi::CallbackInfo &info) {
  const Napi::Env env = info.Env();
  Value ret = env.Null();

  if (info.Length() < 1) {
    ret = String::New(env, "Expected 1 argument");
  } else if (!info[0].IsBoolean()) {
    ret = String::New(env, "Expected bool arg 0");
  } else {
    g_debug = info[0].As<Boolean>();
    setDebug(g_debug);
  }
  return ret;
}
Object Init(Napi::Env env, Object exports) {
  exports.Set("install", Function::New(env, Install));
  exports.Set("setDebug", Function::New(env, SetDebug));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
