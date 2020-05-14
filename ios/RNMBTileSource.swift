//
//  RNMBTileSource.swift
//  ForestWatcher
//
//  Created by Ryan Bourne on 14/05/2020.
//  Copyright © 2020 3 SIDED CUBE. All rights reserved.
//

import Foundation
import SQLite
import UIKit

public struct RNMBTileMetadata {
  let minZoomLevel: Int
  let maxZoomLevel: Int
  let isVector: Bool
  let tms: Bool
  let tileSize: Int
  let attribution: String?
  let layersJson: String?
}

// MARK: MbtilesSource
enum MBTilesSourceError: Error {
  case CouldNotReadFileError
  case UnknownFormatError
  case UnsupportedFormatError
}

/// Defines a MBTileSource object, which is used by the tileserver to query for given tile indexes.
@objc public class RNMBTileSource: NSObject {
  
  // MBTiles spec, including details about vector tiles:
  // https://github.com/mapbox/mbtiles-spec/
  
  /// Defines the raster formats the app is supporting.
  static let validRasterFormats = ["jpg", "png"]
  
  /// Defines the vector formats the app is supporting.
  static let validVectorFormats = ["pbf", "mvt"]
  
  /// The basemap's unique identifier. When filtering requests, we use this to ensure the request is for this basemap.
  var id: String
  var filePath: String
  var metadata: RNMBTileMetadata?
  
  private var database: Connection?
  
  /// Initialises a source object with the given path and identifier.
  /// - Parameters:
  ///   - id: The basemap's unique identifier.
  ///   - filePath: The basemap's filepath on disk.
  /// - Throws: An error if the provided inputs do not result in a valid database connection, or if the provided basemap is invalid.
  public init(id: String, filePath: String) throws {
    self.id = id
    self.filePath = filePath
    
    super.init()
    
    database = try Connection(filePath, readonly: true)
    
    guard let anyTile = try database?.scalar("SELECT tile_data FROM tiles LIMIT 1") as? Blob else {
      throw MBTilesSourceError.CouldNotReadFileError
    }
    
    let tileData = Data(anyTile.bytes)
    
    let minZoom = Int(getMetadata(fieldName: "minzoom") ?? "0")
    let maxZoom = Int(getMetadata(fieldName: "maxzoom") ?? "0")
    
    // https://stackoverflow.com/a/42104538
    let headerData = [UInt8](tileData)[0]
    let format = getFormat(for: headerData)
    let isVector = try isVectorFormat(basedOn: format)
    
    let tileSize = getTileSize(basedOn: tileData)
    let attribution = getMetadata(fieldName: "attribution")
    let layersJson = getMetadata(fieldName: "json")
    
    metadata = RNMBTileMetadata(minZoomLevel: minZoom ?? 0, maxZoomLevel: maxZoom ?? 0, isVector: isVector, tms: true, tileSize: tileSize, attribution: attribution, layersJson: layersJson)
  }
  
  /// Determines the format of the basemap files.
  /// - Parameter headerData: The first data byte from a tile object.
  /// - Returns: The format of the basemap tile.
  private func getFormat(for headerData: UInt8) -> String? {
    if headerData == 0x89 {
      return "png"
    } else if headerData == 0xFF {
      return "jpg"
    } else {
      return getMetadata(fieldName: "format")
    }
  }
  
  /// Determines if the basemap uses vector or raster tiles. We use this in the basemap metadata, to tell the JS layer how to render the given tiles.
  /// - Parameter format: The pre-determined basemap format.
  /// - Throws: An error if the format is not provided, or if the format is not recognised.
  /// - Returns: If the basemap tiles are vector-based or rasterised.
  private func isVectorFormat(basedOn format: String?) throws -> Bool {
    guard let format = format else {
      throw MBTilesSourceError.UnknownFormatError
    }
    
    if RNMBTileSource.validRasterFormats.contains(format) {
      return false
    } else if RNMBTileSource.validVectorFormats.contains(format) {
      return true
    } else {
      throw MBTilesSourceError.UnsupportedFormatError
    }
  }
  
  /// Gets the basemap tile size.
  /// - Parameter tileData: A basemap tile.
  /// - Returns: The size of the tile (presuming both width & height to match).
  private func getTileSize(basedOn tileData: Data) -> Int {
    guard let tileImage = UIImage(data: tileData) else {
      return 0
    }
    
    let screenScale = UIScreen.main.scale > 1 ? 2 : 1
    return Int(tileImage.size.height / CGFloat(screenScale))
  }
  
  private func getMetadata(fieldName: String) -> String? {
    let query = "SELECT value FROM metadata WHERE name=\"\(fieldName)\""
    if let binding = try? database?.scalar(query) {
      return binding as? String
    }
    return nil
  }
  
  public func getTile(x: Int, y: Int, z: Int) -> Data? {
    let query = "SELECT tile_data FROM tiles WHERE tile_column=\(x) AND tile_row=\(y) AND zoom_level=\(z)"
    if let binding = try? database?.scalar(query),
      let blob = binding as? Blob {
      return Data(blob.bytes)
    }
    return nil
  }
}
