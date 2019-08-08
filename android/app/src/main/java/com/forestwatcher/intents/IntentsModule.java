package com.forestwatcher.intents;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Environment;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

import static android.content.Intent.FLAG_ACTIVITY_NEW_TASK;

public class IntentsModule extends ReactContextBaseJavaModule
{
	/**
	 * Identify whether or not the currently running device is manufactured by Samsung
	 *
	 * @return
	 */
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

	/**
	 * Attempts to launch the device's downloads directory
	 * <p>
	 * Samsung devices don't integrate with the standard intents and so are handled differently.
	 */
	@ReactMethod
	public void launchDownloadsDirectory()
	{
		final Context context = getReactApplicationContext();
		final PackageManager packageManager = context.getPackageManager();
		Intent intent = null;

		if (isSamsung())
		{
			intent = packageManager.getLaunchIntentForPackage("com.sec.android.app.myfiles");
			if (intent != null)
			{
				intent.setAction("samsung.myfiles.intent.action.LAUNCH_MY_FILES");
				intent.putExtra("samsung.myfiles.intent.extra.START_PATH", getDownloadsFile().getPath());
			}
		}

		if (intent == null || intent.resolveActivity(packageManager) == null)
		{
			intent = new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS);
		}

		intent.setFlags(FLAG_ACTIVITY_NEW_TASK);

		if (intent.resolveActivity(packageManager) != null)
		{
			context.startActivity(intent);
		}
		else
		{
			Log.w("3SC", "No intent found to launch downloads app");
		}
	}

	@ReactMethod
	public void launchEmailClient()
	{
		Intent intent = new Intent(Intent.ACTION_MAIN);
		intent.addCategory(Intent.CATEGORY_APP_EMAIL);
		getReactApplicationContext().startActivity(Intent.createChooser(intent, "Select e-mail app"));
	}
}
