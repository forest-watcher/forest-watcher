import fetch from './fetchWithTimeout';

export default function checkConnectivity(url) {
  return fetch(url, {
    method: 'HEAD'
  })
    .then(response => response.ok)
    .catch(() => false);
}
