package com.forestwatcher;

import com.psykar.cookiemanager.CookieManagerPackage;
import io.realm.react.RealmReactPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.sensormanager.SensorManagerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.react.ReactPackage;
import com.reactnativenavigation.NavigationApplication;
import com.airbnb.android.react.maps.MapsPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.syarul.rnlocation.RNLocation;
import com.rnziparchive.RNZipArchivePackage;
import com.imagepicker.ImagePickerPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }

  protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(
            new RNGoogleSigninPackage(),
            new GoogleAnalyticsBridgePackage(),
            new SensorManagerPackage(),
            new RNFetchBlobPackage(),
            new ReactNativeConfigPackage(),
            new MapsPackage(),
            new RNI18nPackage(),
            new RNLocation(),
            new RealmReactPackage(),
            new RNZipArchivePackage(),
            new CookieManagerPackage(),
            new ImagePickerPackage()
    );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }
}
