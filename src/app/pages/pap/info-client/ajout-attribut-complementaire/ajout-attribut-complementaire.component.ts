import { isExtensionAccepted } from "src/app/shared/utils/file-extension";
import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';
import { CoreService } from 'src/app/shared/core/core.service';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { CONSTANTES } from 'src/app/shared/models/constantes';


@Component({
    selector: 'app-ajout',
    templateUrl: './ajout-attribut-complementaire.component.html',
    standalone: true,
    imports:[AngularMaterialModule],
    styleUrls: ['./ajout-attribut-complementaire.component.scss']
})
export class AjoutAttributComplementaireComponent {
    compteForm: UntypedFormGroup;
    isLoading: boolean = false;
    action: string;
    dialogTitle: string;
    typeAttributs: Array<any> = [];
    client;
    attribut;
    valeurs = [{name: 'oui', value: 'OUI'}, {name: 'non', value: 'NON'}];
    profile;
    constantes = CONSTANTES;
    isBoolean: boolean = false;
    isFile: boolean = false;
    isListe: boolean = false;
    type;
    dataType;
    listAttribut = [];
    fileName: string = '';
    fileSelected = '';
    errorFile = 'Veuillez choisir l\'attribut complémentaire';
    loaderImg: boolean = false;
    noImage = '';
    selectedTypeAttribut: any
    isValeur: boolean;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private coreService: CoreService,
        public matDialogRef: MatDialogRef<AjoutAttributComplementaireComponent>,
        @Inject(MAT_DIALOG_DATA) _data,
       // private compteGeneralService: CompteGeneralService,
        private _changeDetectorRef: ChangeDetectorRef,
       // private clientService: ClientVueService,
        private snackbar: SnackBarService
    ) {
        // Set the defaults
        this.action = _data.action;
        this.client = _data.client;
        this.type = _data.type;
        this.attribut = _data.attribut;
        this.listAttribut = _data.listAttribut;
        if (this.action == 'new') {
            this.dialogTitle = 'Ajout attribut complémentaire';
            this.compteForm = this.initForm();
            this.ListTypeAttribut();
        } else if (this.action == 'edit') {
            this.selectedTypeAttribut = this.attribut.typeAttribut;
            this.dataType = this.attribut.typeAttribut.dataType;
            this.dialogTitle = 'Modifier attribut complémentaire';
            if (this.dataType == 'LISTE') {
                this.isValeur = false;
                this.isListe = true;
                this.isFile = false;
                this.isBoolean = false;
                this.attribut.valeur = this.attribut.valeur ? this.attribut.valeur.split(",") : [];

            }
            this.compteForm = this.initForm(this.attribut);

            if (this.dataType == 'FILE') {
                this.isValeur = false;
                this.noImage = this.compteForm.get('valeur').value;
            }
            if (this.dataType == 'BOOLEAN') {
                this.isValeur = false;
            }

            this.ListTypeAttributUpdate();
        }
    }

    initForm(attribut?): UntypedFormGroup {
        return this.formBuilder.group({
            typeAttribut: [attribut ? attribut.typeAttribut.id : '', [Validators.required]],
            valeur: [attribut ? attribut.valeur : '', [Validators.required]],
            referenceObjet: [this.client ? this.client.id : '', [Validators.required]],
            contentType: [attribut ? attribut.contentType : '', []]
        });
    }

    //cette fonction permet de verifier si le formulaire est valid ou pas
    checkRecap(type) {
        if (this.compteForm.invalid) {
            this.checkValidity(this.compteForm);
        } else {
            if (type == 'new') {
                this.ajoutAttributComplementaire();
            } else if (type == 'edit') {
                this.modifierAttributComplementaire();
            }
        }
    }

    //cette fonction permet de verifier les champs obligatoires
    checkValidity(g: UntypedFormGroup) {
        Object.keys(g.controls).forEach((key) => {
            g.get(key).markAsDirty();
        });
        Object.keys(g.controls).forEach((key) => {
            g.get(key).markAsTouched();
        });
        Object.keys(g.controls).forEach((key) => {
            g.get(key).updateValueAndValidity();
        });
    }

    selectAttribut(typeAttribut) {
        this.selectedTypeAttribut = typeAttribut;
        if (typeAttribut.dataType == 'BOOLEAN') {
            this.isListe = false;
            this.isBoolean = true;
            this.isFile = false;
            this.isValeur = false;
        } else if (typeAttribut.dataType == 'FILE') {
            this.isListe = false;
            this.isFile = true;
            this.isBoolean = false;
            this.isValeur = false;
        } else if (typeAttribut.dataType == 'LISTE') {
            this.isListe = true;
            this.isFile = false;
            this.isBoolean = false;
            this.isValeur = false;

        } else {
            this.isValeur = true;
            this.isListe = false;
            this.isBoolean = false;
            this.isFile = false;
        }
    }

    selectOnFile(evt, type, name) {
        this.fileSelected = evt.target.files[0].name;
        let file = evt.target.files[0];
        let accept = [];
        let extension = '';
        accept = ['.png', '.PNG', '.jpg', '.JPG', '.jpeg', '.JPEG', '.pdf', '.PDF', '.doc', '.DOC', '.docx', '.DOCX', '.docm', '.DOCM'];
        extension = 'une image';

        for (const file of evt.target.files) {
            const index = file.name.lastIndexOf('.');
            const strsubstring = file.name.substring(index, file.name.length);
            const ext = strsubstring;
            // Verification de l'extension du ficihier est valide
            if (!isExtensionAccepted(accept, strsubstring)) {
                this.snackbar.openSnackBar('Ce fichier ' + file.name + ' n\'est ' + extension, 'OK', ['mycssSnackbarRed']);
                return;
            } else {
                // recuperation du fichier et conversion en base64
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.saveFile(file, type);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    getSrc(item: any): string {
        switch (item) {
            case "application/pdf":
                return "assets/images/pdf.png"
            case "application/octet-stream":
                return "assets/images/icone-microsoft-word.png"
            default:
                return this.noImage;
        }
    }
    saveFile(file, type) {
        let formData = new FormData();
        formData.append('file', file);
        this.loaderImg = true;
        this._changeDetectorRef.detectChanges();
        const dataFile = {'file': file};
        // this.clientService.saveStoreFile('store-file', formData).subscribe((resp) => {
        //     if (resp) {
        //         this.noImage = resp['urlprod'];
        //         this.compteForm.get('valeur').setValue(this.noImage);
        //         this.compteForm.get('contentType').setValue(resp['contentType']);
        //         this.loaderImg = false;
        //         this._changeDetectorRef.detectChanges();
        //         this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK', ['mycssSnackbarGreen']);
        //     }
        // }, (error) => {
        //     this.loaderImg = false;
        //     this.snackbar.showErrors(error);
        // });
    }


    ajoutAttributComplementaire() {
        this.snackbar.showConfirmation('Voulez-vous ajouter cet attribut complémentaire ?').then((result) => {
            if (result['value'] == true) {
                this.isLoading = true;
                const data = this.compteForm.value;
                this.coreService.getAttributComplementaire(data, 'attribut-complementaire').subscribe((resp) => {
                    if (resp[this.constantes.RESPONSE_CODE] === this.constantes.HTTP_STATUS.SUCCESSFUL) {
                        this.snackbar.openSnackBar('Attribut complémentaire ajouté avec succés', 'OK', ['mycssSnackbarGreen']);
                        this.isLoading = false;
                        this.matDialogRef.close(resp);
                        this._changeDetectorRef.markForCheck();
                    } else {
                        this.isLoading = false;
                    }
                }, (error) => {
                    this.isLoading = false;
                });
            }
        });
    }

    modifierAttributComplementaire() {
        this.snackbar.showConfirmation('Voulez-vous modifier cet attribut complémentaire ?').then((result) => {
            if (result['value'] == true) {
                this.isLoading = true;
                const data = this.compteForm.value;
                this.coreService.updateAttributComplementaire(this.attribut.id, data).subscribe((resp) => {
                    if (resp[this.constantes.RESPONSE_CODE] === this.constantes.HTTP_STATUS.SUCCESSFUL) {
                        this.snackbar.openSnackBar('Attribut complémentaire modifié avec succés', 'OK', ['mycssSnackbarGreen']);
                        this.isLoading = false;
                        this.matDialogRef.close(resp);
                        this._changeDetectorRef.markForCheck();
                    } else {
                        this.isLoading = false;
                    }
                }, (error) => {
                    this.isLoading = false;
                });
            }
        });
    }

    //cette fonction permet d'afficher la liste des types attributs complementaires
    ListTypeAttribut() {
        // this.compteGeneralService.getAttributComplementaire().subscribe((response) => {
        //     const ids = this.listAttribut.map(el => el.typeAttribut.id);

        //     this.typeAttributs = response[this.constantes.RESPONSE_DATA].filter(el => el.natureAttribut == this.type);

        //     const oldWithFilter = this.typeAttributs.filter(el => !ids.includes(el.id));

        //     this.typeAttributs = [...oldWithFilter];
        // });
    }

    //cette fonction permet d'afficher la liste des types attributs complementaires
    ListTypeAttributUpdate() {
        // this.compteGeneralService.getAttributComplementaire().subscribe((response) => {
        //     this.typeAttributs = response[this.constantes.RESPONSE_DATA].filter(el => el.natureAttribut == this.type && el.id == this.attribut.typeAttribut.id);
        // });
    }


}
