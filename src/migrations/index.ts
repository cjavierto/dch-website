import * as migration_20261018_092711_initial from './20261018_092711_initial';
import * as migration_20261022_050707_booking_and_legal_pages from './20261022_050707_booking_and_legal_pages';
import * as migration_20261107_070859_facility_photos from './20261107_070859_facility_photos';
import * as migration_20261107_104745_footer_logos from './20261107_104745_footer_logos';

export const migrations = [
  {
    up: migration_20261018_092711_initial.up,
    down: migration_20261018_092711_initial.down,
    name: '20261018_092711_initial',
  },
  {
    up: migration_20261022_050707_booking_and_legal_pages.up,
    down: migration_20261022_050707_booking_and_legal_pages.down,
    name: '20261022_050707_booking_and_legal_pages',
  },
  {
    up: migration_20261107_070859_facility_photos.up,
    down: migration_20261107_070859_facility_photos.down,
    name: '20261107_070859_facility_photos',
  },
  {
    up: migration_20261107_104745_footer_logos.up,
    down: migration_20261107_104745_footer_logos.down,
    name: '20261107_104745_footer_logos'
  },
];
