package com.forestwatcher;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.sensormanager.SensorManagerPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.airbnb.android.react.maps.MapsPackage;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.joshblour.reactnativeheading.ReactNativeHeadingPackage;
import com.syarul.rnlocation.RNLocation;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new SensorManagerPackage(),
          new RNFetchBlobPackage(),
          new RCTCameraPackage(),
          new ReactNativeConfigPackage(),
          new MapsPackage(),
          new ReactNativeI18n(),
          new ReactNativeHeadingPackage(),
          new RNLocation()
      );
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
  }
}
