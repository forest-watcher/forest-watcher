package com.forestwatcher.mapbox;

import com.mapbox.mapboxsdk.module.http.HttpRequestUtil;
import okhttp3.Dispatcher;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import org.jetbrains.annotations.NotNull;

import java.io.IOException;

/**
 * Custom OKHttp interceptor designed to reflect the Forest Watcher offline mode flag.
 *
 * When Offline Mode is enabled, the app should avoid making network requests even if it has an active connection.
 * To support this we install this custom HTTP interceptor to reject any outgoing HTTP requests from Mapbox while
 * Offline Mode is enabled.
 */
public class MapboxOfflineModeInterceptor implements Interceptor
{
	public static final MapboxOfflineModeInterceptor INSTANCE = new MapboxOfflineModeInterceptor();

	/**
	 * Override the default Mapbox HTTP client on Android with a custom one that has an HTTP interceptor that respects
	 * the Forest Watcher app's offline mode.
	 */
	public static void installCustomForestWatcherHttpClient()
	{
		// Dispatcher definition taken from {@link com.mapbox.rctmgl.modules.RCTMGLModule}
		Dispatcher dispatcher = new Dispatcher();
		// Matches core limit set on
		// https://github.com/mapbox/mapbox-gl-native/blob/master/platform/android/src/http_file_source.cpp#L192
		dispatcher.setMaxRequestsPerHost(20);
		OkHttpClient httpClient = new OkHttpClient.Builder().addInterceptor(INSTANCE)
		                                                    .dispatcher(dispatcher)
		                                                    .build();

		HttpRequestUtil.setLogEnabled(false);
		HttpRequestUtil.setOkHttpClient(httpClient);
	}

	private boolean isOfflineModeEnabled = false;

	public void setOfflineModeEnabled(boolean isOfflineModeEnabled)
	{
		this.isOfflineModeEnabled = isOfflineModeEnabled;
	}

	@Override
	public @NotNull Response intercept(@NotNull Chain chain) throws IOException
	{
		String host = chain.request().url().host();
		if (!isOfflineModeEnabled || "localhost".equalsIgnoreCase(host) || "127.0.0.1".equalsIgnoreCase(host))
		{
			return chain.proceed(chain.request());
		}
		else
		{
			throw new IOException("Offline mode");
		}
	}
}
