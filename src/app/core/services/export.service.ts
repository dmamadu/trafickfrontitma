import {Injectable} from '@angular/core';
// import * as XLSX from 'xlsx';
import type * as XT from 'xlsx-js-style';

// xlsx-js-style (~1 Mo) n'est chargé qu'au premier export, pas au démarrage de l'application
type XlsxModule = typeof import('xlsx-js-style');
let XLSX: XlsxModule;
const loadXlsx = (): Promise<XlsxModule> =>
    XLSX ? Promise.resolve(XLSX) : import('xlsx-js-style').then((m: any) => (XLSX = m.utils ? m : m.default));
import {HttpClient} from "@angular/common/http";
import { SnackBarService } from 'src/app/shared/core/snackBar.service';


@Injectable()
export class ExportService {
    [x: string]: any;

    file: File;

    constructor(private httpClient: HttpClient, private snackbar: SnackBarService,) {
    }


    static toExportFileName(excelFileName: string, extension: string = 'xlsx'): string {
        return `${excelFileName}_export_${new Date().getTime()}.${extension}`;
    }

    public exportAsExcelFile(json: any[], excelFileName: string): void {
        loadXlsx().then(() => {

            const worksheet: XT.WorkSheet = XLSX.utils.json_to_sheet(json);
            const workbook: XT.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
            XLSX.writeFile(workbook, ExportService.toExportFileName(excelFileName));
        });
    }

