import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Produit } from '../../models/produit';
import { AuthService } from '../../services/auth-service';
import { FavoriService } from '../../services/favori-service';

@Component({
  selector: 'app-produit-item',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './produit-item.html'
})
export class ProduitItem {
  readonly produit = input.required<Produit>();
  readonly favoriDemande = output<string>();
  readonly ajoutDemande = output<Produit>();

  private readonly favoriService = inject(FavoriService);
  private readonly authService = inject(AuthService);

  readonly estClient = this.authService.estClient;

  classeDisponibilite(): string {
    if (this.produit().disponible) {
      return 'badge text-bg-success';
    }
    return 'badge text-bg-danger';
  }

  texteDisponibilite(): string {
    if (this.produit().disponible) {
      return 'Disponible';
    }
    return 'Rupture de stock';
  }

  classeCoeur(): string {
    if (this.favoriService.estFavori(this.produit().id)) {
      return 'bi bi-heart-fill text-danger';
    }
    return 'bi bi-heart';
  }

  onBasculerFavori(): void {
    this.favoriDemande.emit(this.produit().id);
  }

  onAjouterAuPanier(): void {
    this.ajoutDemande.emit(this.produit());
  }
}
