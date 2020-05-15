package com.forestwatcher;

import android.content.Context;
import android.util.Log;

import com.facebook.react.PackageList;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.forestwatcher.intents.IntentsPackage;
import com.marianhello.bgloc.react.BackgroundGeolocationPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;

import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

  private final ReactNativeHost mReactNativeHost = new NavigationReactNativeHost(this)
  {
    @Override
    public boolean getUseDeveloperSupport()
    {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages()
    {
      @SuppressWarnings("UnnecessaryLocalVariable") List<ReactPackage> packages = new PackageList(this).getPackages();
      // Packages that cannot be autolinked yet can be added manually here, for example:
      packages.addAll(Arrays.<ReactPackage>asList(
          new BackgroundGeolocationPackage(),
          new SafeAreaContextPackage(),
          new IntentsPackage()
      ));
      return packages;
    }

    @Override
    protected String getJSMainModuleName()
    {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this); // Remove this line if you don't want Flipper enabled

    // Note: Eventually, this will sit within the JS layer - on entering the map screen / selecting a new imported basemap we will prepare the selected basemap.
    // We'll then start up the server on a given port, and then close the server on leaving the map screen / the app going into background.
    // But until we have a module, we have this instead 👀
    // To test this, you'll need to:
    //  - Import a basemap (specifically with raster tiles for now!).
    //  - Intercept the basemaps's unique identifier.
    //  - Change the identifier and path below.
    //  - Change the identifier in the map screen URL.
    String path = "/data/user/0/com.forestwatcher/files/tiles/basemap/a12a1e41-06d1-40e3-9141-6a8a536d8213/0x0x0/a12a1e41-06d1-40e3-9141-6a8a536d8213.mbtiles";
    String sourceId = "a12a1e41-06d1-40e3-9141-6a8a536d8213";
    try {
      RNMBTileServer.INSTANCE.prepare(sourceId, path);
      RNMBTileServer.INSTANCE.startServer(54321);

    } catch (RNMBTileSourceError e) {
      Log.e("3SC", "onCreate: Error starting the map server");
    }

  }

  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
