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
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
`;

      if (!podfile.includes('Workaround for fmt consteval errors')) {
        podfile = podfile.replace(/post_install do \|installer\|/, `post_install do |installer|${patch}`);
        fs.writeFileSync(podfilePath, podfile);
      }
      return config;
    },
  ]);
};
