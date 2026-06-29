const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFmtFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      const patch = `
# Workaround for fmt consteval errors with Xcode 16+ / Xcode 26+
post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
end
`;

      if (!podfile.includes('Workaround for fmt consteval errors')) {
        console.log('[withFmtFix] Appending C++17 build setting patch to the end of the Podfile...');
        podfile += '\n' + patch;
        fs.writeFileSync(podfilePath, podfile);
        console.log('[withFmtFix] Podfile successfully updated.');
      } else {
        console.log('[withFmtFix] Podfile already contains the fmt patch.');
      }
      return config;
    },
  ]);
};
