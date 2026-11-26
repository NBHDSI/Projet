import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { applyEach, form, FormField, FormRoot, maxLength, min, minLength, pattern, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Caracteristique, Produit } from '../../models/produit';
import { ProduitService } from '../../services/produit-service';

@Component({
  selector: 'app-produit-form',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './produit-form.html'
})
export class ProduitForm implements OnInit {
  private readonly produitService = inject(ProduitService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly idProduit = signal('');
  readonly erreur = signal('');

  readonly modeEdition = computed(() => {
    if (this.idProduit() != '') {
      return true;
    }
    return false;
  });

  readonly produitModel = signal<Produit>({
    id: '',
    nom: '',
    photo: '',
    prix: 0,
    disponible: true,
    dateSortie: this.dateDuJour(),
    caracteristiques: [],
    categorie: '',
    description: ''
  });

  readonly produitForm = form(this.produitModel, path => {
    required(path.nom, { message: 'Le nom est obligatoire' });
    minLength(path.nom, 3, { message: 'Le nom doit contenir au moins 3 caractères' });
    maxLength(path.nom, 60, { message: 'Le nom doit contenir au maximum 60 caractères' });
    pattern(path.nom, /^[A-Za-zÀ-ÿ].+$/, { message: 'Le nom doit commencer par une lettre' });
    required(path.categorie, { message: 'La catégorie est obligatoire' });
    required(path.prix, { message: 'Le prix est obligatoire' });
    min(path.prix, 1, { message: 'Le prix doit être au moins 1 DT' });
    required(path.photo, { message: 'La photo est obligatoire' });
    required(path.dateSortie, { message: 'La date de sortie est obligatoire' });
    maxLength(path.description, 200, { message: 'La description doit contenir au maximum 200 caractères' });
    applyEach(path.caracteristiques, caracteristique => {
      required(caracteristique.nom, { message: 'Le nom de la caractéristique est obligatoire' });
      required(caracteristique.valeur, { message: 'La valeur de la caractéristique est obligatoire' });
    });
  });

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(parametres => {
      const id = parametres.get('id');
      if (id != null) {
        this.idProduit.set(id);
        this.erreur.set('');
        this.produitService.getProduitById(id).subscribe({
          next: produit => this.produitModel.set(produit),
          error: () => this.erreur.set('Produit introuvable.')
        });
      }
    });
  }

  private dateDuJour(): Date {
    const maintenant = new Date();
    return new Date(Date.UTC(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()));
  }

  titrePage(): string {
    if (this.modeEdition()) {
      return 'Modifier un produit';
    }
    return 'Ajouter un produit';
  }

  onAjouterCaracteristique(): void {
    this.produitModel.update(produit => ({
      ...produit,
      caracteristiques: [...produit.caracteristiques, { nom: '', valeur: '' }]
    }));
  }

  onSupprimerCaracteristique(index: number): void {
    const liste: Caracteristique[] = [];
    let position = 0;
    for (const caracteristique of this.produitModel().caracteristiques) {
      if (position != index) {
        liste.push(caracteristique);
      }
      position = position + 1;
    }
    this.produitModel.update(produit => ({ ...produit, caracteristiques: liste }));
  }

  onSubmit(): void {
    this.erreur.set('');
    const produit = this.produitModel();
    if (this.modeEdition()) {
      this.produitService.modifierProduit(produit).subscribe({
        next: () => this.router.navigate(['/admin/gestion/produits']),
        error: () => this.erreur.set('La modification a échoué.')
      });
    } else {
      const nouveau: Omit<Produit, 'id'> = {
        nom: produit.nom,
        photo: produit.photo,
        prix: produit.prix,
        disponible: produit.disponible,
        dateSortie: produit.dateSortie,
        caracteristiques: produit.caracteristiques,
        categorie: produit.categorie,
        description: produit.description
      };
      this.produitService.ajouterProduit(nouveau).subscribe({
        next: () => {
          this.produitModel.set({
            id: '',
            nom: '',
            photo: '',
            prix: 0,
            disponible: true,
            dateSortie: this.dateDuJour(),
            caracteristiques: [],
            categorie: '',
            description: ''
          });
          this.router.navigate(['/admin/gestion/produits']);
        },
        error: () => this.erreur.set("L'ajout a échoué.")
      });
    }
  }
}
