require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-mbtiles"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = package["description"]
  s.homepage     = "https://github.com/github_account/react-native-mbtiles"
  s.license      = "Proprietary"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Ryan Bourne" => "ryan@peslostudios.com" }
  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/github_account/react-native-mbtiles.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true
  s.static_framework = true # Allows Swift to work nicely.

  s.dependency "React"
  s.dependency "GCDWebServer", "~> 3.0" # Provides offline localhost networking
  s.dependency "GzipSwift", "5.1.1" # Allows for unzipping zipped tiles
  s.dependency 'SQLite.swift', '~> 0.12.0' # Provides access to .mbtiles archives
end

