import { ChangeDetectorRef, Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { CONSTANTES } from "src/app/shared/models/constantes";
import { environment } from "src/environments/environment";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { Subject } from "rxjs";

@Component({
  selector: "app-signature",
  templateUrl: "./signature.component.html",
  standalone: true,
  imports: [AngularMaterialModule],
  styleUrl: "./signature.component.css",
})
export class SignatureComponent {
  isLoading: boolean = false;
  action: string;
  dialogTitle: string = "Signature du Pap";
  constantes = CONSTANTES;
  signature = "";
  loaderImg: boolean = false;
  infosPap: any;
  noImage;
  urlImage = environment.apiUrl + "image/getFile/";
  signatureUrlSubject: Subject<string> = new Subject<string>();
  constructor(
    public matDialogRef: MatDialogRef<SignatureComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private snackbar: SnackBarService,
    private clientServive: ClientVueService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    // this.infosPap = _data.pap;
    // console.log(this.infosPap);
    // if (this.infosPap.signaturePath != null) {
    //    // this.signature = `${this.urlImage+this.infosPap.signaturePath}`;
    // } else {
    // }

    this.signature = "assets/images/noImage.png";

    console.log(_data);
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
                this.saveStoreFile(file);
              }
            };
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }



  saveStoreFile(file) {
    let formData = new FormData();
    formData.append("file", file);
    this._changeDetectorRef.detectChanges();
    const dataFile = { file: file };
    this.clientServive
      .saveStoreFile("image/uploadFileDossier", formData)
      .subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            const signatureUrl = `${this.urlImage + resp["data"]}`;
            console.log(signatureUrl);

            // Fermez le dialogue et renvoyez l'URL de la signature
            this.matDialogRef.close(signatureUrl);
          }
        },
        (error) => {
          console.log(error);
          this.snackbar.showErrors(error);
        }
      );
  }

  saveFile(file) {
    this.loaderImg = true;
    this._changeDetectorRef.detectChanges();
    this.clientServive
      .updateEntity("personneAffectes/addSignature", this.infosPap.id, file)
      .subscribe(
        (resp) => {
          console.log(resp["data"][0]);
          //   this.noImage =  `${this.urlImage+(resp["data"][0].imagePath)}`;
          this.loaderImg = false;
          this._changeDetectorRef.detectChanges();
          this.snackbar.openSnackBar("Fichier chargée avec succès", "OK", [
            "mycssSnackbarGreen",
          ]);
        },
        (error) => {
          console.log(error);
          this.loaderImg = false;
          this.snackbar.showErrors(error);
        }
      );
  }
}
