import { ElementRef, Injectable, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
//import {CONSTANTES} from 'app/modules/presentation/admin/model/constantes';
//import {TransactionVueService} from 'app/modules/presentation/transaction-vue/transaction-vue.service';
import { map } from "rxjs/operators";
import swal from "sweetalert2";
import { CoreService } from "../core/core.service";
import { HttpErrorResponse } from "@angular/common/http";
import { CONSTANTES } from "../models/constantes";

@Injectable({
  providedIn: "root",
})
export class SnackBarService {
  constantes = CONSTANTES;
  menuTransactions: any;
  @ViewChild("productionHebdo", { static: false })
  public productionHebdo: ElementRef;

  /**
   * Constructor
   */
  constructor(
    private matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    //private transactionVueService: TransactionVueService,
    private coreService: CoreService
  ) {}

  openSnackBar(message: string, action: string, className, callBack?) {
    if (callBack) {
      this.matSnackBar
        .open(message, action, {
          duration: 50000,
          panelClass: className,
        })
        .onAction()
        .subscribe(() => {
          callBack();
        });
    } else {
      this.matSnackBar.open(message, action, {
        duration: 50000,
        panelClass: className,
      });
    }
  }

  showConfirmation(message: string): Promise<any> {
    return swal.fire({
      title: "Confirmation",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Valider",
      cancelButtonText: "Annuler",
    });
  }

  showConfirmationAll(
    message: string,
    confirm: string,
    cancel?: string
  ): Promise<any> {
    return swal.fire({
      title: "Confirmation",
      text: message,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: confirm,
      cancelButtonText: cancel,
    });
  }

  //open modal add and edit
  // openModal(composant: any, widthSize: string, actionType: string, heightSize?: string, dataValue?: any, dataValueOther?: any, callBack?: Function): void {
  //     const dialogRef = this._matDialog.open(composant, {
  //         autoFocus: true,
  //         width: widthSize,
  //         height: heightSize,
  //         panelClass: 'event-form-dialog',
  //         disableClose: true,
  //         data: {
  //             action: actionType,
  //             data: dataValue,
  //             dataOther: dataValueOther
  //         }
  //     });
  //     dialogRef.afterClosed().subscribe(() => {
  //         if (callBack) {
  //             callBack();
  //         }
  //     });
  // }

  openModal(
    composant: any,
    widthSize: string,
    actionType: string,
    heightSize: string = "",
    dataValue?: any,
    dataValueOther?: any,
    callBack?: Function
  ): void {
    const screenHeight = window.innerHeight;
    const maxHeight = screenHeight * 0.85;

    const height = heightSize === "" ? "auto" : heightSize;
    const width = widthSize === "" ? "auto" : widthSize;

    const dialogRef = this._matDialog.open(composant, {
      autoFocus: true,
      width: width,
      height: height !== "auto" ? height : `${maxHeight}px`,
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: actionType,
        data: dataValue,
        dataOther: dataValueOther,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      if (callBack) {
        callBack();
      }
    });
  }

  openModalTransaction(
    composant: any,
    widthSize: string,
    actionType: string,
    infos?,
    dataValue?: any,
    dataValueOther?,
    dataOtherValue?,
    callBack?: Function
  ): void {
    const dialogRef = this._matDialog.open(composant, {
      autoFocus: true,
      width: widthSize,
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: actionType,
        data: dataValue,
        dataValueOther: dataValueOther,
        dataOtherValue: dataOtherValue,
        infos: infos,
      },
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        if (callBack) {
          callBack(resp);
        }
      }
    });
  }

  openModalFormDynamique(
    composant: any,
    widthSize: string,
    actionType: string,
    data,
    dataValue?: any,
    dataValueOther?,
    dataOtherValue?,
    callBack?: Function
  ): void {
    const dialogRef = this._matDialog.open(composant, {
      autoFocus: true,
      width: widthSize,
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: actionType,
        typeForm: data,
        fields: dataValue,
        information: dataValueOther,
        liste: dataOtherValue,
      },
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        if (callBack) {
          callBack();
        }
      }
    });
  }

  //open modal add and edit
  openUpdateModal(
    composant: any,
    widthSize: string,
    actionType: string,
    data?,
    dataValue?: any,
    dataValueOther?,
    callBack?: Function
  ): void {
    const dialogRef = this._matDialog.open(composant, {
      autoFocus: true,
      width: widthSize,
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: actionType,
        fields: data,
        information: dataValue,
        id: dataValueOther,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      if (callBack) {
        callBack();
      }
    });
  }

  // getMenuTransaction(libelle, code) {
  //     return this.transactionVueService.getMenuTransaction('type-transaction').pipe(
  //         map((resp) => {
  //             if (resp[this.constantes.RESPONSE_CODE] === this.constantes.HTTP_STATUS.SUCCESSFUL) {
  //                 this.menuTransactions = resp[this.constantes.RESPONSE_DATA];
  //                 const found = this.menuTransactions.find(el => el.libelle == libelle || el.code == code);
  //                 return found?.id;
  //             }

  //         })
  //     );
  // }

  rechercherGlobal(rechercher, url) {
    const data = {
      isGlobal: true,
      typeEntity: url,
      searchQuery: rechercher,
    };
    return this.coreService.doRechercher(data, url).pipe(
      map((response: any) => {
        if (response["responseCode"] == 200) {
          return response[this.constantes.RESPONSE_DATA];
        }
      })
    );
  }

  showErrors(error: HttpErrorResponse) {
    let finalMessage = "";
    if (error) {
      if (error.error) {
        if (typeof error.error == "string") {
          finalMessage = error.error;
        } else {
          const errors: any[] = error.error.errors ? error.error.errors : [];
          if (errors.length == 0) {
            finalMessage = error.error.message;
          } else {
            finalMessage = errors.map((el) => el.message).join("\n");
            if (!finalMessage) {
              finalMessage = errors[0];
            }
          }
        }
      } else {
        finalMessage = error.message;
      }
    } else {
      finalMessage = "";
    }

    this.openSnackBar(finalMessage, "OK", ["mycssSnackbarRed"]);
  }

  showSimpleNotification(title: string, message: string): Promise<any> {
    return swal.fire({
      icon: "warning",
      title: title,
      text: message,
      confirmButtonText: "OK",
    });
  }




  /**
   * Affiche un message d'erreur
   */
  showError(message: string): void {
    this.openSnackBar(message, 'Fermer', ['mycssSnackbarRed']);
  }

  /**
   * Affiche un message d'avertissement
   */
  showWarning(message: string): void {
    this.openSnackBar(message, 'Fermer', ['mycssSnackbarYellow']);
  }

  /**
   * Affiche un message de succès
   */
  showSuccess(message: string): void {
    this.openSnackBar(message, 'Fermer', ['mycssSnackbarGreen']);
  }

  /**
   * Affiche une confirmation avec SweetAlert2
   * Retourne une promesse qui résout true si confirmé, false si annulé
   */
  // showConfirmation(message: string): Promise<boolean> {
  //   return swal.fire({
  //     title: 'Confirmation',
  //     text: message,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Valider',
  //     cancelButtonText: 'Annuler',
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33'
  //   }).then((result) => {
  //     return result.isConfirmed;
  //   });
  // }

  /**
   * Version alternative de confirmation avec personnalisation des boutons
   */
  showConfirmationWithCustomButtons(
    message: string, 
    confirmText: string = 'Valider', 
    cancelText: string = 'Annuler'
  ): Promise<boolean> {
    return swal.fire({
      title: 'Confirmation',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      return result.isConfirmed;
    });
  }

  /**
   * Affiche une info-bulle
   */
  showInfo(message: string): void {
    this.openSnackBar(message, 'Fermer', ['mycssSnackbarBlue']);
  }







}
