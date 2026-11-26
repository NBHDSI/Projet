import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-inscription',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './inscription.html'
})
export class Inscription {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly inscriptionModel = signal<{ nom: string; email: string; motDePasse: string; confirmation: string }>({
    nom: '',
    email: '',
    motDePasse: '',
    confirmation: ''
  });

  readonly inscriptionForm = form(this.inscriptionModel, path => {
    required(path.nom, { message: 'Le nom est obligatoire' });
    minLength(path.nom, 3, { message: 'Le nom doit contenir au moins 3 caractères' });
    required(path.email, { message: 'L\'email est obligatoire' });
    email(path.email, { message: 'Adresse email invalide' });
    required(path.motDePasse, { message: 'Le mot de passe est obligatoire' });
    minLength(path.motDePasse, 6, { message: 'Le mot de passe doit contenir au moins 6 caractères' });
    required(path.confirmation, { message: 'La confirmation est obligatoire' });
  });

  readonly erreur = signal('');

  onSubmit(): void {
    this.erreur.set('');
    const valeurs = this.inscriptionModel();
    if (valeurs.motDePasse != valeurs.confirmation) {
      this.erreur.set('La confirmation ne correspond pas au mot de passe.');
      return;
    }
    this.authService.inscrire(valeurs.nom, valeurs.email, valeurs.motDePasse).subscribe({
      next: messageErreur => {
        if (messageErreur == '') {
          this.router.navigate(['/']);
        } else {
          this.erreur.set(messageErreur);
        }
      },
      error: () => this.erreur.set('La création du compte a échoué. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }
}
