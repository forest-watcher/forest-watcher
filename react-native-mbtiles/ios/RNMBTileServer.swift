//
//  RNMBTileServer.swift
//  ForestWatcher
//
//  Created by Ryan Bourne on 14/05/2020.
//  Copyright © 2020 3 SIDED CUBE. All rights reserved.
//

import Foundation
import Gzip
import UIKit

// Based on https://gist.github.com/namannik/3b7c8b69c2d0768d0c2b48d2ed5ff71c.

/// Defines an interface for running a tile server locally.
@objc public class RNMBTileServer: NSObject {
  
  /// Defines a singleton instance, that the soon-to-be-added objc bridge will interact with.
  @objc public static let shared = RNMBTileServer()
  
  /// The currently active tile source. This must be set otherwise requests will fail.
  private var source: RNMBTileSource?
  
  /// The currently active server.
  private var server: GCDWebServer?
  
  /// Generates a basemap source, given a path and identifier from the objc bridge.
  /// - Parameters:
  ///   - basemapId: The basemap's unique identifier. This is used to determine if the requested tiles are for the active source.
  ///   - basemapPath: The basemap's path on disk. This is used to open a database connection to the given file.
  @objc public func prepare(basemapId: String, basemapPath: String) -> RNMBTileMetadata? {
    do {
      source = try RNMBTileSource(id: basemapId, filePath: basemapPath)
      return source?.metadata
    } catch {
      // TODO: Pass this error to JS
      return nil
    }
  }
  
  /// Starts the server at the given port number.
  /// - Parameter port: The chosen port number.
  /// TODO: Move the port number into a constant, that JS can also see.
  @objc public func startServer(port: UInt) {
    guard Thread.isMainThread else {
      DispatchQueue.main.sync { [weak self] in
        self?.startServer(port: port)
      }
      return
    }
    
    if server == nil {
      server = GCDWebServer()
    }
    
    guard server?.isRunning == false else {
      return
    }
    
    GCDWebServer.setLogLevel(3)

    server?.addDefaultHandler(forMethod: "GET", request: GCDWebServerRequest.self, processBlock: { [weak self] (request: GCDWebServerRequest) -> GCDWebServerResponse? in
      return self?.handleGetRequest(request)
    })
    server?.start(withPort: port, bonjourName: nil)
  }
  
  /// Stops the active server.
  /// It is recommended to stop the server when it is no longer required in app, or when the app enters background.
  @objc public func stopServer() {
    guard Thread.isMainThread else {
      DispatchQueue.main.sync { [weak self] in
        self?.stopServer()
      }
      return
    }
    
    server?.stop()
    server?.removeAllHandlers()
  }
  
  /// Handles a given request against `http://localhost:<port>` - determining if the request is for us and returns tile data if so.
  /// - Parameter request: A GCDWebServerRequest object, which defines the request path & query.
  /// - Returns: A GCDWebServerDataResponse - either a 404 error or the tile data.
  private func handleGetRequest(_ request: GCDWebServerRequest) -> GCDWebServerResponse? {
    guard let source = source,
      request.path.contains(source.id) else {
        return GCDWebServerResponse(statusCode: 404)
    }
    
    guard let query = request.query,
      let xString = query["x"],
      let yString = query["y"],
      let zString = query["z"],
      let x = Int(xString),
      let y = Int(yString),
      let z = Int(zString),
      let tileData = source.getTile(x: x, y: y, z: z) else {
        return GCDWebServerResponse(statusCode: 404)
    }
    
    // If this is a vector tile, it must be unzipped first.
    if tileData.isGzipped {
      guard let unzippedTile = try? tileData.gunzipped() else {
        return GCDWebServerResponse(statusCode: 404)
      }
      
      return GCDWebServerDataResponse(data: unzippedTile, contentType: "")
    }
    
    return GCDWebServerDataResponse(data: tileData, contentType: "")
  }

  deinit {
    server?.stop()
    server?.removeAllHandlers()
  }
}
