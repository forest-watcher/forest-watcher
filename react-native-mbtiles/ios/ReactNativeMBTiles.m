#import "ReactNativeMBTiles.h"

#import <react_native_mbtiles-Swift.h>
@implementation ReactNativeMBTiles

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(prepare:(nonnull NSString *)basemapId basemapPath:(nonnull NSString *)basemapPath callback:(RCTResponseSenderBlock)callback)
{
  RNMBTileMetadata *metadata = [[RNMBTileServer shared] prepareWithBasemapId:basemapId basemapPath:basemapPath];

  if (!metadata) {
    // TODO: Return a proper error here
    callback(@[true, [NSNull null]]);
    return;
  }
  
  callback(@[[NSNull null], metadata.dictionaryValue]);
}

RCT_EXPORT_METHOD(startServer:(nonnull NSNumber *)port)
{
  [[RNMBTileServer shared] startServerWithPort:[port unsignedIntValue]];
}

RCT_EXPORT_METHOD(stopServer)
{
  [[RNMBTileServer shared] stopServer];
}

@end
