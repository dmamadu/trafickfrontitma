import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatDrawer, MatSidenavModule } from "@angular/material/sidenav";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { CONSTANTES } from "src/app/shared/models/constantes";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { MatDialog } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { InfoClientComponent } from "../info-client/info-client.component";

@Component({
  selector: "app-pip-detail",
  templateUrl: "./pip-detail.component.html",
  styleUrl: "./pip-detail.component.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [AngularMaterialModule, InfoClientComponent],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipDetailComponent {
  @ViewChild("drawer") drawer: MatDrawer;
  panels: any[] = [];
  selectedPanel: string = "info-client";
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constantes = CONSTANTES;
  loader: boolean = false;
  drawerMode: "side" | "over";
  drawerOpened: boolean;
  menuData: any;
  privileges: any;
  data: any;
  paramsId: any;
  infosPap: any;
  isLoading = false;
  menuPP: any;
  menuPM: any;
  menuPMACTIONNAIRE: any;
  typeClient: boolean;
  noImage = "";
  noImageStore = "";
  typePM;
  dialogRef: any;
  loaderImg: boolean = false;
  attributComplementaires: any = [];

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    // private _fuseMediaWatcherService: FuseMediaWatcherService,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private clientServive: ClientVueService,
    private localService :LocalService
  ) {
    this.menuData = [
      {
        title: "Gestion     ",
        children: [
          {
            id: "info-client",
            title: "Projets",
            icon: "heroicons_outline:user-group",
          },
          // {
          //   id: "personne-lie",
          //   title: "???",
          //   icon: "heroicons_outline:user-group",
          // },
          // {
          //   id: "signataires",
          //   title: "????",
          //   icon: "heroicons_outline:users",
          // },

        ],
      },

    ];

    this.menuPP = [
      {
        title: "Gestion",
        children: [
          {
            id: "info-client",
            title: "Client",
            icon: "bxs-edit",
          },
          {
            id: "bureau",
            title: "Personnes liées",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "frais",
            title: "Frais",
            icon: "heroicons_outline:cash",
          },
          {
            id: "transfert",
            title: "Transfert",
            icon: "heroicons_outline:arrow-narrow-right",
          },
          {
            id: "audit",
            title: "Audit Log",
            icon: "heroicons_outline:document-text",
          },
        ],
      },
    ];
    this.menuPM = [
      {
        title: "Gestion",
        children: [
          {
            id: "info-client",
            title: "Client",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "bureau",
            title: "Personnes liées",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "frais",
            title: "Frais",
            icon: "heroicons_outline:cash",
          },
          {
            id: "transfert",
            title: "Transfert",
            icon: "heroicons_outline:arrow-narrow-right",
          },
          {
            id: "audit",
            title: "Audit Log",
            icon: "heroicons_outline:document-text",
          },
          {
            id: "signataires",
            title: "Signataires",
            icon: "heroicons_outline:users",
          },
          {
            id: "groupement",
            title: "Membres groupement",
            icon: "heroicons_outline:user-group",
          },
        ],
      }
    ];
    this.menuPMACTIONNAIRE = [
      {
        title: "Gestion",
        children: [
          {
            id: "info-client",
            title: "Projets",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "bureau",
            title: "??? ",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "frais",
            title: "???",
            icon: "heroicons_outline:cash",
          },

        ],
      }
    ];

    this.route.params.subscribe((params) => {
      this.paramsId = params["id"];
    });
    const panel = this.coreService.decriptDataToLocalStorage("CD-@--120");
    this.selectedPanel = panel;
    // this.getClient(this.paramsId);
    //  this.getAttributComplementaireClient(this.paramsId);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Setup available panels
    this.panels = [
      {
        id: "compte",
        icon: "heroicons_outline:user-circle",
        title: "Compte",
        description: "",
      },
      {
        id: "bureau",
        icon: "heroicons_outline:lock-closed",
        title: "Bureaux",
        description: "",
      },
      {
        id: "role",
        icon: "heroicons_outline:credit-card",
        title: "Rôle",
        description: "",
      },

    ];
    this.getpap();
  }


  getAttributComplementaireClient(infosPap) {
    this.isLoading = true;
    const data = {
      natureAttribut: "CLIENT",
      referenceObjet: infosPap,
    };
    this.coreService
      .getAttributComplementaire(data, "attribut-complementaire/mine")
      .subscribe(
        (resp) => {
          if (
            resp[this.constantes.RESPONSE_CODE] ===
            this.constantes.HTTP_STATUS.SUCCESSFUL
          ) {
            this.isLoading = false;
            this.attributComplementaires = resp[this.constantes.RESPONSE_DATA];
            this._changeDetectorRef.markForCheck();
          } else {
            this.isLoading = false;
          }
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
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
  goToPanel(panel: string): void {
    this.coreService.encriptDataToLocalStorage("CD-@--129", null);
    this.selectedPanel = panel;

    // Close the drawer on 'over' mode
    if (this.drawerMode === "over") {
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
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getFirstElementWord(value) {
    if (value) {
      return value
        .match(/(?<=(\s|^))[a-z]/gi)
        .join("")
        .toUpperCase();
    }
  }

  changeClient(type): void {
    let mes;
    if (type == "demission") {
      mes = "démissionner";
    } else if (type == "validation") {
      mes = "valider";
    } else {
      mes = "adhérer";
    }
    this.snackbar
      .showConfirmation("Voulez-vous vraiment faire " + mes + " ce client ?")
      .then((result) => {
        if (result["value"] == true) {
          this.isLoading = true;
          this.loader = true;
          let url;
          let message;
          if (type == "demission") {
            url = "client-demission";
            message = "Démission effectuée avec succés";
          } else if (type == "validation") {
            url = "client-validation";
            message = "Validation effectuée avec succés";
          } else {
            url = "client-adhesion";
            message = "Adhésion effectuée avec succés";
          }
          this.clientServive.changeClient(url, this.paramsId).subscribe(
            (response) => {
              if (response["status"] == "OK") {
                this.isLoading = false;
                this.loader = false;
                this.snackbar.openSnackBar(message, "OK", [
                  "mycssSnackbarGreen",
                ]);
                this.getpap();
              } else {
                this.snackbar.openSnackBar(response["message"], "OK", [
                  "mycssSnackbarRed",
                ]);
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
    let extension = "";
    if (type === "photo_profile") {
      accept = [".png", ".PNG", ".jpg", ".JPG"];
      extension = "une image";
    }
    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      const ext = strsubstring;
      // Verification de l'extension du ficihier est valide
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(
          "Ce fichier " + file.name + " n'est " + extension,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        // recuperation du fichier et conversion en base64
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (type === "photo_profile") {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
              const docBase64Path = e.target.result;

              if (
                ext === ".png" ||
                ext === ".PNG" ||
                ext === ".jpg" ||
                ext === ".JPG" ||
                ext === ".jpeg" ||
                ext === ".JPEG"
              ) {
                this.saveStoreFile(file, type);
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
    formData.append("file", file);
    this._changeDetectorRef.detectChanges();
    const dataFile = { file: file };
    this.clientServive.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
          this.noImageStore = resp["urlprod"];
          this.saveFile(this.noImageStore, type);
          this._changeDetectorRef.detectChanges();
          // this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK', ['mycssSnackbarGreen']);
        }
      },
      (error) => {
        this.snackbar.showErrors(error);
      }
    );
  }

  signatureClient(): void {
    // this.dialogRef = this._matDialog.open(SignatureClientComponent, {
    //   autoFocus: true,
    //   width: '35rem',
    //   panelClass: 'event-form-dialog',
    //   disableClose: true,
    //   data: {
    //     action: 'new',
    //     client: this.infosPap
    //   }
    // });
    // this.dialogRef.afterClosed().subscribe((resp) => {
    //     this.getClient(this.paramsId);
    // });
  }

  saveFile(file, type) {
    let id;
    let url;
    if (this.infosPap?.typeClient?.typePersonne == "PM") {
      id = this.infosPap?.personneMorale?.id;
      url = "personne-morale/";
    } else if (this.infosPap?.typeClient?.typePersonne == "PP") {
      id = this.infosPap?.personnePhysique?.id;
      url = "personne-physique/";
    }
    this.loaderImg = true;
    this._changeDetectorRef.detectChanges();
    const dataFile =
      this.infosPap?.typeClient?.typePersonne == "PP"
        ? { photo: file }
        : { logo: file };
    this.clientServive.updateEntity(url ,id, dataFile).subscribe(
      (resp) => {
        if (
          resp[this.constantes.RESPONSE_CODE] ===
          this.constantes.HTTP_STATUS.SUCCESSFUL
        ) {
          if (this.infosPap?.typeClient?.typePersonne == "PP") {
            this.noImage = resp[this.constantes.RESPONSE_DATA]["photo"];
          } else if (this.infosPap?.typeClient?.typePersonne == "PM") {
            this.noImage = resp[this.constantes.RESPONSE_DATA]["logo"];
          }
          this.loaderImg = false;
          this._changeDetectorRef.detectChanges();
          this.snackbar.openSnackBar("Fichier chargée avec succès", "OK", [
            "mycssSnackbarGreen",
          ]);
        }
      },
      (error) => {
        this.loaderImg = false;
        this.snackbar.showErrors(error);
      }
    );
  }

  getpap() {
  let data=   this.localService.getDataJson("pap");
  this.infosPap= this.localService.getDataJson("pap")
  console.log('=========hhhh===========================');
  console.log(data);
  console.log('====================================');

    // this.sharedService.selectedItem$.subscribe((item) => {
    //   console.log('====================================');
    //   console.log("detail");
    //   console.log('====================================');
    //   console.log(item);
    // });
  }
}
