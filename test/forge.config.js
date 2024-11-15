const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require('node:fs');
const { join } = require('node:path');

const { IDENTITY, KEYCHAIN_PROFILE } = process.env;
if (!IDENTITY) {
  throw "need env IDENTITY";
}
if (!KEYCHAIN_PROFILE) {
  throw "need env KEYCHAIN_PROFILE";
}

const EXT = 'lol.harbour.SampleEndpointApp.Extension.systemextension';

module.exports = {
  packagerConfig: {
    name: 'System Extension Tester',
    asar: true,
    appBundleId: 'com.example.systemextension',
    osxSign: {
      identity: IDENTITY,
      provisioningProfile: './example.provisionprofile',
      optionsForFile: (file_path) => {
        const ret = {
          hardenedRuntime: true,
          entitlements: './entitlements.default.plist',
        };
        if (file_path.endsWith('System Extension Tester.app')) {
          ret.entitlements = './entitlements.plist';
        } else if (file_path.endsWith('System Extension Tester Helper (GPU).app')) {
          ret.entitlements = './entitlements.gpu.plist';
        } else if (file_path.endsWith('System Extension Tester Helper (Plugin).app')) {
          ret.entitlements = './entitlements.plugin.plist';
        } else  if (file_path.endsWith('System Extension Tester Helper (Renderer).app')) {
          ret.entitlements = './entitlements.renderer.plist';
        } else if (file_path.endsWith('System Extension Tester Helper.app')) {
          ret.entitlements = './entitlements.helper.plist';
        }
        return ret;
      },
      ignore: (file_path) => {
        console.log("ignore:", file_path, file_path.indexOf('Contents/Library/SystemExtensions') !== -1);
        return file_path.indexOf('Contents/Library/SystemExtensions') !== -1;
      },
    },
    osxNotarize: {
      keychainProfile: KEYCHAIN_PROFILE,
    },
  },
  hooks: {
    packageAfterCopy: (config, build_path) => {
      console.log("packageAfterCopy:", config);
      console.log("build_path:", build_path);
      fs.writeFileSync('/tmp/foo.txt', build_path);
      return new Promise((resolve, reject) => {
        const src = join(__dirname, './extension/', EXT);
        const dest = join(build_path, '../../Library/SystemExtensions/', EXT);
        fs.cpSync(src, dest, { recursive: true });
        console.log("cp:", src, dest);
        resolve();
      });
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
