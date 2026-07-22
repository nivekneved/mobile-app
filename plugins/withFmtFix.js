let withDangerousMod;
try {
  withDangerousMod = require('@expo/config-plugins').withDangerousMod;
} catch (e) {
  // Fallback if @expo/config-plugins is missing or running in bundled environment
  withDangerousMod = (config) => config;
}
const fs = require('fs');
const path = require('path');

const withFmtFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Locate the post_install block and check if the fix is already injected
      if (podfileContent.includes('post_install do |installer|') && !podfileContent.includes("header_file")) {
        const fmtOverride = `
    # Force disable consteval in all fmt header files in the sandbox
    Dir.glob(File.join(installer.sandbox.root, 'fmt', '**', '*.h')).each do |header_file|
      if File.exist?(header_file)
        content = File.read(header_file)
        if content.include?('FMT_USE_CONSTEVAL')
          content = content.gsub(/#\\s*define\\s+FMT_USE_CONSTEVAL\\s+1/, '#define FMT_USE_CONSTEVAL 0')
          content = content.gsub(/#\\s*define\\s+FMT_USE_CONSTEVAL\\s+c\\+\\+20/, '#define FMT_USE_CONSTEVAL 0')
          File.write(header_file, content)
        end
      end
    end

    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Ensure the specific 'fmt' pod target uses C++17
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
