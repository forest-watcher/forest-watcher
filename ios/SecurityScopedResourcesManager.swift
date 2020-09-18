//
//  SecurityScopedResourcesManager.swift
//  ForestWatcher
//
//  Created by Simon Mitchell on 20/05/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation

/// A class for managing URLs that we need to start accessing security scoped resources for
/// this class allows us to store the urls so JS code can call back later to relinquish access
/// the access methods must be called on the original URL object so we cannot rely on re-constructing
/// this later!
@objc (FWSecurityScopedResourcesManager)
class SecurityScopedResourcesManager: NSObject {
  
  var accessingResources: [URL] = []
  
  @objc(sharedManager)
  static let shared = SecurityScopedResourcesManager()
  
  @objc func startAccessingSecurityScopedResource(at url: URL) {
    guard url.startAccessingSecurityScopedResource() else {
      return
    }
    //TODO: Add this in when we have a better implementation
//    accessingResources.append(url)
  }
}
