const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withFmtFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Locate the post_install block and check if the fix is already injected
      if (podfileContent.includes('post_install do |installer|') && !podfileContent.includes("target.name == 'fmt'")) {
        const fmtOverride = `
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end
`;
        // Inject right after post_install definition
        podfileContent = podfileContent.replace(
          'post_install do |installer|',
          `post_install do |installer|\n${fmtOverride}`
        );
        fs.writeFileSync(podfilePath, podfileContent);
      }
      return config;
    },
  ]);
};

module.exports = withFmtFix;