    public exportAsExcelFileBalanceAuxiliaire(entete: any, json: any[], excelFileName: string): void {
        loadXlsx().then(() => {

            // const worksheet: XT.WorkSheet = XLSX.utils.json_to_sheet(json);
            this.httpClient.get("assets/excel/balanceTemplate.xlsm", {responseType: 'blob'}).subscribe((response) => {
                const reader: FileReader = new FileReader();
                reader.readAsBinaryString(response);
                const that = this;
                reader.onload = (e: any) => {
                    const binary = e.target.result;
                    const workbook: XT.WorkBook = XLSX.read(binary, {
                        type: 'binary',
                        bookVBA: true,
                        cellStyles: true,
                        sheetStubs: true
                    });
                    let worksheet: XT.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const endRowTitle = 1;
                    const endColumnPeriode = 3;
                    const endRowPeriode = endRowTitle + 2;
                    const titre: XT.Range = {s: {r: 0, c: 0}, e: {r: endRowTitle, c: 7}}; // Spécifiez la plage à fusionner

                    const periode: XT.Range = {s: {r: endRowPeriode, c: 0}, e: {r: endRowPeriode, c: endColumnPeriode}}; // Spécifiez la plage à fusionner
                    const dateComptable: XT.Range = {
                        s: {r: endRowPeriode, c: endColumnPeriode + 1},
                        e: {r: endRowPeriode, c: endColumnPeriode + 2}
                    }; // Spécifiez la plage à fusionner
                    const dateEdition: XT.Range = {
                        s: {r: endRowPeriode, c: endColumnPeriode + 3},
                        e: {r: endRowPeriode, c: endColumnPeriode + 4}
                    }; // Spécifiez la plage à fusionner
                    const compteTitle: XT.Range = {s: {r: endRowPeriode + 3, c: 0}, e: {r: endRowPeriode + 4, c: 0}}; // Spécifiez la plage à fusionner
                    const intituleTitle: XT.Range = {s: {r: endRowPeriode + 3, c: 1}, e: {r: endRowPeriode + 4, c: 1}}; // Spécifiez la plage à fusionner
                    const NOUVEAU: XT.Range = {s: {r: endRowPeriode + 3, c: 2}, e: {r: endRowPeriode + 3, c: 3}}; // Spécifiez la plage à fusionner
                    const MOUVEMENTS_PERIODE: XT.Range = {
                        s: {r: endRowPeriode + 3, c: 4},
                        e: {r: endRowPeriode + 3, c: 5}
                    }; // Spécifiez la plage à fusionner
                    const SOLDE: XT.Range = {s: {r: endRowPeriode + 3, c: 6}, e: {r: endRowPeriode + 3, c: 7}}; // Spécifiez la plage à fusionner
                    const totauxLigneDebut = endRowPeriode + 3 + json.length - 1;
                    const totalBalance = {s: {r: totauxLigneDebut, c: 0+1}, e: {r: totauxLigneDebut, c: 1}};
                    const totalBilan = {s: {r: totauxLigneDebut + 1, c: 0}, e: {r: totauxLigneDebut + 1, c: 1}};
                    const totalGestion = {s: {r: totauxLigneDebut + 2, c: 0}, e: {r: totauxLigneDebut + 2, c: 1}};
                    worksheet['!merges'] = [titre, periode, dateComptable, dateEdition, totalBalance, totalBilan,
                        totalGestion,
                        compteTitle,
                        intituleTitle,
                        NOUVEAU,
                        MOUVEMENTS_PERIODE,
                        SOLDE];
                    XLSX.utils.sheet_add_json(worksheet, json, {
                        origin: 'A' + (endRowPeriode + 6),
                        skipHeader: true,
                        cellStyles: true
                    });
                    for (let i in worksheet) {
                        if (typeof worksheet[i] != 'object') continue;
                        let cell = XLSX.utils.decode_cell(i);
                        worksheet[i].s = {
                            border: {
                                right: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                left: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                top: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                bottom: {
                                    style: 'thin',
                                    color: '000000',
                                }
                            },
                        }
                    }
                    const debutAdresss= that.cellAddressToStrAddress({
                        r: endRowPeriode + 1,
                        c: endColumnPeriode - 2
                    });
                    const dateDebutCell = worksheet[debutAdresss];
                    const dateFinCell = worksheet[`${that.cellAddressToStrAddress({
                        r: endRowPeriode + 1,
                        c: endColumnPeriode
                    })}`];
                    const dateComptableCell = worksheet[`${that.cellAddressToStrAddress({r: endRowPeriode+1, c: endColumnPeriode+1})}`];
                    const dateEditionCell = worksheet[`${that.cellAddressToStrAddress({r: endRowPeriode+1, c: endColumnPeriode+3})}`];
                    const nbComptesCell = worksheet[`${that.cellAddressToStrAddress({r: endRowPeriode+2, c: endColumnPeriode+4})}`];
                    dateDebutCell.v = entete.dateDebut;
                    dateFinCell.v = entete.dateFin;
                    dateComptableCell.v = entete.dateComptable;
                    dateEditionCell.v = entete.dateEdition;
                    nbComptesCell.v = entete.nbComptes;
                    const tab = [
                        {'range': titre, 'value': entete.titre},
                        {'range': compteTitle, 'value': ''},
                        {'range': intituleTitle, 'value': ''}
                    ];
                    const debitCredit = ['C8', 'D8', 'E8', 'F8', 'G8', 'H8']
                    const totauxLines = ['A'+(totauxLigneDebut + 1), 'A'+(totauxLigneDebut + 2), 'A'+(totauxLigneDebut + 3),];
                    const letters = ['A','E','G']
                    for (let i = 1; i <= (endRowPeriode+1); i++) {
                        //'A'+(endRowPeriode+1),'E'+(endRowPeriode+1),'G'+(endRowPeriode+1)
                        letters.forEach(l=>{
                            if(worksheet[l+i]){
                                worksheet[l+i].s = {
                                    font: {
                                        bold: true,
                                    },
                                    alignment: {
                                        horizontal: 'center',
                                        wrapText: true
                                    },
                                    border: {
                                        right: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        left: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        top: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        bottom: {
                                            style: 'thin',
                                            color: '000000',
                                        }
                                    }
                                }
                                worksheet[l+i].cellStyles = true;
                                worksheet[l+i].autoFit = true;
                            }
                        });
                    }
                    tab.forEach(fusion => {
                        that.rangeToAddress(fusion.range).forEach((address, index) => {
                            const cell = worksheet[`${address}`]
                            if (index == 0) {
                                cell.s = {
                                    font: {
                                        color: {rgb: "ffffff"},
                                        bold: true,
                                    },
                                    fill: {
                                        fgColor: {rgb: "00316c"}
                                    },
                                    alignment: {
                                        horizontal: 'center',
                                        vertical: 'center',
                                        wrapText: true
                                    },
                                    border: {

                                        left: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        top: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        bottom: {
                                            style: 'thin',
                                            color: '000000',
                                        }
                                    }
                                }
                            } else {
                                cell.s = {
                                    font: {
                                        color: {rgb: "ffffff"},
                                        bold: true,
                                    },
                                    fill: {
                                        fgColor: {rgb: "00316c"}
                                    },
                                    alignment: {
                                        horizontal: 'center',
                                        vertical: 'center',
                                        wrapText: true
                                    },
                                    border: {

                                        right: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        top: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        bottom: {
                                            style: 'thin',
                                            color: '000000',
                                        }
                                    }
                                }
                            }
                            if (fusion.value) {
                                cell.v = fusion.value;
                            }
                        });
                    });


                    totauxLines.forEach(adress => {
                        worksheet[adress].s = {
                            font: {
                                bold: true,
                            },
                            alignment: {
                                horizontal: 'center',
                                wrapText: true
                            },
                            border: {
                                right: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                left: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                top: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                bottom: {
                                    style: 'thin',
                                    color: '000000',
                                }
                            }
                        }
                        worksheet[adress].cellStyles = true;
                        worksheet[adress].autoFit = true;
                    });
                    // compteIntitule.forEach(adress => {
                    //     worksheet[adress].s = {
                    //         font: {
                    //             color: {rgb: "ffffff"},
                    //             bold: true,
                    //         },
                    //         fill: {
                    //             fgColor: {rgb: "00316c"}
                    //         },
                    //         alignment: {
                    //             horizontal: 'center',
                    //             vertical: 'center',
                    //             wrapText: true
                    //         },
                    //         border: {
                    //             right: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             },
                    //             left: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             },
                    //             top: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             },
                    //             bottom: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             }
                    //         }
                    //     }
                    //     worksheet[adress].cellStyles = true
                    // });
                    debitCredit.forEach(adress => {
                        worksheet[adress].s = {
                            font: {
                                color: {rgb: "ffffff"}
                            },
                            fill: {
                                fgColor: {rgb: "024da8"},
                            },
                            alignment: {
                                horizontal: 'center',
                                vertical: 'center',
                                wrapText: true
                            },
                            border: {
                                right: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                left: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                top: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                bottom: {
                                    style: 'thin',
                                    color: '000000',
                                }
                            }
                        }
                        worksheet[adress].cellStyles = true
                    });



                    XLSX.writeFile(workbook, ExportService.toExportFileName(excelFileName, 'xlsm'));
                    this.snackbar.openSnackBar('Téléchargement réussi', 'OK', ['mycssSnackbarGreen']);
                };
            });
        });
    }

