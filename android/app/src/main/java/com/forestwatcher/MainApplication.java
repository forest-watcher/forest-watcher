package com.forestwatcher;

import android.content.Intent;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.facebook.CallbackManager;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.imagepicker.ImagePickerPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.microsoft.appcenter.reactnative.appcenter.AppCenterReactNativePackage;
import com.microsoft.codepush.react.CodePush;
import com.microsoft.codepush.react.ReactInstanceHolder;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.reactlibrary.RNAppAuthPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import com.rnziparchive.RNZipArchivePackage;
import io.realm.react.RealmReactPackage;
import io.sentry.RNSentryPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication implements ReactInstanceHolder {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  @Override
  protected ReactGateway createReactGateway() {
    ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {

      @Override
      public String getJSMainModuleName() {
        return "index";
      }

    };
    return new ReactGateway(this, isDebug(), host);
  }

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
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
      new RNFetchBlobPackage(),
      new ReactNativeConfigPackage(),
      new MapsPackage(),
      new RNI18nPackage(),
      new RealmReactPackage(),
      new RNZipArchivePackage(),
      new CookieManagerPackage(),
      new ImagePickerPackage(),
      new CodePush(
        BuildConfig.CODEPUSH_DEPLOY_KEY,
        getApplicationContext(),
        BuildConfig.DEBUG,
        R.string.CODEPUSH_RELEASE_PUBLIC_KEY
      ),
      new RNAppAuthPackage(),
      new FBSDKPackage(mCallbackManager),
      new AppCenterReactNativePackage(MainApplication.this),
      new FastImageViewPackage(),
      new LottiePackage(),
      new RNSentryPackage(),
      new RNCWebViewPackage()
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
