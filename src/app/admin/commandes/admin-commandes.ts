import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Commande } from '../../models/produit';
import { CommandeService } from '../../services/commande-service';

@Component({
  selector: 'app-admin-commandes',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './admin-commandes.html'
})
export class AdminCommandes implements OnInit {
  private readonly commandeService = inject(CommandeService);

  readonly commandes = this.commandeService.commandes;
  readonly erreur = signal('');

  readonly nombreCommandes = computed(() => this.commandes().length);

  readonly chiffreAffaires = computed(() => {
    let total = 0;
    for (const commande of this.commandes()) {
      total = total + commande.total;
    }
    return total;
  });

  ngOnInit(): void {
    this.commandeService.getToutesCommandes().subscribe({
      next: () => this.erreur.set(''),
      error: () => this.erreur.set('Impossible de charger les commandes. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }

  onChangerStatut(commande: Commande, statut: string): void {
    this.erreur.set('');
    this.commandeService.changerStatut(commande, statut).subscribe({
      next: () => this.erreur.set(''),
      error: () => this.erreur.set('La mise à jour du statut a échoué. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }

  nombreArticles(commande: Commande): number {
    let total = 0;
    for (const ligne of commande.lignes) {
      total = total + ligne.quantite;
    }
    return total;
  }
}
