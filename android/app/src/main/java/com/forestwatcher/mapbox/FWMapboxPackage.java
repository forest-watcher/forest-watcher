package com.forestwatcher.mapbox;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import org.jetbrains.annotations.NotNull;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Simple RN native module to modify some functionality of Mapbox to better support Forest Watcher requirements
 */
public class FWMapboxPackage implements ReactPackage
{
	@Override
	public @NotNull List<NativeModule> createNativeModules(@NotNull ReactApplicationContext reactContext)
	{
		return Arrays.<NativeModule>asList(new FWMapboxModule(reactContext));
	}

	@Override
	public @NotNull List<ViewManager> createViewManagers(@NotNull ReactApplicationContext reactContext)
	{
		return Collections.emptyList();
	}
}
