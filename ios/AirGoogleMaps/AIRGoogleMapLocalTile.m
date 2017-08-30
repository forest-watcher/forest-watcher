//
//  AIRGoogleMapLocalTile.m
//  Created by j8seangel on 4/08/17.
//

#import "AIRGoogleMapLocalTile.h"

@interface LocalTileLayer : GMSSyncTileLayer
@property NSString* localTemplate;
@end

@implementation LocalTileLayer

- (id)init:(NSString *)localTemplate {
  _localTemplate = localTemplate;
  return self;
}

- (NSString *)applicationDocumentsDirectory {
  return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
}

- (UIImage *)tileForX:(NSUInteger)x y:(NSUInteger)y zoom:(NSUInteger)zoom {
  NSString *url = _localTemplate;
  url = [url stringByReplacingOccurrencesOfString:@"{x}" withString:[NSString stringWithFormat: @"%ld", (long)x]];
  url = [url stringByReplacingOccurrencesOfString:@"{y}" withString:[NSString stringWithFormat: @"%ld", (long)y]];
  url = [url stringByReplacingOccurrencesOfString:@"{z}" withString:[NSString stringWithFormat: @"%ld", (long)zoom]];

  NSString *urlPng = [NSString stringWithFormat: @"%@.png", url];
  NSString *imagePath=[[self applicationDocumentsDirectory] stringByAppendingPathComponent: urlPng];

  NSFileManager *fileManager = [NSFileManager defaultManager];
  BOOL isFileExist = [fileManager fileExistsAtPath: imagePath];
  if (isFileExist) {
    return [UIImage imageWithContentsOfFile:imagePath];
  } else {
    NSString *urlJpg = [NSString stringWithFormat: @"%@.jpg", url];
    NSString *imagePath=[[self applicationDocumentsDirectory] stringByAppendingPathComponent: urlJpg];
    BOOL isFileExist = [fileManager fileExistsAtPath: imagePath];
    if (isFileExist) {
      return [UIImage imageWithContentsOfFile: imagePath];
    }
  }
  return kGMSTileLayerNoTile;
}

@end

@implementation AIRGoogleMapLocalTile

- (void)setZIndex:(int)zIndex
{
  _zIndex = zIndex;
  _tileLayer.zIndex = zIndex;
}

- (void)setLocalTemplate:(NSString *)localTemplate
{
  _localTemplate = localTemplate;
  _tileLayer = [[LocalTileLayer alloc] init:_localTemplate];
}

@end