    public exportAsExcelFileBalance(entete: any, json: any[], excelFileName: string): void {
        loadXlsx().then(() => {

            // const worksheet: XT.WorkSheet = XLSX.utils.json_to_sheet(json);
            this.httpClient.get("assets/excel/balanceTemplate.xlsm", {responseType: 'blob'}).subscribe((response) => {
                const reader: FileReader = new FileReader();
                reader.readAsBinaryString(response);
                const that = this;
                reader.onload = (e: any) => {
                    const binary = e.target.result;
                    const workbook: XT.WorkBook = XLSX.read(binary, {
                        type: 'binary',
                        bookVBA: true,
                        cellStyles: true,
                        sheetStubs: true
                    });
                    let worksheet: XT.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const endRowTitle = 1;
                    const endColumnPeriode = 3;
                    const endRowPeriode = endRowTitle + 2;
                    const titre: XT.Range = {s: {r: 0, c: 0}, e: {r: endRowTitle, c: 7}}; // Spécifiez la plage à fusionner

                    const periode: XT.Range = {s: {r: endRowPeriode, c: 0}, e: {r: endRowPeriode, c: endColumnPeriode}}; // Spécifiez la plage à fusionner
                    const dateComptable: XT.Range = {
                        s: {r: endRowPeriode, c: endColumnPeriode + 1},
                        e: {r: endRowPeriode, c: endColumnPeriode + 2}
                    }; // Spécifiez la plage à fusionner
                    const dateEdition: XT.Range = {
                        s: {r: endRowPeriode, c: endColumnPeriode + 3},
                        e: {r: endRowPeriode, c: endColumnPeriode + 4}
                    }; // Spécifiez la plage à fusionner
                    const compteTitle: XT.Range = {s: {r: endRowPeriode + 3, c: 0}, e: {r: endRowPeriode + 4, c: 0}}; // Spécifiez la plage à fusionner
                    const intituleTitle: XT.Range = {s: {r: endRowPeriode + 3, c: 1}, e: {r: endRowPeriode + 4, c: 1}}; // Spécifiez la plage à fusionner
                    const NOUVEAU: XT.Range = {s: {r: endRowPeriode + 3, c: 2}, e: {r: endRowPeriode + 3, c: 3}}; // Spécifiez la plage à fusionner
                    const MOUVEMENTS_PERIODE: XT.Range = {
                        s: {r: endRowPeriode + 3, c: 4},
                        e: {r: endRowPeriode + 3, c: 5}
                    }; // Spécifiez la plage à fusionner
                    const SOLDE: XT.Range = {s: {r: endRowPeriode + 3, c: 6}, e: {r: endRowPeriode + 3, c: 7}}; // Spécifiez la plage à fusionner
                    const totauxLigneDebut = endRowPeriode + 3 + json.length - 1;
                    const totalBalance = {s: {r: totauxLigneDebut, c: 0}, e: {r: totauxLigneDebut, c: 1}};
                    const totalBilan = {s: {r: totauxLigneDebut + 1, c: 0}, e: {r: totauxLigneDebut + 1, c: 1}};
                    const totalGestion = {s: {r: totauxLigneDebut + 2, c: 0}, e: {r: totauxLigneDebut + 2, c: 1}};
                    worksheet['!merges'] = [titre, periode, dateComptable, dateEdition, totalBalance, totalBilan,
                        totalGestion,
                        compteTitle,
                        intituleTitle,
                        NOUVEAU,
                        MOUVEMENTS_PERIODE,
                        SOLDE];
                    XLSX.utils.sheet_add_json(worksheet, json, {
                        origin: 'A' + (endRowPeriode + 6),
                        skipHeader: true,
                        cellStyles: true
                    });
                    for (let i in worksheet) {
                        if (typeof worksheet[i] != 'object') continue;
                        let cell = XLSX.utils.decode_cell(i);
                        worksheet[i].s = {
                            border: {
                                right: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                left: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                top: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                bottom: {
                                    style: 'thin',
                                    color: '000000',
                                }
                            },
                        }
                    }
                    const debutAdresss= that.cellAddressToStrAddress({
                        r: endRowPeriode + 1,
                        c: endColumnPeriode - 2
                    });
                    const dateDebutCell = worksheet[debutAdresss];
                    const dateFinCell = worksheet[`${that.cellAddressToStrAddress({
                        r: endRowPeriode + 1,
                        c: endColumnPeriode
                    })}`];
                    const dateComptableCell = worksheet[`${that.cellAddressToStrAddress({r: endRowPeriode+1, c: endColumnPeriode+1})}`];
                    const dateEditionCell = worksheet[`${that.cellAddressToStrAddress({r: endRowPeriode+1, c: endColumnPeriode+3})}`];
                    const nbComptesCell = worksheet[`${that.cellAddressToStrAddress({r: endRowPeriode+2, c: endColumnPeriode+4})}`];
                    dateDebutCell.v = entete.dateDebut;
                    dateFinCell.v = entete.dateFin;
                    dateComptableCell.v = entete.dateComptable;
                    dateEditionCell.v = entete.dateEdition;
                    nbComptesCell.v = entete.nbComptes;
                    const tab = [
                        {'range': titre, 'value': entete.titre},
                        {'range': compteTitle, 'value': ''},
                        {'range': intituleTitle, 'value': ''}
                    ];
                    const debitCredit = ['C8', 'D8', 'E8', 'F8', 'G8', 'H8']
                    const totauxLines = ['A'+(totauxLigneDebut + 1), 'A'+(totauxLigneDebut + 2), 'A'+(totauxLigneDebut + 3),];
                    const letters = ['A','E','G']
                    for (let i = 1; i <= (endRowPeriode+1); i++) {
                        //'A'+(endRowPeriode+1),'E'+(endRowPeriode+1),'G'+(endRowPeriode+1)
                        letters.forEach(l=>{
                            if(worksheet[l+i]){
                                worksheet[l+i].s = {
                                    font: {
                                        bold: true,
                                    },
                                    alignment: {
                                        horizontal: 'center',
                                        wrapText: true
                                    },
                                    border: {
                                        right: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        left: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        top: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        bottom: {
                                            style: 'thin',
                                            color: '000000',
                                        }
                                    }
                                }
                                worksheet[l+i].cellStyles = true;
                                worksheet[l+i].autoFit = true;
                            }
                        });
                    }
                    tab.forEach(fusion => {
                        that.rangeToAddress(fusion.range).forEach((address, index) => {
                            const cell = worksheet[`${address}`]
                            if (index == 0) {
                                cell.s = {
                                    font: {
                                        color: {rgb: "ffffff"},
                                        bold: true,
                                    },
                                    fill: {
                                        fgColor: {rgb: "00316c"}
                                    },
                                    alignment: {
                                        horizontal: 'center',
                                        vertical: 'center',
                                        wrapText: true
                                    },
                                    border: {

                                        left: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        top: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        bottom: {
                                            style: 'thin',
                                            color: '000000',
                                        }
                                    }
                                }
                            } else {
                                cell.s = {
                                    font: {
                                        color: {rgb: "ffffff"},
                                        bold: true,
                                    },
                                    fill: {
                                        fgColor: {rgb: "00316c"}
                                    },
                                    alignment: {
                                        horizontal: 'center',
                                        vertical: 'center',
                                        wrapText: true
                                    },
                                    border: {

                                        right: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        top: {
                                            style: 'thin',
                                            color: '000000',
                                        },
                                        bottom: {
                                            style: 'thin',
                                            color: '000000',
                                        }
                                    }
                                }
                            }
                            if (fusion.value) {
                                cell.v = fusion.value;
                            }
                        });
                    });


                    totauxLines.forEach(adress => {
                        worksheet[adress].s = {
                            font: {
                                bold: true,
                            },
                            alignment: {
                                horizontal: 'center',
                                wrapText: true
                            },
                            border: {
                                right: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                left: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                top: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                bottom: {
                                    style: 'thin',
                                    color: '000000',
                                }
                            }
                        }
                        worksheet[adress].cellStyles = true;
                        worksheet[adress].autoFit = true;
                    });
                    // compteIntitule.forEach(adress => {
                    //     worksheet[adress].s = {
                    //         font: {
                    //             color: {rgb: "ffffff"},
                    //             bold: true,
                    //         },
                    //         fill: {
                    //             fgColor: {rgb: "00316c"}
                    //         },
                    //         alignment: {
                    //             horizontal: 'center',
                    //             vertical: 'center',
                    //             wrapText: true
                    //         },
                    //         border: {
                    //             right: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             },
                    //             left: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             },
                    //             top: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             },
                    //             bottom: {
                    //                 style: 'thin',
                    //                 color: '000000',
                    //             }
                    //         }
                    //     }
                    //     worksheet[adress].cellStyles = true
                    // });
                    debitCredit.forEach(adress => {
                        worksheet[adress].s = {
                            font: {
                                color: {rgb: "ffffff"}
                            },
                            fill: {
                                fgColor: {rgb: "024da8"},
                            },
                            alignment: {
                                horizontal: 'center',
                                vertical: 'center',
                                wrapText: true
                            },
                            border: {
                                right: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                left: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                top: {
                                    style: 'thin',
                                    color: '000000',
                                },
                                bottom: {
                                    style: 'thin',
                                    color: '000000',
                                }
                            }
                        }
                        worksheet[adress].cellStyles = true
                    });



                    XLSX.writeFile(workbook, ExportService.toExportFileName(excelFileName, 'xlsm'));
                    this.snackbar.openSnackBar('Téléchargement réussi', 'OK', ['mycssSnackbarGreen']);
                };
            });
        });
    }

