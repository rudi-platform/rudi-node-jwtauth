<br>
<p align="center">
  <a href="https://rudi.rennesmetropole.fr/">
  <img src="https://blog.rudi.bzh/wp-content/uploads/2020/11/logo_bleu_orange.svg" width=100px alt="Rudi logo" />  </a>
</p>

<h2 align="center" >RUDI Node JWTauth</h3>
<p align="center">Module de création de JWT pour l'authentification des requêtes vers l'API du nœud producteur de RUDI.</p>

<p align="center"><a href="https://rudi.rennesmetropole.fr/">🌐 Instance de Rennes Métropole</a> · <a href="doc.rudi.bzh">📚 Documentation</a> ·  <a href="https://blog.rudi.bzh/">📰 Blog</a><p>

## ⚙️ Configuration

### Fichiers de configuration
```ini
# 0-ini/conf_default.ini : Configuration par défaut
# 0-ini/conf_custom.ini : Configuration personnalisée
```

Le fichier de configuration doit spécifier :
- Le chemin vers le fichier **profiles**
- Les clés publiques et privées pour chaque sujet JWT
- La correspondance avec les sujets définis dans l'API RUDI producer

## 🔑 API du module

### Gestion des mots de passe
```http
POST /crypto/pwd/hash
```
Hash un mot de passe. Accepte :
- Texte brut dans le body
- Encodage base64 avec `?encoding=base64`
- Encodage base64url avec `?encoding=base64url`

### Gestion des JWT

#### Création de token
```http
POST /crypto/jwt/forge
```
Payload requis :
```json
{
  "exp": "date d'expiration (epoch)",
  "jti": "identifiant du token (UUIDv4)",
  "sub": "identifiant du client API",
  "req_mtd": "méthode HTTP",
  "req_url": "URL de la requête",
  "client_id": "identifiant utilisateur (optionnel)"
}
```

#### Vérification de token
```http
GET /crypto/jwt/check    # Token dans header Authorization
POST /crypto/jwt/check   # Token dans le body
```

### Redirection avec JWT

Routes de redirection disponibles :
```http
GET    /crypto/redirect/<url>
POST   /crypto/redirect/<url>
PUT    /crypto/redirect/<url>
DELETE /crypto/redirect/<url>
```

#### Exemples de redirection
```
GET http://127.0.0.1:4000/crypto/redirect/resources?sort=-global_id
→ GET http://127.0.0.1:3000/api/admin/resources?sort=-global_id

GET http://127.0.0.1:4000/crypto/redirect/resources/b0fcf63b-c220-4275-8dcb-e8f663203c33
→ GET http://127.0.0.1:3000/api/admin/resources/b0fcf63b-c220-4275-8dcb-e8f663203c33
```

### Gestion des logs
```http
GET    /crypto/logs    # Consultation des logs
DELETE /crypto/logs    # Nettoyage des logs
```

## 👥 Contact

Pour toute question : olivier.martineau@irisa.fr

## 📚 Documentation complémentaire

- [Documentation API RUDI Producer](https://app.swaggerhub.com/apis/OlivierMartineau/RUDI-PRODUCER/)

## Contribuer à Rudi

Nous accueillons et encourageons les contributions de la communauté. Voici comment vous pouvez participer :
- 🛣️ [Feuille de route](https://github.com/orgs/rudi-platform/projects/2)
- 🐞 [Signaler un bug du portail](https://github.com/rudi-platform/rudi-node-jwtauth/issues)
- ✨ [Contribuer](https://github.com/rudi-platform/.github/blob/main/CONTRIBUTING.md)
- 🗣️ [Participer aux discussions](https://github.com/orgs/rudi-platform/discussions)
