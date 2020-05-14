/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "AppAuth.h"
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <ReactNativeNavigation/ReactNativeNavigation.h>
#import "ReactNativeConfig.h"
#import <FBSDKCoreKit/FBSDKCoreKit.h>

#import "ForestWatcher-Swift.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *path = [documentsDirectory stringByAppendingString:@"/tiles/basemap/b7fd0441-8cea-4fc2-bea9-be59da4eeb7f/0x0x0/b7fd0441-8cea-4fc2-bea9-be59da4eeb7f.mbtiles"];
  
  // Note: Eventually, this will sit within the JS layer - on entering the map screen / selecting a new imported basemap we will prepare the selected basemap.
  // We'll then start up the server on a given port, and then close the server on leaving the map screen / the app going into background.
  // But until we have a module, we have this instead 👀
  // To test this, you'll need to:
  //  - Import a basemap (specifically with raster tiles for now!).
  //  - Intercept the basemaps's unique identifier.
  //  - Change the identifier in the path above, and below these comments.
  //  - Change the identifier in the map screen URL.
  [[RNMBTileServer shared] prepareWithBasemapId:@"b7fd0441-8cea-4fc2-bea9-be59da4eeb7f" basemapPath:path];
  [[RNMBTileServer shared] startServerWithPort:54321];
  
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
  
  // Google Maps API Key
  NSString *apiUrl = [ReactNativeConfig envFor:@"GOOGLE_MAPS_API_KEY"];
  
  // Firebase Config
  [FIRApp configure];
  
  // Setting the window bounds / colour.
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  
  // Launching the React Native JS app! ✨
  NSURL *jsCodeLocation = [self sourceURL];
  [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];
  
  return YES;
}

- (NSURL *)sourceURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<NSString *, id> *) options {
  BOOL handled = [[FBSDKApplicationDelegate sharedInstance]application:app openURL:url options:options];

  // Add any custom logic here.
  if ([self.authorizationFlowManagerDelegate resumeExternalUserAgentFlowWithURL:url]) {
    return YES;
  }
  
  return handled;
}

#if RCT_DEV
- (BOOL)bridge:(RCTBridge *)bridge didNotFindModule:(NSString *)moduleName {
  return YES;
}
#endif

@end