    public exportAsExcelFileBilan(json: any[], excelFileName: string): void {
        loadXlsx().then(() => {

            // const worksheet: XT.WorkSheet = XLSX.utils.json_to_sheet(json);
            this.httpClient.get("assets/excel/bilanTemplate.xlsm", {responseType: 'blob'}).subscribe((response) => {
                const reader: FileReader = new FileReader();
                reader.readAsBinaryString(response);
                reader.onload = (e: any) => {
                    const binary = e.target.result;
                    const workbook: XT.WorkBook = XLSX.read(binary, {
                        type: 'binary',
                        bookVBA: true,
                        cellStyles: true,
                        sheetStubs: true
                    });
                    const worksheet: XT.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
                    XLSX.utils.sheet_add_json(worksheet, json, {origin: 'A3', skipHeader: true});
                    XLSX.writeFile(workbook, ExportService.toExportFileName(excelFileName, 'xlsm'));
                    this.snackbar.openSnackBar('Téléchargement réussi', 'OK', ['mycssSnackbarGreen']);
                };
            });

        });
    }

    public exportAsExcelFileResultCompte(json: any[], excelFileName: string): void {
        loadXlsx().then(() => {

            // const worksheet: XT.WorkSheet = XLSX.utils.json_to_sheet(json);
            this.httpClient.get("assets/excel/resultatCompteTemplate.xlsm", {responseType: 'blob'}).subscribe((response) => {
                const reader: FileReader = new FileReader();
                reader.readAsBinaryString(response);
                reader.onload = (e: any) => {
                    const binary = e.target.result;
                    const workbook: XT.WorkBook = XLSX.read(binary, {
                        type: 'binary',
                        bookVBA: true,
                        cellStyles: true,
                        sheetStubs: true
                    });
                    const worksheet: XT.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
                    XLSX.utils.sheet_add_json(worksheet, json, {origin: 'A3', skipHeader: true});
                    XLSX.writeFile(workbook, ExportService.toExportFileName(excelFileName, 'xlsm'));
                    this.snackbar.openSnackBar('Téléchargement réussi', 'OK', ['mycssSnackbarGreen']);
                };
            });

        });
    }

