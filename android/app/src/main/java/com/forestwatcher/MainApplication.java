package com.forestwatcher;

import com.facebook.react.ReactInstanceManager;
import com.microsoft.codepush.react.ReactInstanceHolder;
import com.microsoft.codepush.react.CodePush;
import com.psykar.cookiemanager.CookieManagerPackage;
import io.realm.react.RealmReactPackage;
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

public class MainApplication extends NavigationApplication implements ReactInstanceHolder {

	@Override
	public String getJSBundleFile() {
    // Override default getJSBundleFile method with the one CodePush is providing
		return CodePush.getJSBundleFile();
	}

  @Override
  public String getJSMainModuleName() {
    return "index";
  }

  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }

  protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(
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
      new ImagePickerPackage(),
      new CodePush(
        BuildConfig.CODEPUSH_ANDROID_DEPLOY_KEY,
        getApplicationContext(),
        BuildConfig.DEBUG,
        R.string.CodePushPublicKey
      )
    );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }

  @Override
  public ReactInstanceManager getReactInstanceManager() {
      // CodePush must be told how to find React Native instance
    return getReactNativeHost().getReactInstanceManager();
  }
}
