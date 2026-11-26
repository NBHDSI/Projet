import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Produit } from '../../models/produit';
import { AuthService } from '../../services/auth-service';
import { FavoriService } from '../../services/favori-service';
import { PanierService } from '../../services/panier-service';
import { ProduitService } from '../../services/produit-service';
import { ProduitItem } from '../produit-item/produit-item';

@Component({
  selector: 'app-favoris',
  imports: [ProduitItem, RouterLink],
  templateUrl: './favoris.html'
})
export class Favoris implements OnInit {
  private readonly produitService = inject(ProduitService);
  private readonly favoriService = inject(FavoriService);
  private readonly panierService = inject(PanierService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly favoris = computed(() => {
    const resultat: Produit[] = [];
    for (const produit of this.produitService.produits()) {
      if (this.favoriService.estFavori(produit.id)) {
        resultat.push(produit);
      }
    }
    return resultat;
  });

  readonly erreur = signal('');

  constructor() {
    effect(() => {
      if (this.authService.estClient() == false) {
        this.router.navigate(['/connexion'], { queryParams: { retour: '/favoris' } });
      }
    });
  }

  ngOnInit(): void {
    this.produitService.getProduits().subscribe({
      next: () => this.erreur.set(''),
      error: () => this.erreur.set('Impossible de charger les produits. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }

  onBasculerFavori(id: string): void {
    this.favoriService.basculer(id);
  }

  onAjouterAuPanier(produit: Produit): void {
    this.panierService.ajouter(produit);
  }

  onVider(): void {
    this.favoriService.vider();
  }
}
