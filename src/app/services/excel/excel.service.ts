
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  constructor() { }

  public exportAsExcelFile(json: any[], orderWeek: string, groupId: string): void {

    var worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      { A: "Conprobio", B: "", C: "", D: "Settimana" },
      { A: "", B: "", C: "", D: "Gruppo" }
    ], { skipHeader: true});
    
    XLSX.utils.sheet_add_json(worksheet, json, { header: ["category", "origin", "certification", "name", "qty", "unit", "price"], origin: "A4"});
    //worksheet.set_landscape();
    worksheet['!cols'] = [
      { width: 10 },
      { width: 5 },
      { width: 5 },
      { width: 40 },
      { width: 3 },
      { width: 5 },
      { width: 5 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 }
    ]
    
    worksheet['A1'].v = 'CONPROBIO';
    worksheet['D1'].v = 'Settimana: '+orderWeek;
    worksheet['D2'].v = 'Gruppo: '+groupId;
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, orderWeek+'-'+groupId);
  }
private saveAsExcelFile(buffer: any, fileName: string): void {
   const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
   FileSaver.saveAs(data, 'CPB-'+fileName + '_' + new  Date().getTime() + EXCEL_EXTENSION);
}
}