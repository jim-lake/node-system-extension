#import "InstallController.h"
#import <SystemExtensions/SystemExtensions.h>

@interface InstallController : NSObject <OSSystemExtensionRequestDelegate>

@property(strong) OSSystemExtensionRequest *currentRequest;

- (int)installExtension:(NSString *)identifier;

@end

static InstallController *g_installController = nil;
static InstallCallback g_pInstallCallback = NULL;
static BOOL g_debug = false;

void DebugLog(NSString *format, ...) {
  if (g_debug) {
    va_list args;
    va_start(args, format);
    NSLogv(format, args);
    va_end(args);
  }
}
void setDebug(bool debug) {
  DebugLog(@"setDebug: changing debug to: %d", debug);
  g_debug = debug;
  DebugLog(@"setDebug: changed debug to: %d", debug);
}
void setInstallCallback(InstallCallback func) { g_pInstallCallback = func; };
int installExtension(const std::string ident) {
  DebugLog(@"installExtension: Installing extension with ident: %s",
           ident.c_str());
  if (g_installController == nil) {
    DebugLog(
        @"installExtension: Creating install controller for the first time");
    g_installController = [[InstallController alloc] init];
  }
  NSString *identifier =
      [NSString stringWithCString:ident.c_str()
                         encoding:[NSString defaultCStringEncoding]];
  return [g_installController installExtension:identifier];
}

@implementation InstallController

- (int)installExtension:(NSString *)identifier {
  int ret = 0;
  if (self.currentRequest) {
    DebugLog(@"InstallController: Already running an install request");
    ret = -1;
  } else {
    DebugLog(@"InstallController: install the extension %@", identifier);

    OSSystemExtensionRequest *req = [OSSystemExtensionRequest
        activationRequestForExtension:identifier
                                queue:dispatch_get_main_queue()];
    req.delegate = (id<OSSystemExtensionRequestDelegate>)self;

    [[OSSystemExtensionManager sharedManager] submitRequest:req];
    self.currentRequest = req;
  }
  return ret;
}

- (OSSystemExtensionReplacementAction)
                        request:(OSSystemExtensionRequest OS_UNUSED *)request
    actionForReplacingExtension:(OSSystemExtensionProperties *)existing
                  withExtension:(OSSystemExtensionProperties *)extension {
  DebugLog(@"InstallController: Got the upgrade request (%@ -> %@); answering "
           @"replace.",
           existing.bundleVersion, extension.bundleVersion);
  return OSSystemExtensionReplacementActionReplace;
}

- (void)requestNeedsUserApproval:(OSSystemExtensionRequest *)request {
  if (request != self.currentRequest) {
    DebugLog(@"InstallController: UNEXPECTED NON-CURRENT Request to activate "
             @"%@ succeeded.",
             request.identifier);
    return;
  }
  DebugLog(@"InstallController: Request to activate %@ awaiting approval.",
           request.identifier);
  if (g_pInstallCallback != NULL) {
    g_pInstallCallback("need_user_approval",
                       std::string([request.identifier UTF8String]), 0);
  }
}

- (void)request:(OSSystemExtensionRequest *)request
    didFinishWithResult:(OSSystemExtensionRequestResult)result {
  if (request != self.currentRequest) {
    DebugLog(@"InstallController: UNEXPECTED NON-CURRENT Request to activate "
             @"%@ succeeded.",
             request.identifier);
    return;
  }
  DebugLog(@"InstallController: Request to activate %@ succeeded (%zu).",
           request.identifier, (unsigned long)result);
  if (g_pInstallCallback != NULL) {
    g_pInstallCallback("result", std::string([request.identifier UTF8String]),
                       result);
  }
  self.currentRequest = nil;
}

- (void)request:(OSSystemExtensionRequest *)request
    didFailWithError:(NSError *)error {
  if (request != self.currentRequest) {
    DebugLog(@"InstallController: UNEXPECTED NON-CURRENT Request to activate "
             @"%@ failed with error %@.",
             request.identifier, error);
    return;
  }
  DebugLog(@"InstallController: Request to activate %@ failed with error %@.",
           request.identifier, error);
  if (g_pInstallCallback != NULL) {
    g_pInstallCallback("error", std::string([request.identifier UTF8String]),
                       [error code]);
  }
  self.currentRequest = nil;
}
- (void)request:(OSSystemExtensionRequest *)request
    foundProperties:(NSArray<OSSystemExtensionProperties *> *)properties {
  DebugLog(@"InstallController: Request found properties");
}

@end
