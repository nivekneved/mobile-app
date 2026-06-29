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
        const regex = /post_install\s+do\s*\|\s*installer\s*\|/;
        if (regex.test(podfile)) {
          console.log('[withFmtFix] Found post_install block. Patching with C++17 standard for the fmt library...');
          podfile = podfile.replace(regex, `post_install do |installer|${patch}`);
          fs.writeFileSync(podfilePath, podfile);
          console.log('[withFmtFix] Podfile successfully patched.');
        } else {
          console.warn('[withFmtFix] WARNING: Could not find post_install block in Podfile! Appending block at the end.');
          podfile += `
post_install do |installer|
${patch}
end
`;
          fs.writeFileSync(podfilePath, podfile);
        }
      } else {
        console.log('[withFmtFix] Podfile already contains fmt patch.');
      }
      return config;
    },
  ]);
};
