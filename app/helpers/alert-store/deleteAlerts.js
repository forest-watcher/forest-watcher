import { initDb } from 'helpers/alert-store/database';

export default function deleteAlerts() {
  const realm = initDb();
  realm.write(() => {
    const allAlerts = realm.objects('Alert');
    realm.delete(allAlerts);
  });
}
