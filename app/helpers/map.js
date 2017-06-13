export function getCartoURlTile(layerConfig) {
  const fetchConfig = {
    method: 'POST',
    body: JSON.stringify({ layers: layerConfig.layers }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  return fetch(layerConfig.endpoint, fetchConfig)
    .then(response => response.json())
    .then(res => `${layerConfig.endpoint}${res.layergroupid}/{z}/{x}/{y}.png32`)
    .catch((e) => console.warn(e));
}
