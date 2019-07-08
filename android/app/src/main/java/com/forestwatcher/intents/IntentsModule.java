package com.forestwatcher.intents;

import android.app.DownloadManager;
import android.content.Intent;
import android.os.Build;
import android.os.Environment;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

public class IntentsModule extends ReactContextBaseJavaModule
{
	private static boolean isSamsung()
	{
		String manufacturer = Build.MANUFACTURER;
		if (manufacturer != null)
		{
			return manufacturer.toLowerCase().equals("samsung");
		}
		return false;
	}

	private static File getDownloadsFile()
	{
		return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
	}

	public IntentsModule(ReactApplicationContext reactContext)
	{
		super(reactContext);
	}

	@Override
	public String getName()
	{
		return "Intents";
	}

	@ReactMethod
	public void launchDownloadsDirectory()
	{
		try
		{
			if (isSamsung())
			{
				Intent intent = getReactApplicationContext().getPackageManager().getLaunchIntentForPackage("com.sec.android.app.myfiles");
				intent.setAction("samsung.myfiles.intent.action.LAUNCH_MY_FILES");
				intent.putExtra("samsung.myfiles.intent.extra.START_PATH", getDownloadsFile().getPath());
				getReactApplicationContext().startActivity(intent);
			}
		}
		catch (Exception ex)
		{
			Log.e("3SC", "Could not launch Samsung download manager", ex);
			// continue and try and use the default manager
		}

		getReactApplicationContext().startActivity(new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS));
	}

	@ReactMethod
	public void launchEmailClient()
	{
		Intent intent = new Intent(Intent.ACTION_MAIN);
		intent.addCategory(Intent.CATEGORY_APP_EMAIL);
		getReactApplicationContext().startActivity(Intent.createChooser(intent, "Select e-mail app"));
	}
}
