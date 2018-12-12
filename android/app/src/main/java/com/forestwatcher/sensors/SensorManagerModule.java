package com.forestwatcher.sensors;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SensorManagerModule extends ReactContextBaseJavaModule
{
	private static final String REACT_CLASS = "SensorManager";

	private OrientationListener orientationListener = null;

	public SensorManagerModule(ReactApplicationContext reactContext)
	{
		super(reactContext);
	}

	@Override
	public String getName()
	{
		return REACT_CLASS;
	}

	@ReactMethod
	public int startOrientation()
	{
		if (orientationListener == null)
		{
			orientationListener = new OrientationListener(getReactApplicationContext());
		}
		return orientationListener.start();
	}

	@ReactMethod
	public void stopOrientation()
	{
		if (orientationListener != null)
		{
			orientationListener.stop();
		}
	}
}
