package com.forestwatcher;

import android.content.Context;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.facebook.react.PackageList;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.soloader.SoLoader;
import com.forestwatcher.intents.IntentsPackage;
import com.imagepicker.ImagePickerPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.mapbox.rctmgl.RCTMGLPackage
import com.marianhello.bgloc.react.BackgroundGeolocationPackage;
import com.reactcommunity.rnlocalize.RNLocalizePackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.cookies.CookieManagerPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import com.rnappauth.RNAppAuthPackage;
import com.rnziparchive.RNZipArchivePackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import io.invertase.firebase.analytics.ReactNativeFirebaseAnalyticsPackage;
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
import io.sentry.RNSentryPackage;

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
          new AsyncStoragePackage(),
          new BackgroundGeolocationPackage(),
          new CookieManagerPackage(),
          new FBSDKPackage(),
          new ImagePickerPackage(),
          new IntentsPackage(),
          new LottiePackage(),
          new MapsPackage(),
          new NetInfoPackage(),
          new ReactNativeConfigPackage(),
          new ReactNativeDialogsPackage(),
          new ReactNativeFirebaseAnalyticsPackage(),
          new ReactNativeFirebaseAppPackage(),
          new RCTMGLPackage(),
          new RNAppAuthPackage(),
          new RNCWebViewPackage(),
          new RNFetchBlobPackage(),
          new RNLocalizePackage(),
          new RNSentryPackage(),
          new RNZipArchivePackage(),
          new SafeAreaContextPackage()
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
}
