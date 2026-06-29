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
        const lastEndIndex = podfile.lastIndexOf('end');
        if (lastEndIndex !== -1) {
          console.log('[withFmtFix] Found closing end keyword of the post_install block. Inserting build setting patch...');
          
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

          podfile = podfile.slice(0, lastEndIndex) + patch + '\n' + podfile.slice(lastEndIndex);
          fs.writeFileSync(podfilePath, podfile);
          console.log('[withFmtFix] Podfile successfully patched.');
        } else {
          console.warn('[withFmtFix] WARNING: Could not find any "end" keyword in Podfile!');
        }
      } else {
        console.log('[withFmtFix] Podfile already contains the fmt patch.');
      }
      return config;
    },
  ]);
};
