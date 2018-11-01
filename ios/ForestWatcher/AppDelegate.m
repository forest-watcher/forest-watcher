/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <AppCenterReactNativeCrashes/AppCenterReactNativeCrashes.h>
#import <AppCenterReactNative/AppCenterReactNative.h>
#import <CodePush/CodePush.h>
#import "RCCManager.h"
#import "AppAuth.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "ReactNativeConfig.h"
#import <FBSDKCoreKit/FBSDKCoreKit.h>

@import GoogleMaps;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [[FBSDKApplicationDelegate sharedInstance] application:application
                             didFinishLaunchingWithOptions:launchOptions];
    NSURL *jsCodeLocation;

  [AppCenterReactNativeCrashes registerWithAutomaticProcessing];  // Initialize AppCenter crashes

  [AppCenterReactNative register];  // Initialize AppCenter

  // Google Maps API Key
  NSString *apiUrl = [ReactNativeConfig envFor:@"GOOGLE_MAPS_API_KEY_IOS"];

  [GMSServices provideAPIKey:apiUrl];

#ifdef DEBUG
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  jsCodeLocation = [CodePush bundleURL];
#endif

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [[RCCManager sharedInstance] initBridgeWithBundleURL:jsCodeLocation];

  return YES;
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
