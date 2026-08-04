import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatDrawer} from '@angular/material/sidenav';
import {MatStepper} from '@angular/material/stepper';
//import {SnackBarService} from 'app/core/auth/snackBar.service';
import * as moment from 'moment/moment';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';
import { CoreService } from 'src/app/shared/core/core.service';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { LocalService } from 'src/app/core/services/local.service';
//import {CoreService} from 'app/core/core/core.service';

@Component({
    selector: 'app-ajout',
    templateUrl: './ajout.component.html',
    styleUrls: ['./ajout.component.scss'],
    standalone: true,
    imports:[AngularMaterialModule,ReactiveFormsModule,CommonModule,MatDialogModule],
    //encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: MatDialogRef,
            useValue: [],
        },
        { provide: MAT_DIALOG_DATA, useValue: {} }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class AjoutPersonnePhysiqueComponent implements OnInit {
    panelOpenState = false;
    @ViewChild('drawer') drawer: MatDrawer;
    @ViewChild('stepper') private myStepper: MatStepper;
    dialogTitle: string;
    id: string;
    initForm: UntypedFormGroup;
    labelButton: string;
    suffixe: string = ' une personne physique';
    countries: any;
    sexe = [{name: 'Homme', id: 'M'}, {name: 'Femme', id: 'F'}];
    nrSelect;
    situationsMatrimoniales: any;
    naturePieces: any = [];
    capaciteJuridiques: any;
    dateDelivrance;
    regimeMatrimoniaux: any;
    professions: any;
    loader: boolean;
    action: string;
    minBirthDay: any;
    today = new Date();
    fields: any;
    canAdd: boolean;
    dataCheck;
    url = 'personne-physique';
    hasPhoneError: boolean;
    currentValue: any;
    countryChange: boolean = false;
    eventNumber: any;
    isFocus: unknown;
    errorCNI;
    newDate = new Date();
    emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    isValidOnWhatsApp: boolean = true;
    ng2TelOptions;
    idPiece;
    listeNoire:boolean=false;

    constructor(
        public matDialogRef: MatDialogRef<AjoutPersonnePhysiqueComponent>,
       @Inject(MAT_DIALOG_DATA) _data,
        private fb: UntypedFormBuilder,
        private coreService: CoreService,
        private snackbar: SnackBarService,
        private localService: LocalService,
        private changeDetectorRefs: ChangeDetectorRef
      )
         {
        if (_data?.action == 'new') {
            this.initForms();
            this.labelButton = 'Ajouter ';
        } else if (_data?.action == 'edit') {
            this.labelButton = 'Modifier ';
            this.id = _data.data.id;
            (_data.data.phoneNumber == _data.data.whatsappPhoneNumber) ? this.isValidOnWhatsApp = true : this.isValidOnWhatsApp = false;
            //this.initForms(_data.data);
          //  this.checkCNI();
        } else if (_data?.canAdd == false) {
            this.labelButton = 'Ajouter';
            this.dataCheck = _data.donnees;
        //  //   this.checkCNI();
         }
         this.initForms();

        this.action = _data?.action;
        // this.canAdd = _data.canAdd;
        // this.dialogTitle = this.labelButton + this.suffixe;
        // this.ng2TelOptions = {initialCountry: 'sn'};
    }

    checkValidOnWhatsApp($event): void {
        $event?.value == 1 ? this.isValidOnWhatsApp = true : this.isValidOnWhatsApp = false;
        if (this.isValidOnWhatsApp) {
            // const phoneCode = (this.initForm.get('phoneNumber')?.value)?.substring(1,4);
            this.initForm.get('whatsappPhoneNumber').setValue(this.initForm.get('phoneNumber').value);
            this.initForm.get('whatsappPhoneCode').setValue(this.initForm.get('phoneCode').value);
        } else {
            this.initForm.get('whatsappPhoneNumber').setValue(null);
            this.initForm.get('whatsappPhoneCode').setValue(this.initForm.get('phoneCode').value);
        }
    }

    ngOnInit(): void {
        //this.dateDelivrance = this.initForm.get('dateDelivrancePiece').value;
       // this.minBirthDay = moment().subtract(18, 'years');
      ////  this.getListPays();
       // this.getListSituationsMatrimoniales();
        //this.getListNaturePieces();
        //this.getListCapaciteJuridiques();
        //this.getListProfession();

    }

    goToStep(index) {
        this.myStepper.selectedIndex = index;
    }

    initForms(donnees?) {
        this.initForm = this.fb.group({
            prenom: this.fb.control(donnees ? donnees?.prenom : null, [Validators.required]),
            nom: this.fb.control(donnees ? donnees?.nom : null, [Validators.required]),
            dateNaissance: this.fb.control(donnees ? donnees?.dateNaissance : null, [Validators.required]),
            lieuNaissance: this.fb.control(donnees ? donnees?.lieuNaissance : null, [Validators.required]),
            villeNaissance: this.fb.control(donnees ? donnees?.villeNaissance : null, [Validators.required]),
            paysNaissance: this.fb.control(donnees ? donnees?.paysNaissance?.id : null, [Validators.required]),
            nationalite: this.fb.control(donnees ? donnees?.nationalite?.id : null, [Validators.required]),
            sexe: this.fb.control(donnees ? donnees?.sexe : null, [Validators.required]),
            situationMatrimoniale: this.fb.control(donnees ? donnees?.situationMatrimoniale?.id : null, [Validators.required]),
            naturePiece: this.fb.control(donnees ? donnees?.naturePiece?.id : (!this.canAdd) ? this.dataCheck?.nature : null, [Validators.required]),
            numeroPiece: this.fb.control(donnees ? donnees?.numeroPiece : (!this.canAdd) ? this.dataCheck?.numeroPiece : null, [Validators.required]),
            dateDelivrancePiece: this.fb.control(donnees ? donnees?.dateDelivrancePiece : null, [Validators.required]),
            dateValiditePiece: this.fb.control(donnees ? donnees?.dateValiditePiece : null, [Validators.required]),
            paysDelivrancePiece: this.fb.control(donnees ? donnees?.paysDelivrancePiece.id : null, [Validators.required]),
            lieuDelivrancePiece: this.fb.control(donnees ? donnees?.lieuDelivrancePiece : null, [Validators.required]),
            nomMere: this.fb.control(donnees ? donnees?.nomMere : null, [Validators.required]),
            prenomMere: this.fb.control(donnees ? donnees?.prenomMere : null, [Validators.required]),
            prenomPere: this.fb.control(donnees ? donnees?.prenomPere : null, [Validators.required]),
            prenomPersonneContact: this.fb.control(donnees ? donnees?.prenomPersonneContact : null, [Validators.required]),
            nomPersonneContact: this.fb.control(donnees ? donnees?.nomPersonneContact : null, [Validators.required]),
            capaciteJuridique: this.fb.control(donnees ? donnees?.capaciteJuridique?.id : null, [Validators.required]),
            // regimeMatrimonial: this.fb.control(donnees? donnees?.regimeMatrimonial?.id: null,[]),
            profession: this.fb.control(donnees ? donnees?.profession?.id : null, []),
            nonVoyant: this.fb.control(donnees ? donnees?.nonVoyant : false, [Validators.required]),
            illettre: this.fb.control(donnees ? donnees?.illettre : false, [Validators.required]),
            paysResidence: this.fb.control(donnees ? donnees?.paysResidence?.id : null, [Validators.required]),
            ville: this.fb.control(donnees ? donnees?.ville : null, [Validators.required]),
            adresse: this.fb.control(donnees ? donnees?.adresse : null, [Validators.required]),
            adresseEntreprise: this.fb.control(donnees ? donnees?.adresseEntreprise : null, [Validators.required]),
            phoneCode: this.fb.control(donnees ? donnees?.phoneCode : 221, []),
            whatsappPhoneCode: this.fb.control(donnees ? donnees?.whatsappPhoneCode : 221, []),
            phoneNumber: this.fb.control(donnees ? donnees?.phoneNumber : null, [Validators.required]),
            phoneNumberPersonneContact: this.fb.control(donnees ? donnees?.phoneNumberPersonneContact : null, [Validators.required]),
            whatsappPhoneNumber: this.fb.control(donnees ? donnees?.whatsappPhoneNumber : null),
            email: this.fb.control(donnees ? donnees?.email : null, [Validators.pattern(this.emailPattern)]),
            emailPersonneContact: this.fb.control(donnees ? donnees?.emailPersonneContact : null, [Validators.pattern(this.emailPattern)]),
        });
    }

    refresh(): void {
        this.initForm.get('numeroPiece').setValue(null);
        this.initForm.get('dateDelivrancePiece').setValue(null);
        this.initForm.get('dateValiditePiece').setValue(null);
    }
    checkCNI() {
        this.errorCNI = '';
        const fieldCNI = 'numeroPiece';
        if (this.initForm.get(fieldCNI).value && this.initForm.get('naturePiece').value) {
            const cni = this.initForm.get(fieldCNI).value.toString();
            const taille = cni.length;
            const type = this.initForm.get('naturePiece').value;
            const nombreCaractereMin = this.naturePieces.find(piece => piece?.id == type)?.nombreCaractereMin;
            const nombreCaractereMax = this.naturePieces.find(piece => piece?.id == type)?.nombreCaractereMax;
            if (taille < nombreCaractereMin || taille > nombreCaractereMax) {
                this.errorCNI = `Le numéro de pièce doit contenir ${nombreCaractereMin} ou ${nombreCaractereMax} caractères`;
            }
        }
    }
    // checkCNI() {
    //     const codePiece = this.naturePieces.find(el => el.id == this.initForm.get('naturePiece').value)?.code;
    //     this.errorCNI = "";
    //     let fieldCNI = 'numeroPiece';
    //     if(this.initForm.get('naturePiece').value) {
    //         this.idPiece = (this.initForm.get('naturePiece').value)['id'];
    //     }
    //     if (this.initForm.get(fieldCNI).value && this.initForm.get('sexe').value && this.initForm.get('naturePiece').value) {
    //         let cni = this.initForm.get(fieldCNI).value.toString();
    //         let taille = cni.length;
    //         const type = codePiece;
    //         const typ = this.initForm.get('naturePiece').value;
    //         let val = cni[0];
    //         const nombreCaractereMin = this.naturePieces.find(piece => piece?.id == typ)?.nombreCaractereMin;
    //         const nombreCaractereMax = this.naturePieces.find(piece => piece?.id == typ)?.nombreCaractereMax;
    //         if (type === 'CNI' || type === 'NP0001') {
    //             if (taille < nombreCaractereMin || taille > nombreCaractereMax) {
    //                 if (this.initForm.get('sexe').value == 'F' && val != '2') {
    //                     this.errorCNI = "Le numéro de pièce doit commencer par 2 pour une femme ";
    //                 }
    //                 if (this.initForm.get('sexe').value == 'M' && val != '1') {
    //                     this.errorCNI = "Le numéro de pièce doit commencer par 1 pour un homme ";
    //                 }
    //             } else {
    //                 this.errorCNI  = `Le numéro de pièce doit contenir ${nombreCaractereMin} ou ${nombreCaractereMax} caractères`;
    //
    //             }
    //         } else if (type === 'CIB') {
    //             if (taille === 17) {
    //                 if (this.initForm.get('sexe').value == 'F' && val != '2') {
    //                     this.errorCNI = "Le numéro de pièce doit commencer par 2 pour une femme ";
    //                 }
    //                 if (this.initForm.get('sexe').value == 'M' && val != '1') {
    //                     this.errorCNI = "Le numéro de pièce doit commencer par 1 pour un homme ";
    //                 }
    //             } else {
    //                 this.errorCNI = "Le numéro de pièce doit contenir 17 caractères"
    //             }
    //         } else if (type === 'PP' || type === 'NP0003') {
    //             if (taille !== 9) {
    //                 this.errorCNI = "Le numéro de pièce doit contenir 9 caractères";
    //             }
    //         }
    //     }
    // }
    get phoneValue(){
        return this.initForm.controls['phoneNumberPersonneContact']
    }

    checkDateDexpiration(evt) {
        this.initForm.get('dateValiditePiece').setValue('');
        const codePiece = this.naturePieces.find(el => el.id == this.initForm.get('naturePiece').value)?.code;
        if (this.initForm.get('dateDelivrancePiece').value !== '' && this.initForm.get('naturePiece').value !== '' && codePiece === 'CNI' || codePiece === 'NP0001') {
            let typeDePiece = this.initForm.get('naturePiece').value;
            let durreValidite = this.naturePieces.find(piece => piece?.id == typeDePiece)?.durreValidite;
            let dateDelivrance = moment(this.initForm.get('dateDelivrancePiece').value).add(durreValidite, 'years').subtract(1, 'day').toDate();
            this.initForm.get('dateValiditePiece').setValue(dateDelivrance);
            this.initForm.get('dateValiditePiece').updateValueAndValidity();
        }

    }

    getNationalite(value: any) {
        if (this.countries) {
            const liste = this.countries.filter(type => type.id == value);
            return liste.length != 0 ? liste[0]?.nationalite : value;
        }
    }

    getsituationMatrimoniale(value: any) {
        if (this.situationsMatrimoniales) {
            const liste = this.situationsMatrimoniales.filter(type => type.id == value);
            return liste.length != 0 ? liste[0]?.libelle : value;
        }
    }

    getcapaciteJuridique(value: any) {
        if (this.capaciteJuridiques) {
            const liste = this.capaciteJuridiques.filter(type => type.id == value);
            return liste.length != 0 ? liste[0]?.libelle : value;
        }
    }


    getPaysNaissance(value: any) {
        if (this.countries) {
            const liste = this.countries.filter(type => type.id == value);
            return liste.length != 0 ? liste[0]?.nom : value;
        }
    }

    getNaturePiece(value: any) {
        if (this.naturePieces) {
            const liste = this.naturePieces.filter(type => type.id == value);
            return liste.length != 0 ? liste[0]?.libelle : value;
        }
    }

    firstStep() {
        if (this.initForm.get('prenom').invalid || this.initForm.get('nom').invalid || this.initForm.get('dateNaissance').invalid || this.initForm.get('lieuNaissance').invalid || this.initForm.get('villeNaissance').invalid || this.initForm.get('paysNaissance').invalid || this.initForm.get('nationalite').invalid || this.initForm.get('situationMatrimoniale').invalid || this.initForm.get('capaciteJuridique').invalid || this.initForm.get('nonVoyant').invalid || this.initForm.get('illettre').invalid) {
            return false;
        } else {
            return true;
        }
    }

    secondStep() {
        if (this.initForm.get('naturePiece').invalid || this.initForm.get('numeroPiece').invalid || this.initForm.get('dateDelivrancePiece').invalid || this.initForm.get('dateValiditePiece').invalid || this.initForm.get('paysDelivrancePiece').invalid || this.initForm.get('lieuDelivrancePiece').invalid || this.initForm.get('prenomPere').invalid || this.initForm.get('prenomMere').invalid || this.initForm.get('nomMere').invalid || this.initForm.get('prenomPersonneContact').invalid || this.initForm.get('nomPersonneContact').invalid || this.initForm.get('emailPersonneContact').invalid || this.initForm.get('phoneNumberPersonneContact').invalid) {
            return false;
        } else {
            return true;
        }
    }

    getListPays() {
        this.coreService.list('pays', 0, 10000)
            .subscribe((response) => {
                if (response['responseCode'] === 200) {
                    this.countries = response['data'];
                    this.nrSelect = response['data'].filter(el => el.codeAlpha2 == 'SN' || el.codeAlpha2 == 'SEN').map(e => e.id)[0];
                    this.initForm.get('paysNaissance').setValue(this.nrSelect);
                    this.initForm.get('nationalite').setValue(this.nrSelect);
                    this.initForm.get('paysDelivrancePiece').setValue(this.nrSelect);
                    this.initForm.get('paysResidence').setValue(this.nrSelect);

                    this.changeDetectorRefs.markForCheck();
                }
            });
    }

    getListSituationsMatrimoniales() {
        this.coreService.listWithProject('situation-matrimoniale', 0, 10000, this.localService.getData("ProjectId"))
            .subscribe((response) => {
                if (response['responseCode'] === 200) {
                    this.situationsMatrimoniales = response['data'];
                    this.changeDetectorRefs.markForCheck();
                }
            });
    }

    getRegimeBySituation(situation) {
        if (situation) {
            this.regimeMatrimoniaux = situation.regimesMatrimonials;
        }
    }

    getListNaturePieces() {
        this.coreService.list('nature-piece', 0, 10000)
            .subscribe((response) => {
                if (response['responseCode'] === 200) {
                    this.naturePieces = response['data'];
                    this.changeDetectorRefs.markForCheck();
                }
            });
    }

    getListCapaciteJuridiques() {
        this.coreService.list('capacite-juridique', 0, 10000)
            .subscribe((response) => {
                if (response['responseCode'] === 200) {
                    this.capaciteJuridiques = response['data'];
                    this.changeDetectorRefs.markForCheck();
                }
            });
    }

    getListProfession() {
        this.coreService.list('profession', 0, 10000)
            .subscribe((response) => {
                if (response) {
                    this.professions = response['data'];
                    this.changeDetectorRefs.markForCheck();
                }
            });
    }

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

    listNoire(event?) {
        this.listeNoire = true;
        const montant=0;
        const compte =0;
        this.changeDetectorRefs.markForCheck();
        const data = {
            'compte': compte,
            'montant': montant
        };
        if (montant && compte) {
            this.coreService.addItem(data, 'verifier-liste-noire')
                .subscribe((response) => {
                    if (response['responseCode'] === 200) {
                        this.listeNoire = true;
                    } else if (response['responseCode'] === 400) {
                        this.listeNoire = false;
                    }
                }, (error) => {
                    if (error.status == 400) {
                        this.listeNoire = false;
                        this.changeDetectorRefs.markForCheck();
                    } else if (error.status == 200) {
                        this.listeNoire = true;
                    }
                });
        }
    }


    addItems() {
        // if(this.listeNoire){
            this.snackbar.showConfirmation('Voulez-vous vraiment ajouter cette personne physique ?')
                .then((result) => {
                    if (result['value'] == true) {
                        this.loader = true;
                        this.changeDetectorRefs.markForCheck();
                        const dateNaissance = moment(this.initForm.get('dateNaissance')?.value).format('YYYY-MM-DD');
                        this.initForm.get('dateNaissance')?.setValue(dateNaissance);
                        const dateDelivrancePiece = moment(this.initForm.get('dateDelivrancePiece')?.value).format('YYYY-MM-DD');
                        this.initForm.get('dateDelivrancePiece')?.setValue(dateDelivrancePiece);
                        const dateValiditePiece = moment(this.initForm.get('dateValiditePiece')?.value).format('YYYY-MM-DD');
                        this.initForm.get('dateValiditePiece')?.setValue(dateValiditePiece);
                        const value = this.initForm.value;
                        if (!this.countryChange) {
                            // const phoneCode = (this.initForm.get('phoneNumber')?.value)?.substring(1,4);
                            const phoneCode = '221';
                            value['phoneCode'] = phoneCode;
                            value['phoneNumber'] = this.initForm.get('phoneNumber')?.value;
                        } else {
                            value['phoneCode'] = this.eventNumber;
                            value['phoneNumber'] = this.currentValue;
                        }
                        if (!this.isValidOnWhatsApp) {
                            value['whatsappPhoneCode'] = this.initForm.get('whatsappPhoneCode').value;
                            value['whatsappPhoneNumber'] = this.initForm.get('whatsappPhoneNumber')?.value;
                        }
                        this.coreService.addItem(value, this.url).subscribe(
                            (resp) => {
                                if (resp['responseCode'] == 200) {
                                    this.snackbar.openSnackBar('Personne physique ajoutée avec succés', 'OK', ['mycssSnackbarGreen']);
                                    this.loader = false;
                                   // this.matDialogRef.close(resp['data']);
                                    this.changeDetectorRefs.markForCheck();
                                } else {
                                    this.loader = false;
                                    this.changeDetectorRefs.markForCheck();
                                }
                            },
                            (error) => {
                                this.loader = false;
                                this.changeDetectorRefs.markForCheck();
                                this.snackbar.showErrors(error);
                            });
                    }
                });
        // }else if(!this.listeNoire){
        //
        // }
    }

    updateItems() {
        this.snackbar.showConfirmation('Voulez-vous vraiment modifier cette personne physique ?').then((result) => {
            if (result['value'] == true) {
                this.loader = true;
                const value = this.initForm.value;
                this.coreService.updateItem(value, this.id, this.url).subscribe(
                    (resp) => {
                        if (resp) {
                            this.loader = false;
                           // this.matDialogRef.close(resp);
                            this.snackbar.openSnackBar('Personne physique modifiée avec succés', 'OK', ['mycssSnackbarGreen']);
                        } else {
                            this.loader = false;
                            this.snackbar.openSnackBar(resp['message'], 'OK', ['mycssSnackbarRed']);
                        }
                    },
                    (error) => {
                        this.loader = false;
                        this.loader = false;
                        this.snackbar.showErrors(error);
                    });
            }
        });

    }

    checkRecap(type) {
        if (this.initForm.invalid) {
            this.checkValidity(this.initForm);
        } else {
            if (this.canAdd == false) {
                this.addItems();
            }
            if (type == 'new') {
                this.addItems();
            } else if (type == 'edit') {
                this.updateItems();
            }
        }
    }
}
