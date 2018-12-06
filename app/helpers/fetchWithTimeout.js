
/**
 * A simple wrapper for the built-in fetch promise that errors with a timeout after the specified time period.
 *
 * @param {string} url - The url to call using the fetch api
 * @param {Object} request - The request information
 * @param {number} [timeout=30000] - The time in milliseconds to time out the request after
 *
 * @returns {Promise.<*>}
 */
export default function fetchWithTimeout(url, request, timeout = 30000) {
	const fetchPromise = fetch(url, request).catch(err => {
		// Some sort of networking error has occurred
		throw {
			domain: "networking",
			code: 2
		};
	});

	if (
		request.method === "POST" ||
		request.method === "PUT" ||
		request.method === "PATCH"
	) {
		console.warn(
			"Time-limited fetch should not be used for HTTP requests which may have side effects, falling back to standard fetch"
		);
		return fetchPromise;
	}

	const timeoutPromise = new Promise((resolve, reject) => {
		setTimeout(() => {
			reject({
				domain: "networking",
				code: 1
			});
		}, timeout);
	});

	return Promise.race([timeoutPromise, fetchPromise]);
}
