import { Component, OnInit } from '@angular/core';

import * as XLSX from 'xlsx';
import { Catalog } from 'src/app/models';
import { OrderService, FirestoreService, ToastService } from 'src/app/services';
import { Product, Unit } from 'src/app/models/product';
  
type AOA = any[][];
  
@Component({
  selector: 'app-catalog-create',
  templateUrl: './catalog-create.page.html',
  styleUrls: ['./catalog-create.page.scss'],
})
export class CatalogCreatePage implements OnInit {
    data: AOA = [[1, 2], [3, 4]];
    newCatalog: Catalog;
    products: Product[];

    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
    fileName: string = 'SheetJS.xlsx';
  
    constructor(private orderService: OrderService, private firestore: FirestoreService,
      public toast: ToastService){}

    ngOnInit(){
      
  
    }
    
    onFileChange(evt: any) {
      /* wire up file reader */
      const target: DataTransfer = <DataTransfer>(evt.target);
      if (target.files.length !== 1) throw new Error('Cannot use multiple files');
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
  
        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  
        /* save data */
        this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));

        this.newCatalog = this.extractCatalog(this.data);
        this.products= this.extractProducts(this.data);
        console.log(this.data);
      };
      reader.readAsBinaryString(target.files[0]);
    }

    async save(){
      this.firestore.createCatalog(this.newCatalog);
      let savedProducts = this.products.filter(p => (p.origin));
      await this.firestore.addProductsToCatalog(savedProducts, this.newCatalog.id);
      this.toast.showToast("Catalog "+this.newCatalog.id+ " created with "+savedProducts.length+" products");
    }

    extractCatalog(data: string[][]){
      let week = data[0].findIndex(txt=> txt && txt.includes && txt.includes("settimana"));
      let orderWeek = "2020w"+data[0][week+1];

      const deliveryDates = this.orderService.getOrderDeliveryDates(orderWeek);

      return {id: orderWeek,
              orderDate: deliveryDates[0].toISOString(),
              deliveryDate: deliveryDates[1].toISOString()};
    }
  
    extractProducts(data: string[][]): Product[]{
      let lines = data.slice(6);
    
      let products = new Array<Product>();
      let lastCategory = '';
      let i=0;
      lines.forEach((line) => {
        if (line.length == 0) return ;
        let product = this.parseProductLine(line, lastCategory, i++);
        if (product.category != lastCategory){
          i = 0;
        }
        lastCategory = product.category;
        products.push(product);
      })
      return products;
    }
  
    parseProductLine(values: any[], lastCategory?: string, guiOrder?: number): Product{
      /*
      0: "PROPOSTE"
      1: "CH"
      2: "Bio Bravo espresso grani 500 g"
      3: "Eq+G"
      5: "pz"
      6: 11.8
      */

      let cat: string = values[0];
      if (!cat) { cat = lastCategory;}
      cat = cat.trim();
      const unit: string = values[5];
      let orderUnit: Unit = Unit.PZ;
      let priceUnit: Unit = Unit.PZ;
      switch(unit) { 
        case "kg": { 
          orderUnit = Unit.KG;
          priceUnit = Unit.KG;
          break; 
        } 
        case "pz/kg": { 
          orderUnit = Unit.PZ;
          priceUnit = Unit.KG;
          break; 
        } 
        default: { 
            //statements; 
            break; 
        } 
      } 
      const price = parseFloat(values[6]);
  
      let name = values[2];
      if (name && name.startsWith('"') && name.endsWith('"')){
        name = name.substring(1, name.length-1);
        name = name.replace(/\"\"/g, '"');
      }  
      let product = new Product('', name, values[1], cat, orderUnit, price, 'CHF', priceUnit, values[5], guiOrder, values[3]);
  
      return product;
    }

    export(): void {
      /* generate worksheet */
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);
  
      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
      /* save to file */
      XLSX.writeFile(wb, this.fileName);
    }
  
  }