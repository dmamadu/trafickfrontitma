import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";

import { CoreService } from "src/app/shared/core/core.service";
import { CONSTANTES } from "src/app/shared/models/constantes";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { PipAddComponent } from "../pip-add/pip-add.component";

@Component({
  selector: "info-client",
  templateUrl: "./info-client.component.html",
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [AngularMaterialModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: MatDialogRef,
      useValue: [],
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
  ],

})
export class InfoClientComponent implements OnInit {
  _attributComplementaire = [];
  @Input() infosPap;
  @Input() persPhysique;
  @Input()
  set attributComplementaire(data: any) {
    this._attributComplementaire = data ? data : [];
  }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  accountForm: UntypedFormGroup;
  data: any;
  paramsId: any;
  constantes = CONSTANTES;
  isLoading = false;
  dialogRef: any;
  naturePersonnesMorales: any = [];
  responsable: any = [];
  statutJuridiques: any = [];
  countries: any = [];
  listetemplate: any;

  /**
   * Constructor
   */
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private snackbar: SnackBarService
  )
  {


    this.route.params.subscribe((params) => {
      this.paramsId = params["id"];
    });
  }
  ngOnInit(): void {
  }




  relod() {
    window.location.reload();
  }


  updateClient(client): void {
    console.log('====================================');
    console.log(client);
    console.log('====================================');
    const dialogRef = this._matDialog.open(PipAddComponent, {
      autoFocus: true,
      width: '60rem',
      height: 'auto',
      panelClass: 'event-form-dialog',
      disableClose: true,
      data: {
          action: 'edit',
          data: client,
         dataOther: {}
      }
  });
  dialogRef.afterClosed().subscribe(() => {

  });
  }


}
