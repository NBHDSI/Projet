import { Component, effect, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-mot-de-passe',
  imports: [FormRoot, FormField],
  templateUrl: './mot-de-passe.html'
})
export class MotDePasse {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.connecte() == false) {
        if (this.router.url.includes('/admin')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/connexion']);
        }
      }
    });
  }

  readonly motDePasseModel = signal<{ ancien: string; nouveau: string; confirmation: string }>({
    ancien: '',
    nouveau: '',
    confirmation: ''
  });

  readonly motDePasseForm = form(this.motDePasseModel, path => {
    required(path.ancien, { message: 'L\'ancien mot de passe est obligatoire' });
    required(path.nouveau, { message: 'Le nouveau mot de passe est obligatoire' });
    minLength(path.nouveau, 6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    required(path.confirmation, { message: 'La confirmation est obligatoire' });
  });

  readonly message = signal('');
  readonly erreur = signal('');

  onSubmit(): void {
    this.message.set('');
    this.erreur.set('');
    const valeurs = this.motDePasseModel();
    if (valeurs.nouveau != valeurs.confirmation) {
      this.erreur.set('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    this.authService.changerMotDePasse(valeurs.ancien, valeurs.nouveau).subscribe({
      next: reussi => {
        if (reussi) {
          this.message.set('Mot de passe modifié avec succès.');
          this.motDePasseModel.set({ ancien: '', nouveau: '', confirmation: '' });
          this.motDePasseForm().reset();
        } else {
          this.erreur.set('Ancien mot de passe incorrect.');
        }
      },
      error: () => this.erreur.set('La modification a échoué. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }
}
