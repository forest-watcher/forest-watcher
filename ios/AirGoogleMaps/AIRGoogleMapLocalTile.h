//
//  AIRGoogleMapLocalTile.h
//  Created by j8seangel on 4/08/17.
//

#import <Foundation/Foundation.h>
#import <GoogleMaps/GoogleMaps.h>

@interface AIRGoogleMapLocalTile : UIView

@property (nonatomic, strong) GMSTileLayer *tileLayer;
@property (nonatomic, assign) NSString *localTemplate;
@property (nonatomic, assign) int zIndex;

@end
