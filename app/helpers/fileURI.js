// @flow

/**
 * Makes sure a given filepath is converted correctly to the format expected by each platform's
 * url methods (In iOS's case "file:///uri")
 */
export function toFileUri(uri: string) {
  const formatted = uri;
  if (!uri.startsWith('file:///')) {
    // Sometimes files are given to us like /var/mobile/Containers/Data/Application/
    if (uri.startsWith('/')) {
      uri = 'file://' + uri;
    } else {
      uri = 'file:///' + uri;
    }
  }
  return encodeURI(uri);
}
