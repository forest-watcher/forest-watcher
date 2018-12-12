package com.forestwatcher.sensors;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.support.annotation.Nullable;
import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * https://google-developer-training.gitbooks.io/android-developer-advanced-course-practicals/content/unit-1-expand-the-user-experience/lesson-3-sensors/3-2-p-working-with-sensor-based-orientation/3-2-p-working-with-sensor-based-orientation.html
 */
public class OrientationListener implements SensorEventListener
{

	private ReactContext context;
	private SensorManager sensorManager;
	private Sensor accelerometer;
	private Sensor magnetometer;

	private float[] accelerometerReading;
	private float[] magnetometerReading;

	private int isRegistered = 0;


	public OrientationListener(ReactApplicationContext reactContext)
	{
		sensorManager = (SensorManager) reactContext.getSystemService(Context.SENSOR_SERVICE);
		accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
		magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
		context = reactContext;
	}

	public int start()
	{
		if (accelerometer != null && isRegistered == 0)
		{
			sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI);
			sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_UI);
			isRegistered = 1;
			return (1);
		}
		return (0);
	}

	public void stop()
	{
		if (isRegistered == 1)
		{
			sensorManager.unregisterListener(this);
			isRegistered = 0;
		}
	}

	private void sendEvent(
		String eventName,
		@Nullable WritableMap params
	)
	{
		try
		{
			context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
		}
		catch (Exception e)
		{
			Log.e("3SC", e.getMessage(), e);
		}
	}

	@Override
	public void onSensorChanged(SensorEvent sensorEvent)
	{
		Sensor mySensor = sensorEvent.sensor;
		WritableMap map = Arguments.createMap();

		if (mySensor.getType() == Sensor.TYPE_ACCELEROMETER)
		{
			accelerometerReading = sensorEvent.values.clone();
		}
		if (mySensor.getType() == Sensor.TYPE_MAGNETIC_FIELD)
		{
			magnetometerReading = sensorEvent.values.clone();
		}

		if (accelerometerReading != null && magnetometerReading != null)
		{
			float[] rotationMatrix = new float[9];
			boolean success = SensorManager.getRotationMatrix(rotationMatrix, null, accelerometerReading, magnetometerReading);
			if (success)
			{
				float[] orientation = new float[3];
				SensorManager.getOrientation(rotationMatrix, orientation);

				float azimuth = (float) ((Math.toDegrees(orientation[0])) % 360.0f);
				float pitch = (float) ((Math.toDegrees(orientation[1])) % 360.0f);
				float roll = (float) ((Math.toDegrees(orientation[2])) % 360.0f);

				if (azimuth < 0)
				{
					azimuth += 360;
				}

				if (pitch < 0)
				{
					pitch += 360;
				}

				if (roll < 0)
				{
					roll += 360;
				}

				map.putDouble("azimuth", azimuth);
				map.putDouble("pitch", pitch);
				map.putDouble("roll", roll);
				sendEvent("Orientation", map);
			}
		}
	}

	@Override
	public void onAccuracyChanged(
		Sensor sensor,
		int accuracy
	)
	{
	}
}
