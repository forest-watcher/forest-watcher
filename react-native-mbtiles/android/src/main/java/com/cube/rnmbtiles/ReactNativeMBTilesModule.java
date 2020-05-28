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
    public void prepare(String basemapId, String basemapPath, Callback callback) {
        try {
            String actualPath = null != basemapPath ? basemapPath : "/data/user/0/com.forestwatcher/files/tiles/basemap/a12a1e41-06d1-40e3-9141-6a8a536d8213/0x0x0/a12a1e41-06d1-40e3-9141-6a8a536d8213.mbtiles";
            
            RNMBTileMetadata metadata = RNMBTileServer.INSTANCE.prepare(basemapId, actualPath);

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
