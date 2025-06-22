import { HOSTNAME } from '../config/config';

export const emailRecoverPassword = (token: any, name?: string) => {
  const template = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <head> 
        <meta charset="UTF-8"> 
        <meta content="width=device-width, initial-scale=1" name="viewport"> 
        <meta name="x-apple-disable-message-reformatting"> 
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
        <meta content="telephone=no" name="format-detection"> 
        <title>Activa tu cuenta</title> 
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
            width: 203px;
            height: 58px;
            background: #181818;
            border-radius: 40px;
            color: white;
            text-decoration: none;
            font-style: normal;
            font-weight: 600;
            font-size: 18px;
            cursor: pointer;
            margin: 20px 0px;
          }

          .main-container{
            width: 300px;
            padding: 10px 0px;
            text-align: start;
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
                <td valign="top" style="vertical-align:top;padding:0">
                  <div style="text-align:center">
                    <img style="object-fit: contain; height:290px;" src="${HOSTNAME}/assets/logo2.png" alt="WE-U">
                    <div style="margin-bottom:20px; color:black;">
                      <h2>Solicitud de cambio de contraseña</h2>
                    </div>
                    <div>
                      <div style="margin-bottom:10px;">
                        <p> Usted ha realizado una solicitud de recuperación o cambio de contraseña</p>
                      </div>

                      <div style="margin-bottom:10px;">
                        <p> 
                          Si usted no solicito recuperar su clave, se recomienda cambiarla lo antes posible.
                        </p>
                        <p>
                          <strong>
                            Para restablecer la contraseña de clic en el siguiente boton
                          </strong>  
                        </p>

                        <div style="margin-bottom:10px;">
                          <a href="${process.env.HOSTWEB}/restaurar-credenciales/?token=${token}">
                            <button class="btn">Reestablecer contraseña</button>
                          </a>
                      </div>   
                    </div>
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

export const emailForSubAdminCredentials = (username: string, password: string) => {
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
              width: 203px;
              height: 58px;
              background: #181818;
              border-radius: 40px;
              color: white;
              text-decoration: none;
              font-style: normal;
              font-weight: 600;
              font-size: 18px;
              cursor: pointer;
              margin: 20px 0px;
            }

            .main-container{
              width: 300px;
              padding: 10px 0px;
              text-align: start;
            }
           
            @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:28px!important; text-align:center } h2 { font-size:24px!important; text-align:center } h3 { font-size:18px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:28px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:18px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:13px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:11px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:11px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:16px!important; display:inline-block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
          </style> 
        </head> 
        <body style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> 
          
            <div class="container">
              <table style="width:100%;">
                <tbody>
                  <tr style="vertical-align:top;padding:0">
                  <td valign="top" style="vertical-align:top;padding:0" align="center">
                    <img style="object-fit: contain; width: 100%; height:290px;" src="${HOSTNAME}/assets/logo2.png" alt="WE-U">
                    <div class="main-container">
                    
                      <div style="margin-bottom:20px; color:black;">
                        <h4>Estimad@ usuario:</h4>
                      </div>
                      <div>
                        <div style="margin-bottom:10px;">
                          <p> Usted ha sido registrado en el sistema como sub administrador, con lo que compartimos sus credenciales</p>
                        </div>
                        
                        <div style="margin-bottom:10px;">
                          <ul>
                            <li>Correo electronico:  <strong>${username}</strong></li>
                            <li>Contraseña: <strong>${password}</strong></li>
                          </ul>
                        </div>

                        <div style="margin-bottom:10px;">
                          <p>
                            <strong>
                              Usted puede ingresar al Portal de Adminstración dando clic en siguiente boton
                            </strong>  
                          </p>
                        </div>
                        
                        <div style="margin-bottom:10px;">
                          <a href="${process.env.HOSTWEB}/auth/singin">
                            <button class="btn">Ingresar</button>
                          </a>
                        </div>

                      </div>
                    </div
                      
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

export const emailConfirmAccount = (name: string, token: any) => {
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
              width: 203px;
              height: 58px;
              background: #181818;
              border-radius: 40px;
              color: white;
              text-decoration: none;
              font-style: normal;
              font-weight: 600;
              font-size: 18px;
              cursor: pointer;
              margin: 20px 0px;
            }

            .main-container{
              width: 300px;
              padding: 10px 0px;
              text-align: start;
            }
            
            @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:28px!important; text-align:center } h2 { font-size:24px!important; text-align:center } h3 { font-size:18px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:28px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:18px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:13px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:11px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:11px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:16px!important; display:inline-block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
            @media only screen and (max-width:600px) {
              img{
                width:100%;
              }
              .main-container{
                width: 300px;
                padding: 10px 0px;
                text-align: center;
              }
            }
          </style> 
        </head> 
        <body style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> 
          
            <div class="container">
              <table style="width:100%;">
                <tbody>
                  <tr style="vertical-align:top;padding:0">
                    <td valign="top" style="vertical-align:top;padding:0" align="center">
                      <img style="object-fit: contain; height:290px;" src="${HOSTNAME}/assets/logo2.png" alt="WE-U">
                      <div class="main-container">
                        <div style="margin-bottom:20px; color:black;">
                          <label style="
                          font-size: 24px;
                          color: black;
                          font-weight: bold;">Te damos la bienvenida</label>
                        </div>
                        <div style="margin-bottom:20px; color:black;">
                          <label style="
                          color: black;
                          font-weight: 600;">Confirma tu e-mail</label>
                        </div>
                        <div>
                          <div style="margin-bottom:10px;">
                            <p> Gracias por elegir nuestra plataforma, da clic en confirmar para verificar tus datos</p>
                          </div>

                          <div style="">
                            <a href="${process.env.HOSTWEB}/account/confirm/?token=${token}">
                              <button class="btn">Confirmar</button>
                            </a>
                          </div>

                          <div style="margin-top:60px;">
                            <label style="font-size:11px; color: #D6D6D6;">Si recibiste es correo por error, por favor ignoralo</label>
                          </div>
                        </div>
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

export const emailASCSubZone = (nameASC: string, nameSubscriber: string, correo: string, pass: string) => {
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
              width: 203px;
              height: 58px;
              background: #181818;
              border-radius: 40px;
              color: white;
              text-decoration: none;
              font-style: normal;
              font-weight: 600;
              font-size: 18px;
              cursor: pointer;
              margin: 20px 0px;
            }

            .main-container{
              width: 400px;
              padding: 10px 0px;
              text-align: start;
            }
            .stores{
              width: 200px;
            }

            
            @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:28px!important; text-align:center } h2 { font-size:24px!important; text-align:center } h3 { font-size:18px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:28px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:18px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:13px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:11px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:11px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:16px!important; display:inline-block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
            @media only screen and (max-width:600px) {
              img{
                width:100%;
              }
              .main-container{
                width: 300px;
                padding: 10px 0px;
                text-align: center;
              }

              .stores{
                width: 150px;
              }
            }
          </style> 
        </head> 
        <body style="width:100%;font-family:tahoma, verdana, segoe, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> 
          
            <div class="container">
              <table style="width:100%;">
                <tbody>
                  <tr style="vertical-align:top;padding:0">
                    <td valign="top" style="vertical-align:top;padding:0" align="center">
                      <img style="object-fit: contain; height:290px;" src="${HOSTNAME}/assets/logo2.png" alt="WE-U">
                      <div class="main-container">
                        <div style="margin-bottom:20px; color:black;">
                          <label style="
                          font-size: 24px;
                          color: black;
                          font-weight: bold;">Te damos la bienvenida</label>
                        </div>
                        <div style="margin-bottom:20px; color:black;">
                          <label style="
                          color: black;
                          font-weight: 600;">Hola ${nameASC}</label>
                        </div>
                        <div>
                          <div style="margin-bottom:15px;">
                            <p> Has sido seleccionado a unirte a la comunidad de <strong>${nameSubscriber}</strong> como agente de seguridad comunitaria</p>
                          </div>

                          <div style="margin-bottom:20px;">
                          <table style="border: 0px; width: 100%; margin: 0 auto; border-collapse: collapse;">
                              <tr style="border: 0px;">
                                <td style="text-align:left border: 0px;"><strong>Correo electrónico:</strong></td>
                                <td style="text-align:left border: 0px;">${correo}</td>
                              </tr>
                              <tr style="border: 0px;">
                                <td style="text-align:left border: 0px;"><strong> Contraseña:</strong></td>
                                <td style="text-align:left border: 0px;">${pass}</td>
                              </tr>
                            </table>
                          </div>

                          <div style="margin-bottom:5px;">
                            <p> Descarguese la aplicación WE-U</p>
                          </div>

                          <div  style="margin-bottom:10px;">
                            <a href="https://play.google.com/store/apps/details?id=com.bitproy.weu">
                              <img class="stores" width="200px" src="https://play.google.com/intl/es-419/badges/static/images/badges/es-419_badge_web_generic.png" alt="Get it on Google Play">
                            </a>
                          </div>

                          <div  style="margin-bottom:5px;">
                            <a href="">
                              <img class="stores" width="200px" src="https://applicantes.com/wp-content/uploads/2013/08/appstore_es.jpg" alt="Get it on Google Play">
                            </a>
                          </div>
                        </div>
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
