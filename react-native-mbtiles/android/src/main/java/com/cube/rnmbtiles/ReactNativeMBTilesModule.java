package com.cube.rnmbtiles;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ReactNativeMBTilesModule extends ReactContextBaseJavaModule {

    public ReactNativeMBTilesModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ReactNativeMBTiles";
    }

    @ReactMethod
    public void getMetadata(String basemapId, String basemapPath, Callback callback) {
        RNMBTileSource source = new RNMBTileSource(basemapId, basemapPath);

        if (null == source) {
            callback.invoke(true, null);
            return;
        }

        callback.invoke(null, source.getMappedMetadata());
    }

    @ReactMethod
    public void prepare(String basemapId, String basemapPath, Callback callback) {
        try {
            RNMBTileMetadata metadata = RNMBTileServer.INSTANCE.prepare(basemapId, basemapPath);

            if (null == metadata) {
                callback.invoke(true, null);
                return;
            }

            callback.invoke(null, metadata.getMappedMetadata());
        } catch (Error e) {
            callback.invoke(true, null);
        }
    }

    @ReactMethod
    public void startServer(Integer port) {
        RNMBTileServer.INSTANCE.startServer(port);
    }

    @ReactMethod
    public void stopServer() {
        RNMBTileServer.INSTANCE.stopServer();
    }
}
