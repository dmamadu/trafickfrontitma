import { isExtensionAccepted } from "src/app/shared/utils/file-extension";
import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from 'app/core/auth/snackBar.service';
import {CONSTANTES} from '../../admin/model/constantes';
import {ClientVueService} from '../client-vue.service';


@Component({
    selector: 'signature-client',
    templateUrl: './signature-client.component.html',
    styleUrls: ['./signature-client.component.scss']
})
export class SignatureClientComponent {
    isLoading: boolean = false;
    action: string;
    dialogTitle: string = 'Signature Client';
    constantes = CONSTANTES;
    signature = '';
    loaderImg: boolean = false;
    infosClient: any;
    noImage;

    constructor(
        public matDialogRef: MatDialogRef<SignatureClientComponent>, @Inject(MAT_DIALOG_DATA) _data,
        private snackbar: SnackBarService,
        private clientServive: ClientVueService,
        private _changeDetectorRef: ChangeDetectorRef,
        private clientService: ClientVueService
    ) {
        this.infosClient = _data.client;
        if (this.infosClient.signature != null) {
            this.signature = this.infosClient.signature;
        } else {
            this.signature = 'assets/images/noImage.png';
        }
    }

    selectOnFile(evt, type, name) {
        let accept = [];
        let extension = '';
        if (type === 'signature') {
            accept = ['.png', '.PNG', '.jpg', '.JPG'];
            extension = 'une image';
        }
        for (const file of evt.target.files) {
            const index = file.name.lastIndexOf('.');
            const strsubstring = file.name.substring(index, file.name.length);
            const ext = strsubstring;
            // Verification de l'extension du fichier est valide
            if (!isExtensionAccepted(accept, strsubstring)) {

                this.snackbar.openSnackBar('Ce fichier ' + file.name + ' n\'est ' + extension, 'OK', ['mycssSnackbarRed']);
                return;
            } else {
                // recuperation du fichier et conversion en base64
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    if (type === 'signature') {
                        const img = new Image();
                        img.src = e.target.result;
                        img.onload = () => {
                            const docBase64Path = e.target.result;
                            if (ext === '.png' || ext === '.PNG' || ext === '.jpg' || ext === '.JPG' || ext === '.jpeg' || ext === '.JPEG') {
                                this.signature = docBase64Path;
                                this._changeDetectorRef.detectChanges();
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
        formData.append('file', file);
        this._changeDetectorRef.detectChanges();
        const dataFile = {'file': file};
        this.clientService.saveStoreFile('store-file', formData).subscribe((resp) => {
            if (resp) {
                this.noImage = resp['urlprod'];
                this.saveFile(this.noImage,type);
                this._changeDetectorRef.detectChanges();
                // this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK', ['mycssSnackbarGreen']);
            }
        }, (error) => {
            this.snackbar.showErrors(error);
        });
    }

    saveFile(file, type) {
        this.loaderImg = true;
        const dataFile =
            {'signature': file};
        this.clientServive.updateSignature(this.infosClient?.id, dataFile).subscribe((resp) => {
            if (resp[this.constantes.RESPONSE_CODE] === this.constantes.HTTP_STATUS.SUCCESSFUL) {
                this.signature = resp[this.constantes.RESPONSE_DATA]['signature'];
                this.loaderImg = false;
                this._changeDetectorRef.detectChanges();
                this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK', ['mycssSnackbarGreen']);
            }
        }, (error) => {
            this.loaderImg = false;
            this.snackbar.showErrors(error);
        });
    }


}
