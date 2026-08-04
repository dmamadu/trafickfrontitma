import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { LocalService } from "src/app/core/services/local.service";

@Component({
  selector: "app-batiment",
  standalone: true,
  imports: [],
  templateUrl: "./batiment.component.html",
  styleUrl: "./batiment.component.css",
})
export class BatimentComponent implements OnInit {
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  offset: number = 0;
  currentProjectId: any;
  constructor(
    private parentService: ServiceParent,
    private localService: LocalService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }
  ngOnInit(): void {
    this.getBatiment();
  }

  getBatiment() {
    return this.parentService
      .list("batiments", this.pageSize, this.offset, this.currentProjectId)
      .subscribe(
        (data: any) => {
          if (data["responseCode"] == 200) {
            this._changeDetectorRef.markForCheck();
          } else {
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
