
#include <napi.h>

typedef void (*InstallCallback)(const std::string reason,
                                const std::string identifier,
                                const long result);

extern void setInstallCallback(InstallCallback func);
extern int installExtension(const std::string ident);
extern void setDebug(bool debug);
