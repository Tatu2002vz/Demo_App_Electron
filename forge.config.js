const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
  packagerConfig: {
    asar: true,
    icon: "assets/img/icon",
    name: "Demo Worker Application",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        setupIcon: 'assets/img/icon.ico',
        iconUrl: 'https://cms.x-or.cloud/uploads/icon_2f1403c422.ico'
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: "assets/img/icon.png",
        }
      },
    },
    {
      // Path to the icon to use for the app in the DMG window
      name: '@electron-forge/maker-dmg',
      config: {
        icon: 'assets/img/icon.icns'
      }
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        icon: 'assets/img/icon.ico'
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        icon: 'assets/img/icon.ico'
      },
    },
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {
    //     certificateFile: './cert.pfx',
    //     certificatePassword: process.env.CERTIFICATE_PASSWORD
    //   }
    // }
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
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
