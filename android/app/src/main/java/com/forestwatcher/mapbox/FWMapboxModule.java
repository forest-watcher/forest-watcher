package com.forestwatcher.mapbox;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Simple RN native module to modify some functionality of Mapbox to better support Forest Watcher requirements
 */
public class FWMapboxModule extends ReactContextBaseJavaModule
{
	public FWMapboxModule(ReactApplicationContext reactContext)
	{
		super(reactContext);
	}

	@NonNull
	@Override
	public String getName()
	{
		return "FWMapbox";
	}

	/**
	 * Needs to be called after Mapbox access token has been initialised.
	 */
	@ReactMethod
	public void installOfflineModeInterceptor(boolean isOfflineModeEnabled)
	{
		MapboxOfflineModeInterceptor.installCustomForestWatcherHttpClient();
		setOfflineModeEnabled(isOfflineModeEnabled);
	}

	@ReactMethod
	public void setOfflineModeEnabled(boolean isOfflineModeEnabled)
	{
		MapboxOfflineModeInterceptor.INSTANCE.setOfflineModeEnabled(isOfflineModeEnabled);
	}
}
