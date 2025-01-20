# RUDI producer node: JWT creation module

_Create JWT for sending requests to the RUDI Producer API/proxy module_

##### Author: Olivier Martineau (olivier.martineau@irisa.fr)

---

## Configuration

Configuration files can be found in the **"0-ini" directory**.

- `./0-ini/conf_default.ini`: default configuration and use examples
- `./0-ini/conf_custom.ini`: user configuration, to be created.

In these files, you have to provide a path for the **profiles** file that indicates the public and private key for the
subject you will use in the RUDI JWT ( "key" [removed from the JWT] or "sub" [kept in the JWT] property)


```ini
[security]
; Path of the security file that gathers the paths of the private and public keys for each account
profiles = ./0-ini/profiles_custom.ini
```

The configuration file and the profiles file can be alternatively with an option when starting the server in the CLI
```sh
nodemon ./run-rudinode-jwtauth.js --conf './0-ini/conf_custom.ini' --profiles './0-ini/profiles_custom.ini'
```
When a CLI option is used, it has priority over file values.

### JwtAuth module confirguration
Most variables are explained directly within the `./0-ini/conf_default.ini` file.

These ones need your attention:
```ini
[rudi_catalog]
; Default name for the Catalog user as defined in the JwtAuth Profiles file
; This should also be the name attached to the public key in the Catalog's Profiles file
key_id = postman

; (optional) Address the RUDI Catalog module is listening to
; This value is used only when redirecting requests to the Catalog using this JwtAuth module for basic tests
catalog_url = http://127.0.0.1:3000

[rudi_storage]
; Default name for the Storage user as defined in the JwtAuth Profiles file
; This should also be the name attached to the public key in the Storage conf
key_id = storage_postman
; Default value for the Storage user's ID attached the public key in the Storage conf file
usr_id = 102

; Full address of the RUDI Storage module (with eventual prefix)
; This value is necessary for creating Storage JWT
storage_url = http://localhost:3002/storage
```

### Local Profiles file

Both public and private keys should be provided, as public key can be used to check a token
through JwtAuth module's API.


```ini
; Each profile their own section: the section name is the id of the usr in the corresponding module

; pub_key = <public key path for this subject>
; prv_key = <private key path for the subject>
; both keys are necessary for the JwtAuth module's API to both forge and verify a JWT

;--------------------------------------------------------------------------
; RUDI producer node - Catalog module
;--------------------------------------------------------------------------
[postman_catalog]
pub_key=./0-ssh/postman_catalog.pub
prv_key=./0-ssh/postman_catalog.prv

;--------------------------------------------------------------------------
; RUDI producer node - Storage module
;--------------------------------------------------------------------------
[postman_storage]
pub_key=./0-ssh/postman_storage.pub
prv_key=./0-ssh/postman_storage.prv
```

### Catalog Profiles file
```ini
[postman_catalog]
pub_key=./0-ssh/postman_catalog.pub
routes[]="all"
```

### Storage config file
```ini
[auth]
system_users = {
    "storage_postman": [ 102, "$1$bcrypt_hashed_pwd$", [ "producer", "auth" ], "./.ssh/storage_postman.pub" ]
}
```

---

## API to use this module

### _Hash a passwrod_

- `POST /crypto/pwd/hash` Hash a password. You can provide a password as a plain string in the body. One can also provide a base64 or base64url-encoded string by adding to the request URL `?encoding=base64` (respectively `?encoding=base64url`).

### _JWT creation / verification_

- `POST /crypto/jwt/forge` Create a JWT with the following information (to be included in the body of the request as a JSON)
  - For Catalog JWTs:
    - `target`: (optional) module for which we want to create the JWT, defaulted to "catalog"
    - `sub`: user ID that should be used to retrieve the attached key
    - `client_id`: (optional) an identifier of the logged user
    - `exp`: (optional) token expiration date in Epoch seconds
    - `jti`: token identifier (optional, preferably UUIDv4)
  - For Storage JWTs:
    - `target`: "storage"
    - `user_name`: the name of the user account on Storage ("storage_postman" in the example above)
    - `user_id`: the ID of the account (102 in the example above)


- `GET /crypto/jwt/check`
  Check the validity of the JWT placed in header (`"Authentification": Bearer <token>`)

- `POST /crypto/jwt/check`
  Check the validity of the JWT string in the request body

---

### _Redirection with JWT identification_

The following routes redirect `GET/POST/PUT/DELETE` requests to the destination URL: it replaces in the request URL the
current module domain with the one of the API module as configured in **conf_custom.ini**.

- `GET /crypto/redirect/<destination_url>`
- `POST /crypto/redirect/<destination_url>`
- `PUT /crypto/redirect/<destination_url>`
- `DELETE /crypto/redirect/<destination_url>`

#### Examples:

> GET http://127.0.0.1:4000/crypto/redirect/resources?sort=-global_id

returns the result of

> GET http://127.0.0.1:3000/api/admin/resources?sort=-global_id

In a similar way,

> GET http://127.0.0.1:4000/crypto/redirect/resources/b0fcf63b-c220-4275-8dcb-e8f663203c33

returns the result of

> GET http://127.0.0.1:3000/api/admin/resources/b0fcf63b-c220-4275-8dcb-e8f663203c33

---

### _Accessing the logs_

- `GET /crypto/logs`
  Get logs
- `DELETE /crypto/logs`
  Clear logs
