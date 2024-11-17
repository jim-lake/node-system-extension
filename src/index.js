const addon = require('../build/Release/node_system_extension.node');

module.exports = {
  ...addon,
  OSSystemExtensionErrorUnknown: 1,
  OSSystemExtensionErrorMissingEntitlement: 2,
  OSSystemExtensionErrorUnsupportedParentBundleLocation: 3,
  OSSystemExtensionErrorExtensionNotFound: 4,
  OSSystemExtensionErrorExtensionMissingIdentifier: 5,
  OSSystemExtensionErrorDuplicateExtensionIdentifer: 6,
  OSSystemExtensionErrorUnknownExtensionCategory: 7,
  OSSystemExtensionErrorCodeSignatureInvalid: 8,
  OSSystemExtensionErrorValidationFailed: 9,
  OSSystemExtensionErrorForbiddenBySystemPolicy: 10,
  OSSystemExtensionErrorRequestCanceled: 11,
  OSSystemExtensionErrorRequestSuperseded: 12,
  OSSystemExtensionErrorAuthorizationRequired: 13,
};
