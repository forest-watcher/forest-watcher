// To dump Realm db => Realm.clearTestState()

// @flow

import type { Alert } from 'types/alerts.types';
import Realm from 'realm';

const SCHEMA_VERSION = 1;

type Schema = {|
  +name: string,
  +primaryKey: string,
  +properties: { [string]: string | { type: string, indexed: boolean } }
|};

const AlertSchema: Schema = {
  name: 'Alert',
  primaryKey: 'id',
  properties: {
    id: 'string',
    areaId: { type: 'string', indexed: true },
    slug: { type: 'string', indexed: true },
    long: 'float',
    lat: 'float',
    date: 'int'
  }
};

/**
 * Realm is very slow at deleting large numbers of objects if they don't have a primary key.
 *
 * This is a big problem because Realm also completely blocks the UI for minutes at a time when we delete thousands of
 * unkeyed alerts, so we'd like to minimise how long it spends deleting things by giving them keys.
 *
 * Sadly, our alerts arent returned with a natural primary key (like an ID), and Realm doesn't support composite keys
 * so we will generate a "poor-man's" composite ID from its properties
 */
export function generateAlertId(alert: Alert): string {
  return `${alert.areaId}_${alert.slug}_${alert.long}_${alert.lat}_${alert.date}`;
}

export function initDb(schema: Array<Schema> = [AlertSchema]) {
  return new Realm({ schema, schemaVersion: SCHEMA_VERSION, migration: migrate });
}

function migrate(oldRealm, newRealm) {
  if (!oldRealm || oldRealm.schemaVersion === newRealm.schemaVersion) {
    return;
  }

  switch (newRealm.schemaVersion) {
    case 1: {
      if (oldRealm.schemaVersion < 1) {
        const oldAlerts = oldRealm.objects('Alert');
        const newAlerts = newRealm.objects('Alert');

        for (let i = 0; i < oldAlerts.length; i++) {
          newAlerts[i].id = generateAlertId(oldAlerts[i]);
        }
      }
      break;
    }
    default: {
      console.warn('3SC', 'Unhandled Realm migration');
      break;
    }
  }
}
