//
//  AIRGoogleMapURLTile.m
//  Created by Nick Italiano on 11/5/16.
//

#import "AIRGoogleMapUrlTile.h"

<<<<<<< Updated upstream
=======
@interface TestTileLayer : GMSSyncTileLayer
@property NSString* urlTemplate;
@end

@implementation TestTileLayer

- (id)init:(NSString *)urlTemplate {
  _urlTemplate = urlTemplate;
  return self;
}

- (NSString *)applicationDocumentsDirectory {
  return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
}

- (UIImage *)tileForX:(NSUInteger)x y:(NSUInteger)y zoom:(NSUInteger)zoom {
  NSString *url = _urlTemplate;
  url = [url stringByReplacingOccurrencesOfString:@"{x}" withString:[NSString stringWithFormat: @"%ld", (long)x]];
  url = [url stringByReplacingOccurrencesOfString:@"{y}" withString:[NSString stringWithFormat: @"%ld", (long)y]];
  url = [url stringByReplacingOccurrencesOfString:@"{z}" withString:[NSString stringWithFormat: @"%ld", (long)zoom]];
  
  NSString *urlPng = [NSString stringWithFormat: @"%@.png", url];
  NSString *imagePath=[[self applicationDocumentsDirectory] stringByAppendingPathComponent: urlPng];
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  BOOL isFileExist = [fileManager fileExistsAtPath: imagePath];
  if (isFileExist) {
    NSData *imgData = [[NSData alloc] initWithContentsOfURL:[NSURL fileURLWithPath:imagePath]];
    UIImage *thumbNail = [[UIImage alloc] initWithData:imgData];
    return thumbNail;
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

>>>>>>> Stashed changes
@implementation AIRGoogleMapUrlTile

- (void)setZIndex:(int)zIndex
{
  _zIndex = zIndex;
  _tileLayer.zIndex = zIndex;
}

- (void)setUrlTemplate:(NSString *)urlTemplate
{
<<<<<<< Updated upstream
  _urlTemplate = urlTemplate;
  _tileLayer = [GMSURLTileLayer tileLayerWithURLConstructor:[self _getTileURLConstructor]];
}

- (GMSTileURLConstructor)_getTileURLConstructor
{
  NSString *urlTemplate = self.urlTemplate;
  GMSTileURLConstructor urls = ^(NSUInteger x, NSUInteger y, NSUInteger zoom) {
    NSString *url = urlTemplate;
    url = [url stringByReplacingOccurrencesOfString:@"{x}" withString:[NSString stringWithFormat: @"%ld", (long)x]];
    url = [url stringByReplacingOccurrencesOfString:@"{y}" withString:[NSString stringWithFormat: @"%ld", (long)y]];
    url = [url stringByReplacingOccurrencesOfString:@"{z}" withString:[NSString stringWithFormat: @"%ld", (long)zoom]];
    return [NSURL URLWithString:url];
  };
  return urls;
}
@end
=======
  @try {
    _urlTemplate = urlTemplate;
    _tileLayer = [[TestTileLayer alloc] init:_urlTemplate];
  }
  @catch (NSException *exception) {
    NSLog(@"%@", exception.reason);
  }
  @finally {
    NSLog(@"TRRYYYYYYYYY");
  }
}

@end

>>>>>>> Stashed changes
