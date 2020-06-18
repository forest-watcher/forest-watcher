package com.cube.rnmbtiles;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ReactNativeMBTilesModule extends ReactContextBaseJavaModule {

    private RNMBTileSource source = null;
    private RNMBTileServer server = null;

    public ReactNativeMBTilesModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ReactNativeMBTiles";
    }

    @ReactMethod
    public void getMetadata(String basemapId, String basemapPath, Callback callback) {
        try {
            RNMBTileSource source = new RNMBTileSource(basemapId, basemapPath);
            callback.invoke(null, source.getMappedMetadata());
        } catch (Error e) {
            callback.invoke(true, null);
        }
    }

    @ReactMethod
    public void prepare(String basemapId, String basemapPath, Callback callback) {
        try {
            source = new RNMBTileSource(basemapId, basemapPath);
            RNMBTileMetadata metadata = source.getMetadata();

            if (null == metadata) {
                callback.invoke(true, null);
                return;
            }

            callback.invoke(null, metadata.getMappedMetadata());
        } catch (Exception e) {
            callback.invoke(true, null);
        }
    }

    @ReactMethod
    public void startServer(Integer port) {
        if (source == null) {
            return;
        }

        if (server != null) {
            throw new RuntimeException("A server is already running");
        }

        server = new RNMBTileServer(source, port);
        try {
            server.start();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @ReactMethod
    public void stopServer() {
        if (server == null) {
            return;
        }

        server.stop();
        server = null;
    }
}
