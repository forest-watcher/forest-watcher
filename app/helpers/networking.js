import fetch from './fetchWithTimeout';

export default function checkConnectivity(url, completionHandler) {
  fetch(url, {
    method: 'HEAD'
  }).then(response => {
    completionHandler(response)
  }).catch(error => {
    completionHandler({
      ok: false
    })
  });
}
