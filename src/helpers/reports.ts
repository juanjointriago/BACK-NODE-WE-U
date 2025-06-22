import moment from 'moment';
import { Model } from 'sequelize/types';
import { getNameTypePayment, getNameTyService, getMonthName } from './utils';

const xl = require('excel4node');
//const pdf = require('html-pdf');

const headerStyle = {
  font: {
    color: '#000000',
    size: 12,
    bold: true,
  },
  alignment: {
    horizontal: ['left'],
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: 'D9D9D9',
  },
  border: {
    left: {
      style: 'thin',
      color: '#000000',
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    top: {
      style: 'medium',
      color: '#000000',
    },
    bottom: {
      style: 'medium',
      color: '#000000',
    },
  },
};

const detailStyle = {
  font: {
    color: '#000000',
    size: 12,
    italics: true,
  },
  numberFormat: '#,##0.00; (#,##0.00); -',
  alignment: {
    horizontal: ['left'],
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: 'FFFFFF',
  },
  border: {
    left: {
      style: 'thin',
      color: '#000000',
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    top: {
      style: 'medium',
      color: '#000000',
    },
    bottom: {
      style: 'medium',
      color: '#000000',
    },
  },
};

const dataHeaderStyle = {
  font: {
    color: '#ffffff',
    size: 12,
    underline: true,
  },
  alignment: {
    horizontal: ['center'],
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '000000',
  },
  border: {
    left: {
      style: 'thin',
      color: '#000000',
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    bottom: {
      style: 'medium',
      color: '#000000',
    },
  },
};

const dataStyle = {
  font: {
    color: '#000000',
    size: 12,
    italics: true,
  },
  numberFormat: '#,##0.00; (#,##0.00); -',
  alignment: {
    horizontal: ['left'],
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: 'FFFFFF' /*A5C7F1*/,
  },
  border: {
    left: {
      style: 'thin',
      color: '#000000',
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    bottom: {
      style: 'medium',
      color: '#000000',
    },
  },
};

const dataStyleMoney = {
  font: {
    color: '#000000',
    size: 12,
    italics: true,
  },
  numberFormat: '$#,##0.00; ($#,##0.00); 0',
  alignment: {
    // horizontal: ['left'],
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: 'FFFFFF' /*A5C7F1*/,
  },
  border: {
    left: {
      style: 'thin',
      color: '#000000',
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    bottom: {
      style: 'medium',
      color: '#000000',
    },
  },
};

const dataStyleMoney2 = {
  font: {
    color: '#000000',
    size: 12,
    italics: true,
  },
  numberFormat: '$#,##0.00; ($#,##0.00); 0',
  alignment: {
    // horizontal: ['left'],
  },
};

const dataHeaderTotalStyle = {
  font: {
    color: '#ffffff',
    size: 12,
    underline: true,
    bold: true,
    italics: true,
    allowBlank: true,
  },
  alignment: {
    horizontal: ['left'],
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '8ED2C2',
  },
  border: {
    top: {
      style: 'medium',
      color: '#000000',
    },
    left: {
      style: 'thin',
      color: '#000000',
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    bottom: {
      style: 'medium',
      color: '#000000',
    },
  },
};

/**
 * Crea un archivo Excel con dos hojas, una para los choferes y otra para las empresas
 * @param {Model<any, any>[]} requests - Modelo<cualquiera, cualquiera>[]
 * @param {number} month - número,
 * @param {number} year - número
 * @param {Model<any, any>[]} requestBuss - es una matriz de objetos que contiene los datos que se
 * escribirán en el archivo de Excel.
 * @returns Una cuerda
 */
export const createReportRequest = (requests: Model<any, any>[], month: number, year: number, requestBuss: Model<any, any>[]) => {
  let total = 0;
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Reporte');
  const ws2 = wb.addWorksheet('Empresas');

  const isMonst = getMonthName(month);

  var styleHeader = wb.createStyle(headerStyle);
  var styleDetail = wb.createStyle(detailStyle);
  var styleDataHeader = wb.createStyle(dataHeaderStyle);
  var styleData = wb.createStyle(dataStyle);
  var styleDataMoney = wb.createStyle(dataStyleMoney);
  var styleDataMoney2 = wb.createStyle(dataStyleMoney2);
  var styleHeaderTotal = wb.createStyle(dataHeaderTotalStyle);

  //tamaño columna ganancias
  ws.column(1).setWidth(30);
  ws.column(2).setWidth(30);
  ws.column(3).setWidth(30);
  ws.column(4).setWidth(30);
  ws.column(5).setWidth(30);
  ws.column(6).setWidth(30);
  ws.column(7).setWidth(30);
  ws.column(8).setWidth(30);
  ws.column(9).setWidth(30);
  ws.cell(1, 1)
    .string(isMonst === '' ? 'REPORTE GENERAL' : `REPORTE DEL MES ${isMonst.toUpperCase()}, ${year}`)
    .style(styleHeaderTotal);

  ws.cell(3, 1).string('Fecha de Creación del Reporte:').style(styleHeader);
  ws.cell(3, 2).string(moment().format('DD/MM/YYYY HH:mm:ss')).style(styleDetail);
  ws.cell(3, 4).string('TOTAL:').style(styleHeaderTotal);

  //   let totalTotal = 0;
  //   requests.map((item: any) => {
  //     totalTotal = totalTotal + item.total;
  //   });

  let rowAux = 5;
  requests.length > 0 &&
    requests
      .filter((request) => request.get().requests.length > 0)
      .map((item: Model<any, any>, idx: number) => {
        //   ws.cell(rowAux, 2).string();
        let totalTransport = 0;
        ws.cell(rowAux, 1).string('Nombre del Conductor:').style(styleHeader);
        ws.cell(rowAux, 2).string(`${item.get().fullName.toUpperCase()}`).style(styleDetail);
        rowAux++;
        ws.cell(rowAux, 1).string('Total Viajes:').style(styleHeader);
        ws.cell(rowAux, 2).string(`${item.get().requests.length}`).style(styleDetail);
        rowAux++;
        ws.cell(rowAux, 1).string('E-mail:').style(styleHeader);
        ws.cell(rowAux, 2).string(`${item.get().email}`).style(styleDetail);
        rowAux++;
        ws.cell(rowAux, 1).string('Teléfono:').style(styleHeader);
        ws.cell(rowAux, 2).string(`${item.get().phoneNumber}`).style(styleDetail);
        rowAux = rowAux + 2;

        // cabecera tbl
        const headingColumnNames = ['Nombre Cliente', 'Fecha Viaje', 'Tipo de Orden', 'Tipo de Pago', 'Total'];

        //Write Column Title in Excel file
        let headingColumnIndex = 1;
        headingColumnNames.forEach((heading) =>
          ws
            .cell(rowAux, headingColumnIndex++)
            .string(heading)
            .style(styleDataHeader)
        );
        rowAux++;

        item.get().requests.length > 0
          ? item.get().requests.map((i: any, idx: number) => {
              ws.cell(rowAux, 1).string(`${i.client.fullName}`).style(styleData);
              ws.cell(rowAux, 2).string(`${i.date}  ${i.hour}`).style(styleData);
              ws.cell(rowAux, 3)
                .string(`${getNameTyService(i.idTypeService)}`)
                .style(styleData);
              ws.cell(rowAux, 4)
                .string(`${getNameTypePayment(i.idPayment)}`)
                .style(styleData);
              ws.cell(rowAux, 5).number(i.total).style(styleDataMoney);
              totalTransport = totalTransport + i.total;
              total = total + totalTransport;
              rowAux++;
            })
          : ws.cell(rowAux, 1).string('No existen viajes').style(styleHeader);
        item.get().requests.length > 0 && ws.cell(rowAux, 4).string('Total:').style(styleHeader);

        item.get().requests.length > 0 && ws.cell(rowAux, 5).number(totalTransport).style(styleDataMoney);

        //   // fin de una iteracion
        rowAux = rowAux + 5;
      });
  // set Total ganacias
  ws.cell(3, 5).number(total).style(styleDataMoney);

  ws2.column(1).setWidth(30);
  ws2.column(2).setWidth(30);
  ws2.column(3).setWidth(30);
  ws2.column(4).setWidth(30);
  ws2.column(5).setWidth(30);
  ws2.column(6).setWidth(30);
  ws2.column(7).setWidth(30);
  ws2.column(8).setWidth(30);
  ws2.column(9).setWidth(30);
  ws2
    .cell(1, 1)
    .string(isMonst === '' ? 'REPORTE DE EMPRESAS' : `REPORTE DE EMPRESAS DEL MES ${isMonst.toUpperCase()}, ${year}`)
    .style(styleHeaderTotal);

  ws2.cell(3, 1).string('Fecha de Creación del Reporte:').style(styleHeader);
  ws2.cell(3, 2).string(moment().format('DD/MM/YYYY HH:mm:ss')).style(styleDetail);

  const headingColumnNames = ['Nombre Empresa', 'Nombre Cliente', 'Conductor', 'Fecha Viaje', 'Tipo de Orden', 'Total'];

  //Write Column Title in Excel file
  let headingColumnIndex = 1;
  let rowAux2 = 5;
  headingColumnNames.forEach((heading) =>
    ws2
      .cell(rowAux2, headingColumnIndex++)
      .string(heading)
      .style(styleDataHeader)
  );

  rowAux2++;

  requestBuss.length > 0
    ? requestBuss
        .filter((request) => request.get().requests.length > 0)
        .map((item: Model<any, any>, idx: number) => {
          if (item.get().requests) {
            item.get().requests.length > 0 &&
              item.get().requests.map((i: any, idx: number) => {
                ws2.cell(rowAux2, 1).string(`${item.get().company.toUpperCase()}`);
                ws2.cell(rowAux2, 2).string(`${item.get().fullName.toUpperCase()}`);
                ws2.cell(rowAux2, 3).string(`${i.userInCharge ? i.userInCharge.fullName.toUpperCase() : '-'}`);
                ws2.cell(rowAux2, 4).string(`${i.date}  ${i.hour}`);
                ws2.cell(rowAux2, 5).string(`${getNameTyService(i.idTypeService)}`);
                ws2.cell(rowAux2, 6).number(i.total).style(styleDataMoney2);
                rowAux2++;
              });
          }
        })
    : ws2.cell(rowAux2, 1).string('No existen viajes').style(styleHeader);

  const fileName = `ReportGeneral.xlsx`;

  wb.write(`dist/public/uploads/reports/${fileName}`);

  return fileName;
};
