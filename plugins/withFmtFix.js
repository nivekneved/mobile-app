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
      if (podfileContent.includes('post_install do |installer|') && !podfileContent.includes("FMT_USE_CONSTEVAL=0")) {
        const fmtOverride = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
        
        # Also ensure the specific 'fmt' pod target uses C++17
        if target.name == 'fmt'
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
