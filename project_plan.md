# AutoMaroc - Application de Location de Voiture

## 1. Description du Projet
Application web de location de voiture au Maroc. Permet aux clients de parcourir et réserver des véhicules, aux gestionnaires de gérer le parc auto, et aux admins de tout superviser. Prix en dirhams (MAD).

## 2. Structure des Pages
- `/` - Page d'accueil (Login / Sign Up / Continuer comme visiteur)
- `/signup` - Inscription
- `/login` - Connexion
- `/home` - Page principale pour visiteur/client (catalogue voitures)
- `/car/:id` - Détail d'une voiture
- `/booking` - Réservation
- `/profile` - Profil client
- `/admin` - Dashboard Admin (accès restreint)
- `/admin/cars` - Gestion des voitures (Admin)
- `/admin/bookings` - Gestion des réservations (Admin)
- `/admin/users` - Gestion des utilisateurs (Admin)
- `/manager` - Dashboard Gestionnaire (accès restreint)
- `/manager/cars` - Gestion du parc (Gestionnaire)

## 3. Fonctionnalités Principales
- [ ] Page d'accueil avec 3 choix : Sign Up, Login, Visiteur
- [ ] Inscription client
- [ ] Connexion (client / admin / gestionnaire)
- [ ] Catalogue de voitures avec filtres
- [ ] Détail d'une voiture + réservation
- [ ] Panier / confirmation de réservation
- [ ] Dashboard Admin (stats, gestion voitures, réservations, utilisateurs)
- [ ] Dashboard Gestionnaire (gestion parc, disponibilités)
- [ ] Profil client + historique réservations
- [ ] Prix en MAD (dirhams)
- [ ] Interface interactive et animée

## 4. Acteurs / Rôles
- **Client** : Parcourir, réserver, gérer ses réservations
- **Gestionnaire** : Gérer le parc de voitures, disponibilités
- **Admin** : Accès complet, dashboard complet, gestion utilisateurs

## 5. Intégrations
- Supabase : Authentification, base de données (à connecter plus tard)
- Données mock en attendant Supabase

## 6. Plan de Développement

### Phase 1 : Pages d'accueil, Login & Sign Up ✅
- Objectif : Créer les pages d'entrée avec le design inspiré de la photo
- Livrable : Page Home avec 3 choix, Login, Sign Up

### Phase 2 : Catalogue Voitures (Client/Visiteur)
- Objectif : Afficher les voitures disponibles avec filtres et prix MAD
- Livrable : Page catalogue + page détail voiture

### Phase 3 : Réservation
- Objectif : Permettre aux clients de réserver une voiture
- Livrable : Formulaire de réservation + confirmation

### Phase 4 : Dashboard Admin
- Objectif : Interface d'administration complète
- Livrable : Dashboard avec stats, gestion voitures/réservations/utilisateurs

### Phase 5 : Dashboard Gestionnaire
- Objectif : Interface gestionnaire pour gérer le parc
- Livrable : Dashboard gestionnaire

### Phase 6 : Intégration Supabase
- Objectif : Connecter la vraie base de données et authentification
- Livrable : App fonctionnelle avec données réelles
