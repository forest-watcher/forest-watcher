//
//  AIRGoogleMapCanvasUrlTile.m
//  ForestWatcher
//
//  Created by Gerardo Pacheco on 21/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "AIRGoogleMapCanvasUrlTile.h"
#import <math.h>

@implementation AIRGoogleMapCanvasUrlTile

- (void)requestTileForX:(NSUInteger)x y:(NSUInteger)y zoom:(NSUInteger)zoom receiver:(id<GMSTileReceiver>)receiver {

  int maxZoom = 12;
  NSUInteger xCord = x;
  NSUInteger yCord = y;
  NSUInteger zoomCord = zoom;
  
  if (zoom > maxZoom) {
    xCord = (int)(x / (pow(2, zoom - maxZoom)));
    yCord = (int)(y / (pow(2, zoom - maxZoom)));
    zoomCord = maxZoom;
  }
  
  NSString *url = @"http://wri-tiles.s3.amazonaws.com/glad_prod/tiles/{z}/{x}/{y}.png";
  url = [url stringByReplacingOccurrencesOfString:@"{x}" withString:[NSString stringWithFormat: @"%ld", (long)xCord]];
  url = [url stringByReplacingOccurrencesOfString:@"{y}" withString:[NSString stringWithFormat: @"%ld", (long)yCord]];
  url = [url stringByReplacingOccurrencesOfString:@"{z}" withString:[NSString stringWithFormat: @"%ld", (long)zoomCord]];
  
  dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0ul);
  dispatch_async(queue, ^{
    NSData * imgData = [NSData dataWithContentsOfURL:[NSURL URLWithString:url]];
    dispatch_async(dispatch_get_main_queue(), ^{
      
      UIImage *blank =[UIImage imageWithData:imgData];
      
      CGContextRef ctx;
      CGImageRef imageRef = [blank CGImage];
      if (imageRef != NULL) {
        NSUInteger width = CGImageGetWidth(imageRef);
        NSUInteger height = CGImageGetHeight(imageRef);
        
        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        unsigned char *rawData = malloc(height * width * 4);
        NSUInteger bytesPerPixel = 4;
        NSUInteger bytesPerRow = bytesPerPixel * width;
        NSUInteger bitsPerComponent = 8;
        CGContextRef context = CGBitmapContextCreate(rawData, width, height,
                                                     bitsPerComponent, bytesPerRow, colorSpace,
                                                     kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
        CGColorSpaceRelease(colorSpace);
        
        NSUInteger srcX = 0;
        NSUInteger srcY = 0;
        NSUInteger srcW = width;
        NSUInteger srcH = height;
        NSUInteger zsteps = zoom - maxZoom;
        
        if (zoom > maxZoom) {
          srcX = (256 / pow(2, zsteps) * (fmod(x, pow(2, zsteps))));
          srcY = (256 / pow(2, zsteps) * (fmod(y, pow(2, zsteps))));
          srcW = (256 / pow(2, zsteps));
          srcH = (256 / pow(2, zsteps));
        }
        
        CGRect cropRect = CGRectMake(srcX, srcY, srcW, srcH);
        CGImageRef imageRef2 = CGImageCreateWithImageInRect([blank CGImage], cropRect);
        
        CGContextDrawImage(context, CGRectMake(0, 0, 256, 256), imageRef2);
        CGImageRelease(imageRef2);
        CGContextRelease(context);
        
        NSUInteger byteIndex = (bytesPerRow * 0) + 0 * bytesPerPixel;
        
        for (int ii = 0 ; ii < width * height; ++ii) {
          int day = rawData[byteIndex] * 255 + rawData[byteIndex+1];
          
          if (day > 0 ) {
            rawData[byteIndex] = 220;
            rawData[byteIndex+1] = 102;
            rawData[byteIndex+2] = 153;
          } else {
            rawData[byteIndex+3] = 0;
          }
          
          byteIndex += 4;
        }
        
        ctx = CGBitmapContextCreate(rawData,
                                    CGImageGetWidth( imageRef ),
                                    CGImageGetHeight( imageRef ),
                                    8,
                                    CGImageGetBytesPerRow( imageRef ),
                                    CGImageGetColorSpace( imageRef ),
                                    kCGImageAlphaPremultipliedLast );
        
        imageRef = CGBitmapContextCreateImage (ctx);
        UIImage* rawImage = [UIImage imageWithCGImage:imageRef];
        
        CGContextRelease(ctx);
        free(rawData);
        
        [receiver receiveTileWithX:x y:y zoom:zoom image:rawImage];
      } else {
        [receiver receiveTileWithX:x y:y zoom:zoom image:kGMSTileLayerNoTile];
      }
    });
  });

}
@end

