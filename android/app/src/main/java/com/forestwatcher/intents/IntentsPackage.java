package com.forestwatcher.intents;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class IntentsPackage implements ReactPackage
{
	@Override
	public List<NativeModule> createNativeModules(ReactApplicationContext reactContext)
	{
		return Arrays.<NativeModule>asList(new IntentsModule(reactContext));
	}

	@Override
	public List<ViewManager> createViewManagers(ReactApplicationContext reactContext)
	{
		return Collections.emptyList();
	}
}
