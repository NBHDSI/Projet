import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, minLength, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Livraison } from '../../models/produit';
import { TtcPipe } from '../../pipes/ttc-pipe';
import { AuthService } from '../../services/auth-service';
import { CommandeService } from '../../services/commande-service';
import { PanierService } from '../../services/panier-service';

@Component({
  selector: 'app-panier',
  imports: [CurrencyPipe, PercentPipe, TtcPipe, RouterLink, FormRoot, FormField],
  templateUrl: './panier.html'
})
export class Panier implements OnInit {
  private readonly panierService = inject(PanierService);
  private readonly commandeService = inject(CommandeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly lignes = this.panierService.lignes;
  readonly total = this.panierService.total;
  readonly nombreArticles = this.panierService.nombreArticles;

  readonly livraisonModel = signal<Livraison>({
    nom: '',
    telephone: '',
    adresse: '',
    paiement: 'Paiement à la livraison'
  });

  readonly livraisonForm = form(this.livraisonModel, path => {
    required(path.nom, { message: 'Le nom est obligatoire' });
    required(path.telephone, { message: 'Le téléphone est obligatoire' });
    pattern(path.telephone, /^[0-9]{8}$/, { message: 'Le téléphone doit contenir 8 chiffres' });
    required(path.adresse, { message: 'L\'adresse est obligatoire' });
    minLength(path.adresse, 10, { message: 'L\'adresse doit contenir au moins 10 caractères' });
  });

  readonly remise = signal(0);
  readonly messageCode = signal('');
  readonly erreur = signal('');
  readonly commandePassee = signal(false);
  readonly idCommande = signal('');

  constructor() {
    effect(() => {
      if (this.authService.estClient() == false) {
        this.router.navigate(['/connexion'], { queryParams: { retour: '/panier' } });
      }
    });
  }

  ngOnInit(): void {
    const compte = this.authService.compte();
    if (compte != undefined) {
      this.livraisonForm.nom().value.set(compte.nom);
    }
  }

  totalApresRemise(): number {
    return this.total() * (1 - this.remise());
  }

  montantRemise(): number {
    return this.total() - this.totalApresRemise();
  }

  tvA(): number {
    return this.totalApresRemise() * 0.19;
  }

  numeroCommande(): string {
    const id = this.idCommande();
    if (id.length <= 6) {
      return id.toUpperCase();
    }
    return id.slice(-6).toUpperCase();
  }

  onAppliquerCode(code: string): void {
    const valeur = code.trim().toUpperCase();
    if (valeur == 'TECH10') {
      this.remise.set(0.1);
      this.messageCode.set('Code TECH10 appliqué : 10 % de remise.');
      return;
    }
    if (valeur == 'BIENVENUE5') {
      this.remise.set(0.05);
      this.messageCode.set('Code BIENVENUE5 appliqué : 5 % de remise.');
      return;
    }
    this.remise.set(0);
    this.messageCode.set('Code promo invalide.');
  }

  onAugmenter(id: string): void {
    this.panierService.augmenter(id);
  }

  onDiminuer(id: string): void {
    this.panierService.diminuer(id);
  }

  onRetirer(id: string): void {
    this.panierService.retirer(id);
  }

  onVider(): void {
    this.panierService.vider();
    this.remise.set(0);
    this.messageCode.set('');
  }

  onCommander(): void {
    this.erreur.set('');
    const compte = this.authService.compte();
    if (compte == undefined) {
      this.erreur.set('Vous devez vous connecter pour passer une commande.');
      return;
    }
    if (this.lignes().length == 0) {
      this.erreur.set('Votre panier est vide.');
      return;
    }
    if (this.livraisonForm().invalid()) {
      this.erreur.set('Veuillez compléter les informations de livraison.');
      return;
    }
    this.commandeService.passerCommande(compte, this.lignes(), this.livraisonModel(), this.remise()).subscribe({
      next: commande => {
        this.panierService.vider();
        this.remise.set(0);
        this.messageCode.set('');
        this.idCommande.set(commande.id);
        this.commandePassee.set(true);
      },
      error: () => this.erreur.set('La commande a échoué. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }
}
