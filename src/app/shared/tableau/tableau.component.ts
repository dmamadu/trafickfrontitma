import { CommonModule, DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
//import {ExportService} from 'app/core/auth/export.service';
import { Subject } from "rxjs";
import { AngularMaterialModule } from "../angular-materiel-module/angular-materiel-module";
//import {CoreService} from "../../core/core/core.service";

@Component({
  selector: "tableau",
  templateUrl: "./tableau.component.html",
  styleUrls: ["./tableau.component.scss"],
  providers: [DatePipe],
  imports: [AngularMaterialModule, CommonModule,ReactiveFormsModule],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  //animations: fuseAnimations
})
export class TableauComponent implements OnInit {
  @Input() entete: any;
  @Input() coleurEntete: string;
  @Input() statutBadge: string;
  @Input() total: number;
  @Input() totalMontant: number;
  @Input() pageSize: number;
  @Input() pageIndex: number;
  @Input() pageSizeOptions: number[];
  @Input() actions!: ButtonAction[];
  @Output() changePage = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;
  dataSource: MatTableDataSource<any>;
  datas: any = [];
  flashMessage: "success" | "error" | null = null;
  isLoading: boolean = false;
  // clientColumns: string[] = ['matricule', 'intitule','ville','typeClient','email','statut','createdAt', 'action'];
  displayedColumnsFile: string[] = [
    "Matricule",
    "Intitule",
    "Ville",
    "TypeClient",
    "Email",
    "Statut",
    "Date de création",
  ];
  tabFileBody: string[] = [
    "matricule",
    "intitule",
    "ville",
    "typeClient",
    "email",
    "statut",
    "createdAt",
  ];
  selectedProductForm: UntypedFormGroup;
  tagsEditMode: boolean = false;
  currentIndex;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  img;
  image;
  offset: number = 0;
  private _data = [];

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef
  ) //private coreService: CoreService
  {}

  /**
   * On init
   */
  ngOnInit(): void {
    //  this.img = this.coreService.decriptDataToLocalStorage('CD-@--11');
    //this.image = "url(" + this.img + ")";
    this.dataSource = new MatTableDataSource(this.data);
  }

  @Input()
  set data(data: any) {
    this._data = data ? data : [];
    this.dataSource = new MatTableDataSource(this._data);
  }

  get data() {
    return this._data;
  }

  mapObject(tab) {
    const tt = tab.map((el) => el.th);
    if (this.actions) {
      tt.push("Action");
    }
    return tt;
  }

  getBadgeClass(element, entete) {
    if (entete.badgeClass) {
      const found = entete.badgeClass.find(
        (el) => el.name == "" + element[entete.td]
      );
      const cls = entete.badgeClass ? (found ? found.value : "") : "";
      return cls;
    } else {
      return "";
    }
  }

  // Fonction pour obtenir la classe de badge en fonction du statut
  getBadgeStatut(element, entete) {
    if (entete.td === "statut") {
      if (element.statut === "SAISI") {
        return "badge-blue";
      } else if (element.statut === "VALIDE") {
        return "badge-success";
       } else if (element.statut == "Inprogress" || element.statu == "Inprogress") {
        return "badge-blue";
      }
      return "badge-blue";
    }

    return "";
  }

  pageChanged(event) {
    this.changePage.emit(event);
  }

  /**
   * Toggle product details
   *
   * @param productId
   */

  /**
   * Cycle through images of selected product
   */
  cycleImages(forward: boolean = true): void {
    // Get the image count and current image index
    const count = this.selectedProductForm.get("images").value.length;
    const currentIndex =
      this.selectedProductForm.get("currentImageIndex").value;

    // Calculate the next and previous index
    const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
    const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

    // If cycling forward...
    if (forward) {
      this.selectedProductForm.get("currentImageIndex").setValue(nextIndex);
    }
    // If cycling backwards...
    else {
      this.selectedProductForm.get("currentImageIndex").setValue(prevIndex);
    }
  }

  /**
   * Toggle the tags edit mode
   */
  toggleTagsEditMode(): void {
    this.tagsEditMode = !this.tagsEditMode;
  }

  /**
   * Filter tags
   *
   * @param event
   */

  /**
   * Filter tags input key down event
   *
   * @param event
   */

  /**
   * Create a new tag
   *
   * @param title
   */

  /**
   * Update the tag title
   *
   * @param tag
   * @param event
   */

  /**
   * Delete the tag
   *
   * @param tag
   */

  /**
   * Add tag to the product
   *
   * @param tag
   */

  /**
   * Remove tag from the product
   *
   * @param tag
   */

  /**
   * Toggle product tag
   *
   * @param tag
   * @param change
   */

  /**
   * Should the create tag button be visible
   *
   * @param inputValue
   */

  /**
   * Show flash message
   */
  showFlashMessage(type: "success" | "error"): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {
      this.flashMessage = null;
      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  sortTable(array) {
    array.sort(function (a, b) {
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return array;
  }

  protected readonly length = length;
}

export type ButtonAction = {
  icon: string;
  couleur: string;
  size: string;
  title: string;
  isDisabled: boolean;
  action: Function;
  constraint?: Function;
};
