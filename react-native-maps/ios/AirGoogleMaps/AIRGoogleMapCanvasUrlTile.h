//
//  AIRGoogleMapCanvasUrlTile.h
//  ForestWatcher
//
//  Created by Gerardo Pacheco on 21/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <GoogleMaps/GoogleMaps.h>

@interface AIRGoogleMapCanvasUrlTile : GMSTileLayer

@property (nonatomic, strong) GMSURLTileLayer *tileLayer;
@property (nonatomic, assign) NSString *urlTemplate;

@end
