# Plateforme Multi-Comptes avec Listes Déroulantes Personnalisées

Application React + Firebase (sans serveur Node requis).

## Structure

- `client/` : React + Vite (application active)
- `backend/` : ancien code API, non utilise

## Fonctionnalites

- Authentification Firebase Auth (email/mot de passe)
- Roles stockes dans Firestore (`user`, `superadmin`)
- Chaque utilisateur gere ses propres options de listes deroulantes
- Super Admin visualise les statistiques globales sans modifier les listes utilisateur

## Configuration Firebase

Dans `client/.env`, ajoutez :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Démarrage

1. Ouvrez un terminal à la racine du projet
2. Exécutez : `npm install`
3. Lancez : `npm run dev`

Le script `dev` démarre uniquement le client Firebase (aucun serveur Express/Node backend).

## Collections Firestore utilisees

- `users` : `{ email, role, created_at }`
- `dropdown_options` : `{ user_id, label, value, category }`
- `entries` : `{ user_id, dropdown_id, selected_value, category, created_at }`
