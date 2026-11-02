import * as migration_20261018_092711_initial from './20261018_092711_initial';
import * as migration_20261022_050707_booking_and_legal_pages from './20261022_050707_booking_and_legal_pages';

export const migrations = [
  {
    up: migration_20261018_092711_initial.up,
    down: migration_20261018_092711_initial.down,
    name: '20261018_092711_initial',
  },
  {
    up: migration_20261022_050707_booking_and_legal_pages.up,
    down: migration_20261022_050707_booking_and_legal_pages.down,
    name: '20261022_050707_booking_and_legal_pages'
  },
];
