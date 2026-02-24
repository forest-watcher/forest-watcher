/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <React/RCTLinkingManager.h>
#import "RNAppAuthAuthorizationFlowManager.h"


@interface AppDelegate : RCTAppDelegate <RNAppAuthAuthorizationFlowManager>
@property(nonatomic, weak) id<RNAppAuthAuthorizationFlowManagerDelegate> authorizationFlowManagerDelegate;
@property (nonatomic, strong, null_unspecified) UIWindow *window;

@end