    cellAddressToStrAddress(cell: XT.CellAddress): string {
        const cols = {
            1: 'A',
            2: 'B',
            3: 'C',
            4: 'D',
            5: 'E',
            6: 'F',
            7: 'G',
            8: 'H',
            9: 'I',
            10: 'J',
            11: 'K',
            12: 'L',
            13: 'M',
            14: 'N',
            15: 'O',
            16: 'P',
            17: 'Q',
            18: 'R',
            19: 'S',
            20: 'T',
            21: 'U',
            22: 'V',
            23: 'W',
            24: 'X',
            25: 'Y',
            26: 'Z'
        }
        const cellStr = cols[(cell.c + 1)] + (cell.r + 1)
        return `${cellStr}`
    }

    rangeToAddress(range: XT.Range): string[] {
        const cols = {
            1: 'A',
            2: 'B',
            3: 'C',
            4: 'D',
            5: 'E',
            6: 'F',
            7: 'G',
            8: 'H',
            9: 'I',
            10: 'J',
            11: 'K',
            12: 'L',
            13: 'M',
            14: 'N',
            15: 'O',
            16: 'P',
            17: 'Q',
            18: 'R',
            19: 'S',
            20: 'T',
            21: 'U',
            22: 'V',
            23: 'W',
            24: 'X',
            25: 'Y',
            26: 'Z'
        }
        const address = [cols[(range.s.c + 1)] + (range.s.r + 1), cols[(range.e.c + 1)] + (range.e.r + 1)]
        return address;
    }

    preFormatLoanInfo(data: any) {
        return Object.assign([], data);
    }

}
