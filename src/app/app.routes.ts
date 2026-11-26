import { Routes } from '@angular/router';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { AdminProduitListe } from './admin/admin-produit-liste/admin-produit-liste';
import { AdminCommandes } from './admin/commandes/admin-commandes';
import { Connexion } from './admin/connexion/connexion';
import { MotDePasse } from './admin/mot-de-passe/mot-de-passe';
import { ProduitForm } from './admin/produit-form/produit-form';
import { Statistiques } from './admin/statistiques/statistiques';
import { Error404 } from './error404/error404';
import { APropos } from './front/a-propos/a-propos';
import { ConnexionClient } from './front/connexion-client/connexion-client';
import { Favoris } from './front/favoris/favoris';
import { FrontLayout } from './front/front-layout/front-layout';
import { Inscription } from './front/inscription/inscription';
import { MesCommandes } from './front/mes-commandes/mes-commandes';
import { Panier } from './front/panier/panier';
import { ProduitDetail } from './front/produit-detail/produit-detail';
import { ProduitListe } from './front/produit-liste/produit-liste';

export const routes: Routes = [
  {
    path: '',
    component: FrontLayout,
    children: [
      { path: '', title: 'TechShop - Nos produits', component: ProduitListe },
      { path: 'produit/:id', title: 'TechShop - Détail du produit', component: ProduitDetail },
      { path: 'connexion', title: 'TechShop - Connexion', component: ConnexionClient },
      { path: 'inscription', title: 'TechShop - Créer un compte', component: Inscription },
      { path: 'favoris', title: 'TechShop - Mes favoris', component: Favoris },
      { path: 'panier', title: 'TechShop - Mon panier', component: Panier },
      { path: 'mes-commandes', title: 'TechShop - Mes commandes', component: MesCommandes },
      { path: 'mot-de-passe', title: 'TechShop - Mot de passe', component: MotDePasse },
      { path: 'a-propos', title: 'TechShop - À propos', component: APropos }
    ]
  },
  { path: 'admin', title: 'TechShop - Connexion', component: Connexion },
  {
    path: 'admin/gestion',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'produits', pathMatch: 'full' },
      { path: 'produits', title: 'TechShop - Gestion des produits', component: AdminProduitListe },
      { path: 'produits/ajouter', title: 'TechShop - Ajouter un produit', component: ProduitForm },
      { path: 'produits/modifier/:id', title: 'TechShop - Modifier un produit', component: ProduitForm },
      { path: 'commandes', title: 'TechShop - Commandes', component: AdminCommandes },
      { path: 'statistiques', title: 'TechShop - Statistiques', component: Statistiques },
      { path: 'mot-de-passe', title: 'TechShop - Mot de passe', component: MotDePasse }
    ]
  },
  { path: '**', title: 'TechShop - Page introuvable', component: Error404 }
];
