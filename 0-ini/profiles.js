/**
 * -------------------------------------------------------------------------------------------------
 * Conf for forging JWTs for a RUDI node Catalog
 *    - prv:    path to the local private key to forge JWTs
 *    - pub:    path to the corresponding public key (to check the JWTs that were forged)
 *    - url:    address the RUDI Catalog module is listening to
 *    - key_id: name attached to the public key in the Catalog's Profiles file
 *
 * -------------------------------------------------------------------------------------------------
 * Conf for forging JWTs for a RUDI node Storage
 *    - url:    full address of the RUDI Storage module (with eventual prefix)
 *    - key_id: name attached to the Storage user's private key in the JwtAuth Profiles file
 *    - usr_id: ID of the user corresponding to the key in Storage's conf file
 *
 * -------------------------------------------------------------------------------------------------
 * The following object gathers the default configurations for local catalog and storage modules.
 * You can create a custom profiles file with a similar shape.
 * The keys for the keyPaths are the ID you'll use in the request to recall a particular
 * configuration
 *
 */

const keyPaths = {
  default: {
    catalog: {
      url: 'http://localhost:3000/catalog',
      key_id: 'postman',
      prv: './0-ssh/local_catalog.prv',
      pub: './0-ssh/local_catalog.pub',
    },
    storage: {
      url: 'http://localhost:3002/storage',
      key_id: 'storage_postman',
      usr_id: 102,
      prv: './0-ssh/local_storage.prv',
      pub: './0-ssh/local_storage.pub',
    },
  },
  aqmo_release: {
    catalog: {
      url: 'https://data-rudi.aqmo.org/catalog',
      key_id: 'postman',
      prv: './0-ssh/aqmorelease_catalog.prv',
      pub: './0-ssh/aqmorelease_catalog.pub',
    },
    storage: {
      url: 'https://data-rudi.aqmo.org/storage/jwt/forge',
      key_id: 'storage_postman',
      usr_id: 102,
      prv: './0-ssh/aqmorelease_storage.prv',
      pub: './0-ssh/aqmorelease_storage.pub',
    },
  },
}

export default keyPaths
