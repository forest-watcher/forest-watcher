package com.reactlibrary;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.forestwatcher.RNMBTileMetadata;
import com.forestwatcher.RNMBTileServer;

public class ReactNativeMBTilesModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public ReactNativeMBTilesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ReactNativeMbtiles";
    }

    @ReactMethod
    public void prepare(String basemapId, String basemapPath, Callback callback) {
        try {
            String actualPath = null != basemapPath ? basemapPath : "/data/user/0/com.forestwatcher/files/tiles/basemap/a12a1e41-06d1-40e3-9141-6a8a536d8213/0x0x0/a12a1e41-06d1-40e3-9141-6a8a536d8213.mbtiles";
            
            RNMBTileMetadata metadata = RNMBTileServer.INSTANCE.prepare(basemapId, actualPath);

            if (null == metadata) {
                // TODO: Change this to invoke with a proper error?
                callback.invoke(true, null);
            }

            callback.invoke(null, metadata.mappedMetadata());
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
