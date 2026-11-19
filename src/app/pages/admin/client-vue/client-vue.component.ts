import { isExtensionAccepted } from "src/app/shared/utils/file-extension";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { SnackBarService } from 'app/core/auth/snackBar.service';
import { CoreService } from 'app/core/core/core.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CONSTANTES } from '../admin/model/constantes';
import { ClientVueService } from './client-vue.service';
import { SignatureClientComponent } from './signature-client/signature-client.component';



@Component({
    selector       : 'client-vue',
    templateUrl    : './client-vue.component.html',
    styleUrls: ['./client-vue.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientVueComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;
    panels: any[] = [];
    selectedPanel: string = 'info-client';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constantes = CONSTANTES;
    loader: boolean = false;
    drawerMode: 'side' | 'over';
    drawerOpened: boolean;
    menuData: any;
    privileges: any;
    data: any;
    paramsId: any;
    infosClient: any;
    isLoading = false;
    menuPP: any;
    menuPM: any;
    menuPMACTIONNAIRE:any;
    typeClient: boolean;
    noImage = '';
    noImageStore = '';
    typePM;
    dialogRef: any;
    loaderImg: boolean = false;
    attributComplementaires: any=[];

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private route: ActivatedRoute,
        private coreService: CoreService,
        private snackbar: SnackBarService,
        private clientServive: ClientVueService,
        private _matDialog: MatDialog,
    )
    {
        this.menuData = [
            {
                title   : 'Gestion',
                children: [
                    {
                        id   : 'info-client',
                        title: 'Client',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'personne-lie',
                        title: 'Personnes liées',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'signataires',
                        title: 'Signataires',
                        icon : 'heroicons_outline:users',
                    },
                    {
                        id   : 'groupement',
                        title: 'Membres groupement',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'actionnaire',
                        title: 'Actionnaire',
                        icon : 'heroicons_outline:user-circle',
                    },
                    {
                        id   : 'frais',
                        title: 'Frais',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'transfert',
                        title: 'Transfert',
                        icon : 'heroicons_outline:arrow-narrow-right',
                    },
                    {
                        id   : 'audit',
                        title: 'Audit Log',
                        icon : 'heroicons_outline:document-text',
                    }

                ]
            },
            {
                title   : 'Produit',
                children: [
                    {
                        id   : 'compte',
                        title: 'Compte',
                        icon : 'mat_outline:account_balance',
                    },
                    {
                        id   : 'demande',
                        title: 'Demande de crédit',
                        icon : 'heroicons_outline:document-text',
                    },
                    {
                        id   : 'permanent',
                        title: 'Virement permanent',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'credit',
                        title: 'Crédit',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'epargne',
                        title: 'Depot terme',
                        icon : 'mat_outline:account_balance',
                    },
                    {
                        id   : 'wallet',
                        title: 'Wallet',
                        icon : 'mat_outline:account_balance_wallet',
                    },
                    {
                        id   : 'decouvert',
                        title: 'Découvert',
                        icon : 'heroicons_outline:cash',
                    },

                ]
            },
            {
                title   : 'Rapport',
                children: [
                    {
                        id   : 'fiche-client',
                        title: 'Fiche client',
                        icon : 'heroicons_outline:document-text',
                    },

                ]
            }
        ];


        this.menuPP = [
            {
                title   : 'Gestion',
                children: [
                    {
                        id   : 'info-client',
                        title: 'Client',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'bureau',
                        title: 'Personnes liées',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'frais',
                        title: 'Frais',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'transfert',
                        title: 'Transfert',
                        icon : 'heroicons_outline:arrow-narrow-right',
                    },
                    {
                        id   : 'audit',
                        title: 'Audit Log',
                        icon : 'heroicons_outline:document-text',
                    }

                ]
            },
            {
                title   : 'Produit',
                children: [
                    {
                        id   : 'compte',
                        title: 'Compte',
                        icon : 'mat_outline:account_balance',
                    },
                    {
                        id   : 'demande',
                        title: 'Demande de crédit',
                        icon : 'heroicons_outline:document-text',
                    },
                    {
                        id   : 'permanent',
                        title: 'Virement permanent',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'credit',
                        title: 'Crédit',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'epargne',
                        title: 'Depot Terme',
                        icon : 'mat_outline:account_balance',
                    },

                    {
                        id   : 'wallet',
                        title: 'Wallet',
                        icon : 'mat_outline:account_balance_wallet',
                    },
                    {
                        id   : 'decouvert',
                        title: 'Découvert',
                        icon : 'heroicons_outline:cash',
                    },

                ]
            },
            {
                title   : 'Rapport',
                children: [
                    {
                        id   : 'fiche-client',
                        title: 'Fiche client',
                        icon : 'heroicons_outline:document-text',
                    },

                ]
            }
        ];
        this.menuPM = [
            {
                title   : 'Gestion',
                children: [
                    {
                        id   : 'info-client',
                        title: 'Client',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'bureau',
                        title: 'Personnes liées',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'frais',
                        title: 'Frais',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'transfert',
                        title: 'Transfert',
                        icon : 'heroicons_outline:arrow-narrow-right',
                    },
                    {
                        id   : 'audit',
                        title: 'Audit Log',
                        icon : 'heroicons_outline:document-text',
                    },
                    {
                        id   : 'signataires',
                        title: 'Signataires',
                        icon : 'heroicons_outline:users',
                    },
                    {
                        id   : 'groupement',
                        title: 'Membres groupement',
                        icon : 'heroicons_outline:user-group',
                    }

                ]
            },
            {
                title   : 'Produit',
                children: [
                    {
                        id   : 'compte',
                        title: 'Compte',
                        icon : 'mat_outline:account_balance',
                    },
                    {
                        id   : 'demande',
                        title: 'Demande de crédit',
                        icon : 'heroicons_outline:document-text',
                    },
                    {
                        id   : 'permanent',
                        title: 'Virement permanent',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'credit',
                        title: 'Crédit',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'epargne',
                        title: 'Épargne',
                        icon : 'mat_outline:account_balance',
                    },
                    {
                        id   : 'wallet',
                        title: 'Wallet',
                        icon : 'mat_outline:account_balance_wallet',
                    },
                    {
                        id   : 'decouvert',
                        title: 'Découvert',
                        icon : 'heroicons_outline:cash',
                    },

                ]
            },
            {
                title   : 'Rapport',
                children: [
                    {
                        id   : 'fiche-client',
                        title: 'Fiche client',
                        icon : 'heroicons_outline:document-text',
                    }

                ]
            }
        ];
        this.menuPMACTIONNAIRE = [
            {
                title   : 'Gestion',
                children: [
                    {
                        id   : 'info-client',
                        title: 'Client',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'bureau',
                        title: 'Personnes liées',
                        icon : 'heroicons_outline:user-group',
                    },
                    {
                        id   : 'frais',
                        title: 'Frais',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'transfert',
                        title: 'Transfert',
                        icon : 'heroicons_outline:arrow-narrow-right',
                    },
                    {
                        id   : 'audit',
                        title: 'Audit Log',
                        icon : 'heroicons_outline:document-text',
                    },
                    {
                        id   : 'signataires',
                        title: 'Signataires',
                        icon : 'heroicons_outline:users',
                    },
                    {
                        id   : 'actionnaire',
                        title: 'Actionnaire',
                        icon : 'heroicons_outline:user-circle',
                    },

                ]
            },
            {
                title   : 'Produit',
                children: [
                    {
                        id   : 'compte',
                        title: 'Compte',
                        icon : 'mat_outline:account_balance',
                    },
                    {
                        id   : 'demande',
                        title: 'Demande de crédit',
                        icon : 'heroicons_outline:document-text',
                    },
                    {
                        id   : 'permanent',
                        title: 'Virement permanent',
                        icon : 'heroicons_outline:cash',
                    },{
                        id   : 'credit',
                        title: 'Crédit',
                        icon : 'heroicons_outline:cash',
                    },
                    {
                        id   : 'epargne',
                        title: 'Épargne',
                        icon : 'mat_outline:account_balance',
                    },
                    {
                        id   : 'wallet',
                        title: 'Wallet',
                        icon : 'mat_outline:account_balance_wallet',
                    },
                    {
                        id   : 'decouvert',
                        title: 'Découvert',
                        icon : 'heroicons_outline:cash',
                    },

                ]
            },
            {
                title   : 'Rapport',
                children: [
                    {
                        id   : 'fiche-client',
                        title: 'Fiche client',
                        icon : 'heroicons_outline:document-text',
                    }

                ]
            }
        ];

        this.route.params.subscribe((params) => {
            this.paramsId = params['id'];
        });
        const panel = this.coreService.decriptDataToLocalStorage('CD-@--120');
        this.selectedPanel = panel;
        this.getClient(this.paramsId);
        this.getAttributComplementaireClient(this.paramsId);
    }




    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        // Setup available panels
        this.panels = [
            {
                id         : 'compte',
                icon       : 'heroicons_outline:user-circle',
                title      : 'Compte',
                description: ''
            },
            {
                id         : 'bureau',
                icon       : 'heroicons_outline:lock-closed',
                title      : 'Bureaux',
                description: ''
            },
            {
                id         : 'role',
                icon       : 'heroicons_outline:credit-card',
                title      : 'Rôle',
                description: ''
            },
            {
                id         : 'caisse',
                icon       : 'heroicons_outline:bell',
                title      : 'Caisse',
                description: ''
            },
            {
                id         : 'plafond',
                icon       : 'heroicons_outline:user-group',
                title      : 'Plafond',
                description: ''
            }
        ];

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    getClient(Id) {
        this.isLoading = true;
        this.coreService.getElement(Id,'client').subscribe((resp) => {
          if (resp[this.constantes.RESPONSE_CODE] === this.constantes.HTTP_STATUS.SUCCESSFUL) {
             this.isLoading = false;
            this.infosClient = resp[this.constantes.RESPONSE_DATA];
              this.typePM = this.infosClient.typeClient.libelle;
            this._changeDetectorRef.markForCheck();
              this.coreService.encriptDataToLocalStorage('CD-@--119', this.infosClient);
            if(this.infosClient?.typeClient?.typePersonne == this.constantes.CLIENT.PP)
            {
                this.menuData = this.menuPP;
                this.typeClient = true;
                document.getElementById('c_mat_drawerId').style.height = '733px';
                document.getElementById('heighContentRightId').style.height = '733px';
                if(this.infosClient?.personnePhysique?.photo != null)
                {
                    this.noImage = this.infosClient?.personnePhysique?.photo;
                }
            }
            else if(this.infosClient?.typeClient?.typePersonne == this.constantes.CLIENT.PM)
            {
                if(this.typePM) {
                    if (this.typePM != 'Entreprise') {
                        document.getElementById('c_mat_drawerId').style.height = '878px';
                        document.getElementById('heighContentRightId').style.height = '878px';
                        this.menuData = this.menuPM;
                        this.typeClient = false;
                        if (this.infosClient?.personneMorale?.logo != null) {
                            this.noImage = this.infosClient?.personneMorale?.logo;
                        }
                    } else if (this.typePM == 'Entreprise') {
                        document.getElementById('c_mat_drawerId').style.height = '878px';
                        document.getElementById('heighContentRightId').style.height = '878px';
                        this.menuData = this.menuPMACTIONNAIRE;
                        this.typeClient = false;
                        if (this.infosClient?.personneMorale?.logo != null) {
                            this.noImage = this.infosClient?.personneMorale?.logo;
                        }
                    }
                }
            }
            this._changeDetectorRef.markForCheck();
          } else {
             this.isLoading = false;
          }
        }, () => {
          this.isLoading = false;
        });
      }

      getAttributComplementaireClient(infosClient) {
            this.isLoading = true;
            const data={
                'natureAttribut': 'CLIENT',
                'referenceObjet': infosClient
            };
           this.coreService.getAttributComplementaire(data,'attribut-complementaire/mine').subscribe((resp) => {
             if (resp[this.constantes.RESPONSE_CODE] === this.constantes.HTTP_STATUS.SUCCESSFUL) {
                this.isLoading = false;
               this.attributComplementaires = resp[this.constantes.RESPONSE_DATA];
               this._changeDetectorRef.markForCheck();
             } else {
                this.isLoading = false;
             }
           }, () => {
             this.isLoading = false;
           });
         }



    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void
    {
        this.coreService.encriptDataToLocalStorage('CD-@--129', null);
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    getFirstElementWord(value) {

        if (value) {
            return value.match(/(?<=(\s|^))[a-z]/gi).join('').toUpperCase();
        }
      }


      changeClient(type): void {
        let mes;
        if(type == 'demission') {
            mes = 'démissionner';
        }
        else if(type == 'validation') {
            mes = 'valider';
        } else {
            mes = 'adhérer';
        }
        this.snackbar.showConfirmation('Voulez-vous vraiment faire '+mes+' ce client ?').then((result) => {
          if (result['value'] == true) {
            this.isLoading = true;
            this.loader = true;
            let url;
            let message;
            if(type == 'demission') {
                url = 'client-demission';
                message = 'Démission effectuée avec succés';
            }
            else if(type == 'validation') {
                url = 'client-validation';
                message = 'Validation effectuée avec succés';
            } else {
                url = 'client-adhesion';
                message = 'Adhésion effectuée avec succés';
            }
            this.clientServive.changeClient(url,this.paramsId)
              .subscribe(
                (response) => {
                  if (response['status'] == 'OK') {
                    this.isLoading = false;
                    this.loader = false;
                    this.snackbar.openSnackBar(message, 'OK',['mycssSnackbarGreen']);
                    this.getClient(this.paramsId);
                  } else {
                    this.snackbar.openSnackBar(response['message'], 'OK',['mycssSnackbarRed']);
                  }
                },
                (error) => {
                  this.isLoading = false;
                  this.loader = false;
                    this.snackbar.showErrors(error);
                }
              );
          }
        });
      }

      selectOnFile(evt, type, name) {
        let accept = [];
        let extension = '';
        if (type === 'photo_profile') {
          accept = ['.png', '.PNG', '.jpg', '.JPG'];
          extension = 'une image';

        }
        for (const file of evt.target.files) {
          const index = file.name.lastIndexOf('.');
          const strsubstring = file.name.substring(index, file.name.length);
          const ext = strsubstring;
          // Verification de l'extension du ficihier est valide
          if (!isExtensionAccepted(accept, strsubstring)) {
            this.snackbar.openSnackBar('Ce fichier ' + file.name + ' n\'est ' + extension, 'OK',['mycssSnackbarRed']);
            return;
          } else {
            // recuperation du fichier et conversion en base64
            const reader = new FileReader();
            reader.onload = (e: any) => {
              if (type === 'photo_profile') {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                  const docBase64Path = e.target.result;

                  if (ext === '.png' || ext === '.PNG' || ext === '.jpg' || ext === '.JPG' || ext === '.jpeg' || ext === '.JPEG') {
                    this.saveStoreFile(file,type);
                  }


                };
              }


            };
            reader.readAsDataURL(file);
          }
        }

      }



    saveStoreFile(file, type) {
        let formData = new FormData();
        formData.append('file', file);
        this._changeDetectorRef.detectChanges();
        const dataFile = {'file': file};
        this.clientServive.saveStoreFile('store-file', formData).subscribe((resp) => {
            if (resp) {
                this.noImageStore = resp['urlprod'];
                this.saveFile(this.noImageStore,type);
                this._changeDetectorRef.detectChanges();
                // this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK', ['mycssSnackbarGreen']);
            }
        }, (error) => {
            this.snackbar.showErrors(error);
        });
    }


      signatureClient(): void {
        this.dialogRef = this._matDialog.open(SignatureClientComponent, {
          autoFocus: true,
          width: '35rem',
          panelClass: 'event-form-dialog',
          disableClose: true,
          data: {
            action: 'new',
            client: this.infosClient
          }
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            this.getClient(this.paramsId);
        });
      }


      saveFile(file, type) {
          let id;
          let url;
          if(this.infosClient?.typeClient?.typePersonne== "PM"){
            id = this.infosClient?.personneMorale?.id;
            url= 'personne-morale/';
          }else if(this.infosClient?.typeClient?.typePersonne == "PP") {
              id = this.infosClient?.personnePhysique?.id;
              url='personne-physique/'
          }
        this.loaderImg = true;
        this._changeDetectorRef.detectChanges();
        const dataFile = this.infosClient?.typeClient?.typePersonne == "PP" ? { 'photo': file} : { 'logo': file};
           this.clientServive.updateEntity(url + id ,dataFile).subscribe((resp) => {
            if(resp[this.constantes.RESPONSE_CODE] === this.constantes.HTTP_STATUS.SUCCESSFUL){
               if (this.infosClient?.typeClient?.typePersonne == "PP"){
                    this.noImage = resp[this.constantes.RESPONSE_DATA]['photo'];
                }else if(this.infosClient?.typeClient?.typePersonne== "PM"){
                    this.noImage = resp[this.constantes.RESPONSE_DATA]['logo'];
                }
                 this.loaderImg = false;
                 this._changeDetectorRef.detectChanges();
             this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK',['mycssSnackbarGreen']);
            }
           }, (error) => {
            this.loaderImg = false;
               this.snackbar.showErrors(error);
           });
         }





}
