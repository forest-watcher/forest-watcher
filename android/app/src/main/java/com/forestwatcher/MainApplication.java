package com.forestwatcher;

import android.app.Application;
import android.util.Log;
import android.support.annotation.NonNull;

import com.facebook.react.ReactApplication;
import com.psykar.cookiemanager.CookieManagerPackage;
import io.realm.react.RealmReactPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.sensormanager.SensorManagerPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.reactnativenavigation.NavigationApplication;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.airbnb.android.react.maps.MapsPackage;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.syarul.rnlocation.RNLocation;
import io.realm.react.RealmReactPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {
  @Override
  public boolean isDebug() {
      return BuildConfig.DEBUG;
  }

  @NonNull
  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    // Add additional packages you require here
    return Arrays.<ReactPackage>asList(
      new RNGoogleSigninPackage(),
      new GoogleAnalyticsBridgePackage(),
      new SensorManagerPackage(),
      new RNFetchBlobPackage(),
      new RCTCameraPackage(),
      new ReactNativeConfigPackage(),
      new MapsPackage(),
      new ReactNativeI18n(),
      new RNLocation(),
      new RealmReactPackage(),
      new CookieManagerPackage()
    );
  }
}
