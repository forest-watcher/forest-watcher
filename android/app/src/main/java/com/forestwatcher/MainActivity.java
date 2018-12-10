package com.forestwatcher;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.security.ProviderInstaller;
import com.reactnativenavigation.NavigationActivity;

public class MainActivity extends NavigationActivity implements ProviderInstaller.ProviderInstallListener
{
	private static final int PROVIDER_INSTALLER_RECOVERY_REQUEST_CODE = 1;

	private boolean retryProviderInstall;

	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		ProviderInstaller.installIfNeededAsync(this, this);
	}

	@Override
	public void onActivityResult(
		int requestCode,
		int resultCode,
		Intent data
	)
	{
		super.onActivityResult(requestCode, resultCode, data);

		if (requestCode == PROVIDER_INSTALLER_RECOVERY_REQUEST_CODE)
		{
			// Adding a fragment via GoogleApiAvailability.showErrorDialogFragment
			// before the instance state is restored throws an error. So instead,
			// set a flag here, which will cause the fragment to delay until
			// onPostResume.
			retryProviderInstall = true;
		}

		MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
	}

	/**
	 * On resume, check to see if we flagged that we need to reinstall the provider.
	 */
	@Override
	protected void onPostResume()
	{
		super.onPostResume();
		if (retryProviderInstall)
		{
			// We can now safely retry installation.
			ProviderInstaller.installIfNeededAsync(this, this);
		}
		retryProviderInstall = false;
	}

	/**
	 * This method is only called if the provider is successfully updated (or is already up-to-date).
	 */
	@Override
	public void onProviderInstalled()
	{
		Log.d("3SC", "Updated security provider successfully");
	}

	/**
	 * This method is called if updating fails; the error code indicates whether the error is recoverable.
	 */
	@Override
	public void onProviderInstallFailed(
		int errorCode,
		Intent recoveryIntent
	)
	{
		Log.d("3SC", "Unable to update security provider: " + errorCode);
		GoogleApiAvailability availability = GoogleApiAvailability.getInstance();
		if (availability.isUserResolvableError(errorCode))
		{
			// Recoverable error. Show a dialog prompting the user to
			// install/update/enable Google Play services.
			availability.showErrorDialogFragment(this, errorCode, PROVIDER_INSTALLER_RECOVERY_REQUEST_CODE);
		}
	}

	@Override
	protected void addDefaultSplashLayout()
	{
		setContentView(R.layout.splash);
	}
}
