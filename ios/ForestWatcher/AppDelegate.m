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
#if __has_include(<React/RNSentry.h>)
#import <React/RNSentry.h> // This is used for versions of react >= 0.40
#else
#import "RNSentry.h" // This is used for versions of react < 0.40
#endif
#import <ReactNativeNavigation/ReactNativeNavigation.h>
#import "ReactNativeConfig.h"
#import <FBSDKCoreKit/FBSDKCoreKit.h>

@import GoogleMaps;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
  
  // Google Maps API Key
  NSString *apiUrl = [ReactNativeConfig envFor:@"GOOGLE_MAPS_API_KEY"];
  
  // Firebase Config
  [GMSServices provideAPIKey:apiUrl];
  [FIRApp configure];
  
  // Setting the window bounds / colour.
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  
  // Launching the React Native JS app! ✨
  NSURL *jsCodeLocation = [self sourceURL];
  [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];
  
  [RNSentry installWithRootView:[ReactNativeNavigation getBridge]];
  
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

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
  BOOL handled = [[FBSDKApplicationDelegate sharedInstance] application:application
                                                                openURL:url
                                                      sourceApplication:sourceApplication
                                                             annotation:annotation
                  ];
  // Add any custom logic here.
  if ([_currentAuthorizationFlow resumeAuthorizationFlowWithURL:url]) {
    _currentAuthorizationFlow = nil;
    return YES;
  }
  return handled;
}

@end
