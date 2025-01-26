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
import { environment } from 'src/environments/environment';
import { InfoPlainteComponent } from "./info-plainte/info-plainte.component";


@Component({
  selector: "app-pap-detail",
  templateUrl: "./plainte-detail.component.html",
  standalone: true,
  imports: [AngularMaterialModule, InfoPlainteComponent],
  styleUrl: "./plainte-detail.component.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlainteDetailComponent {
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
  infosPlainte:any
  isLoading = false;
  menuPP: any;
  menuPM: any;
  menuPMACTIONNAIRE: any;
  typeClient: boolean;
  noImage = "assets/images/noImage.png";
  imagePath='';
  noImageStore = "";
  typePM;
  dialogRef: any;
  loaderImg: boolean = false;
  attributComplementaires: any = [];

 urlImage=    environment.apiUrl+'image/getFile/';


 //urlImage=     'http://localhost:8080/image/getFile/';


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
    private _matDialog: MatDialog,
    private sharedService: SharedService,
    private localService :LocalService
  ) {
    this.menuData = [
      {
        title: "Actions liées",
        children: [
          {
            id: "info-client",
            title: "Plaintes",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "personne-lie",
            title: "Communications",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "signataires",
            title: "Ententes de compensation",
            icon: "heroicons_outline:users",
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
      {
        id: "caisse",
        icon: "heroicons_outline:bell",
        title: "Caisse",
        description: "",
      },
      {
        id: "plafond",
        icon: "heroicons_outline:user-group",
        title: "Plafond",
        description: "",
      },
    ];


    this.getPlainte();
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

  changeClient(type,id): void {

    console.log(id);

    this.snackbar
      .showConfirmation("Voulez-vous vraiment marque ce pap comme dédommagé ?")
      .then((result) => {
        if (result["value"] == true) {
          this.isLoading = true;
          this.loader = true;
       //   let url;
         // let message;
          this.clientServive.updateEntity("personneAffectes/dedommagerPap",id,type).subscribe(
            (response) => {

                this.isLoading = false;
                this.loader = false;
                this.snackbar.openSnackBar(response['message'], "OK", [
                  "mycssSnackbarGreen",
                ]);
               // this.getPlainte();

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
    console.log("hello");
    let formData = new FormData();
    formData.append("file", file);
    this._changeDetectorRef.detectChanges();
    const dataFile = { file: file };
    this.clientServive.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
        console.log(resp);
         this.noImageStore = resp["data"];
         console.log(this.noImageStore);

        this.saveFile(this.noImageStore);
          this._changeDetectorRef.detectChanges();
        //   this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK', ['mycssSnackbarGreen']);
        }
      },
      (error) => {
        this.snackbar.showErrors(error);
      }
    );
  }

  saveFile(file) {
    this.loaderImg = true;
    this._changeDetectorRef.detectChanges();
    this.clientServive.updateEntity("personneAffectes/addImage" ,this.infosPlainte.id, file).subscribe(
      (resp) => {
        console.log((resp["data"][0]));
        this.imagePath =  `${this.urlImage+(resp["data"][0].imagePath)}`;
        this.loaderImg = false;
        this._changeDetectorRef.detectChanges();
        this.snackbar.openSnackBar("Fichier chargée avec succès", "OK", [
          "mycssSnackbarGreen",
        ]);
        this.getPlainte();
      },
      (error) => {
        this.loaderImg = false;
        this.snackbar.showErrors(error);
      }
    );
  }
  getPlainte() {
  this.infosPlainte= this.localService.getDataJson("plainte")
  }
}
