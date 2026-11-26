import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Commande } from '../../models/produit';
import { AuthService } from '../../services/auth-service';
import { CommandeService } from '../../services/commande-service';

@Component({
  selector: 'app-mes-commandes',
  imports: [CurrencyPipe, DatePipe, PercentPipe, RouterLink],
  templateUrl: './mes-commandes.html'
})
export class MesCommandes implements OnInit {
  private readonly commandeService = inject(CommandeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly commandes = this.commandeService.commandes;
  readonly erreur = signal('');

  constructor() {
    effect(() => {
      if (this.authService.estClient() == false) {
        this.router.navigate(['/connexion'], { queryParams: { retour: '/mes-commandes' } });
      }
    });
  }

  ngOnInit(): void {
    const compte = this.authService.compte();
    if (compte != undefined) {
      this.commandeService.getCommandes(compte.email).subscribe({
        next: () => this.erreur.set(''),
        error: () => this.erreur.set('Impossible de charger vos commandes. Vérifiez que le serveur JSON est démarré (npm run db).')
      });
    }
  }

  nombreArticles(commande: Commande): number {
    let total = 0;
    for (const ligne of commande.lignes) {
      total = total + ligne.quantite;
    }
    return total;
  }
}
