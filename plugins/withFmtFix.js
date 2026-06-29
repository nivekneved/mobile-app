const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFmtFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      if (!podfile.includes('Workaround for fmt consteval errors')) {
        const regex = /react_native_post_install\([\s\S]*?\)/;
        if (regex.test(podfile)) {
          console.log('[withFmtFix] Found react_native_post_install call. Injecting C++17 patch after it...');
          
          const patch = `

  # Workaround for fmt consteval errors with Xcode 16+ / Xcode 26+
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
`;

          podfile = podfile.replace(regex, (match) => match + patch);
          fs.writeFileSync(podfilePath, podfile);
          console.log('[withFmtFix] Podfile successfully patched.');
        } else {
          console.warn('[withFmtFix] WARNING: Could not find react_native_post_install in Podfile!');
        }
      } else {
        console.log('[withFmtFix] Podfile already contains the fmt patch.');
      }
      return config;
    },
  ]);
};
