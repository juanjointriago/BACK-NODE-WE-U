"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailPayment = exports.emailConfirmation = void 0;
const config_1 = require("../config/config");
const user_enum_1 = require("../enums/user.enum");
/**
 * Generate the email confirmation template for the given name and roleId.
 *
 * @param {string} name - The name of the user.
 * @param {number} roleId - The role ID of the user.
 * @return {string} The email confirmation template.
 */
const emailConfirmation = (name, roleId) => {
    const template = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
        <head> 
          <meta charset="UTF-8"> 
          <meta content="width=device-width, initial-scale=1" name="viewport"> 
          <meta name="x-apple-disable-message-reformatting"> 
          <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
          <meta content="telephone=no" name="format-detection"> 
          <title><CREDENCIALES DEL SUB ADMINISTADOR></title> 
          <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
          <style type="text/css">
            #outlook a {
            padding:0;
            }
            .ExternalClass {
            width:100%;
            }
            .container{
              padding: 30px;
              color: #4c4c4c;
              font-size: 15px;
              line-height: 150%;
              font-family: proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;
            }
            .centerDiv {
              display: grid;
              height: 100vh;
              place-items: center;
            }
            .btn {
              width: 254px;
              height: 58px;
              background: rgba(0,0,0,0.8);
              border-radius: 10px;
              color: white;
              text-decoration: none;
              font-style: normal;
              font-weight: 600;
              font-size: 18px;
              cursor: pointer;
              margin: 20px 0px;
            }
           
            @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:28px!important; text-align:center } h2 { font-size:24px!important; text-align:center } h3 { font-size:18px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:28px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:18px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:13px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:11px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:11px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:16px!important; display:inline-block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
          
            @media only screen and (max-width:600px) {
              img{
                width:100%;
              }
            }
          </style> 
        </head> 
        <body style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> 
          
            <div class="container">
              <table style="width:100%;">
                <tbody>
                  <tr style="vertical-align:top;padding:0">
                    <td valign="top" style="vertical-align:top;padding:0" >
                      <div style="text-align:center">
                        <img style="object-fit: contain; height:290px;" src="${config_1.HOSTNAME}/assets/logo2.png" alt="WE-U">
                        <div style="margin-bottom:10px;">
                            <h3>Hola ${name}, su cuenta ha sido activada.</h3>
                        </div>
                          <div style="margin-bottom:10px;">
                            <p>
                                ${roleId === user_enum_1.UserRoles.SubAdmin || roleId === user_enum_1.UserRoles.Subscriber ? 'Usted puede ingresar al Portal de Adminstración dando clic en siguiente boton' : 'Usted ya puede ingresar desde la aplicación'}
                            </p>
                          </div>
                          ${roleId === user_enum_1.UserRoles.SubAdmin || user_enum_1.UserRoles.Subscriber
        ? `
                              <div style="margin-bottom:10px;">
                                  <a href="${process.env.HOSTWEB}/auth/signin">
                                      <button class="btn">Ingresar</button>
                                  </a>
                              </div>
                          `
        : ''}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>  
            </div>
        </body>
      </html>
    `;
    return template;
};
exports.emailConfirmation = emailConfirmation;
/**
 * Generates the email template for a payment receipt.
 *
 * @param {UserPaymentInfo} name - The user's payment information.
 * @param {string} name.name - The name of the user.
 * @param {string} name.identification - The identification of the user.
 * @param {number} name.numOrden - The order number.
 * @param {number} name.subtotal - The subtotal of the payment.
 * @param {number} name.total - The total amount of the payment.
 * @param {number} name.iva - The IVA amount of the payment.
 * @param {string} name.detail - The payment detail.
 * @param {string} name.date - The payment date.
 * @param {string} name.dateUntil - The date until the subscription is valid.
 * @return {string} The generated email template.
 */
const emailPayment = ({ name, identification, numOrden, subtotal, total, iva, detail, date, dateUntil, detailsPayment }) => {
    const template = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
        <head> 
          <meta charset="UTF-8"> 
          <meta content="width=device-width, initial-scale=1" name="viewport"> 
          <meta name="x-apple-disable-message-reformatting"> 
          <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
          <meta content="telephone=no" name="format-detection"> 
          <title>Pago de subscripción</title> 
          <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
          <style type="text/css">
            #outlook a {
            padding:0;
            }
            .ExternalClass {
            width:100%;
            }
            .container{
              padding: 30px;
              color: #4c4c4c;
              font-size: 15px;
              line-height: 150%;
              font-family: proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;
            }
            .centerDiv {
              display: grid;
              height: 100vh;
              place-items: center;
            }
            .btn {
              width: 254px;
              height: 58px;
              background: rgba(0,0,0,0.8);
              border-radius: 10px;
              color: white;
              text-decoration: none;
              font-style: normal;
              font-weight: 600;
              font-size: 18px;
              cursor: pointer;
              margin: 20px 0px;
            }
            .total{
              text-align: right;
            }

            table {
              width: 80%;
              margin: 0 auto;
              border-collapse: collapse;
            }
  
            tableDetail {
                border: 1px solid black;
            }
    
            th, td {
                padding: 8px;
                text-align: left;
            }
           
            @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:28px!important; text-align:center } h2 { font-size:24px!important; text-align:center } h3 { font-size:18px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:28px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:18px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:13px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:11px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:11px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:16px!important; display:inline-block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
          
            @media only screen and (max-width:600px) {
              img{
                width:100%;
              }
            }
          </style> 
        </head> 
        <body style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> 
          
            <div class="container">
              <table style="width:100%;">
                <tbody>
                  <tr style="vertical-align:top;padding:0">
                    <td valign="top" style="vertical-align:top;padding:0" >
                      <div style="text-align:center">
                        <img style="object-fit: contain; height:290px;" src="${config_1.HOSTNAME}/assets/logo2.png" alt="WE-U">
                        <div style="margin-bottom:10px;">
                            <h2> Detalle de su compra</h2>
                        </div>
                        <div style="margin-bottom:20px;">
                          <table style="border: 0px;">
                            <tr style="border: 0px;">
                              <td style="text-align:left border: 0px;"><strong>Número de orden:</strong></td>
                              <td style="text-align:left border: 0px;">${numOrden}</td>
                            </tr>
                            <tr style="border: 0px;">
                              <td style="text-align:left border: 0px;"><strong> Cédula o ruc:</strong></td>
                              <td style="text-align:left border: 0px;">${identification}</td>
                            </tr>
                            <tr style="border: 0px;">
                              <td style="text-align:left border: 0px;"><strong> Cliente:</strong></td>
                              <td style="text-align:left border: 0px;">${name}</td>
                            </tr>
                            <tr style="border: 0px;">
                              <td style="text-align:left border: 0px;"><strong> Fecha de emision:</strong></td>
                              <td style="text-align:left border: 0px;">${date}</td>
                            </tr>
                          </table>
                        </div>
                        <div style="margin-bottom:10px;">
                          <table style="border: 1px solid #EDEDED;">
                            <tr>
                                <th style="border: 1px solid #EDEDED; text-align: center;">CANT.</th>
                                <th style="border: 1px solid #EDEDED; text-align: center;">DETALLE</th>
                                <th style="border: 1px solid #EDEDED; text-align: center;">V. UNIT.</th>
                                <th style="border: 1px solid #EDEDED; text-align: center;">V. TOTAL</th>
                            </tr>
                            ${detailsPayment === null || detailsPayment === void 0 ? void 0 : detailsPayment.map((detail) => `
                              <tr>
                                  <td style="border: 1px solid #EDEDED; text-align: center;">${detail.get().units}</td>
                                  <td style="border: 1px solid #EDEDED;">${detail.get().item}</td>
                                  <td style="border: 1px solid #EDEDED; text-align: right;">${detail.get().price_unit}</td>
                                  <td style="border: 1px solid #EDEDED; text-align: right;">${detail.get().subtotal}</td>
                              </tr>
                              `).join('')}
                            
                            <tr>
                                <td class="total" style="border: 1px solid #EDEDED;" colspan="3"><strong>Subtotal</strong> </td>
                                <td style="border: 1px solid #EDEDED; text-align: right;">${subtotal}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #EDEDED;" class="total" colspan="3"> <strong>IVA</strong></td>
                                <td style="border: 1px solid #EDEDED; text-align: right;" >${iva}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #EDEDED; " colspan="3" class="total"><strong>Total de la Compra</strong></td>
                                <td style="border: 1px solid #EDEDED; text-align: right;">${total}</td>
                            </tr>
                          </table>
                        </div> 
                        ${dateUntil
        ? `<div style="margin-bottom:10px;">
                            <p> Su suscripción estará vigente hasta el <strong>${dateUntil}</strong></p>
                        </div>`
        : ``}
                        
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>  
            </div>
        </body>
      </html>
    `;
    return template;
};
exports.emailPayment = emailPayment;
//# sourceMappingURL=userEmails.js.map