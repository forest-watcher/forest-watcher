package com.forestwatcher;

import android.content.Context;
import cl.json.ShareApplication;

import com.facebook.react.PackageList;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.forestwatcher.intents.IntentsPackage;
import com.marianhello.bgloc.react.BackgroundGeolocationPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.reactlibrary.ReactNativeMBTilesPackage;

import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication implements ShareApplication {

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
          new IntentsPackage(),
          new ReactNativeMBTilesPackage()
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

  @Override
  public String getFileProviderAuthority() {
    return BuildConfig.APPLICATION_ID + ".provider";
  }
}
