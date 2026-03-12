
export const MailOtpHtml = (otpCode: string, type?: string): string => {

  const html = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title>
  </title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }
  </style>
  <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
  <!--[if lte mso 11]>
    <style type="text/css">
      .mj-outlook-group-fix { width:100% !important; }
    </style>
    <![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Roboto:300,400,500,700);
    @import url(https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap);
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-50 {
        width: 50% !important;
        max-width: 50%;
      }

      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }
  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-50 {
      width: 50% !important;
      max-width: 50%;
    }

    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }
  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }
  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      .mobile-text-center div {
        text-align: center !important;
      }

      .mobile-text-top {
        padding-top: 10px !important;
      }
    }
  </style>
</head>

<body style="word-spacing:normal;background-color:#ffffff;">
  <div style="background-color:#ffffff;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:16px 8px 0px 8px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:584px;" width="584" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><v:rect style="width:584px;" xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"><v:fill origin="0, -0.5" position="0, -0.5" src="https://lh3.googleusercontent.com/d/1LwI7I45SqhZbcJzD-gM0NeEVNeYyUnPP=w1000?authuser=1/view" type="frame" size="1,1" aspect="atleast" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0"><![endif]-->
              <div style="background:url('https://lh3.googleusercontent.com/d/1LwI7I45SqhZbcJzD-gM0NeEVNeYyUnPP=w1000?authuser=1/view') center top / cover no-repeat;background-position:center top;background-repeat:no-repeat;background-size:cover;margin:0px auto;border-radius:36px;max-width:584px;">
                <div style="line-height:0;font-size:0;">
                  <table align="center" background="https://lh3.googleusercontent.com/d/1LwI7I45SqhZbcJzD-gM0NeEVNeYyUnPP=w1000?authuser=1/view" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:url('https://lh3.googleusercontent.com/d/1LwI7I45SqhZbcJzD-gM0NeEVNeYyUnPP=w1000?authuser=1/view') center top / cover no-repeat;background-position:center top;background-repeat:no-repeat;background-size:cover;width:100%;border-radius:36px;">
                    <tbody>
                      <tr>
                        <td style="direction:ltr;font-size:0px;padding:18px 15px;text-align:center;">
                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:277px;" ><![endif]-->
                          <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="center" style="font-size:0px;padding:0px;word-break:break-word;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                      <tbody>
                                        <tr>
                                          <td style="width:150px;">
                                            <img height="150" src="https://lh3.googleusercontent.com/d/15PPHqMGW0G6pb18MY6jcEZs0NeefNIQh=w1000?authuser=1/view" style="border:0;border-radius:100px;display:block;outline:none;text-decoration:none;height:150px;width:100%;font-size:13px;" width="150" />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:277px;" ><![endif]-->
                          <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                              <tbody>
                                <tr>
                                  <td style="vertical-align:top;padding:0px;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                      <tbody>
                                        <tr>
                                          <td align="left" class="mobile-text-center mobile-text-top" style="font-size:0px;padding:10px 25px;padding-top:40px;word-break:break-word;">
                                            <div style="font-family:Roboto Condensed, Arial, sans-serif;font-size:28px;font-weight:bold;line-height:1;text-align:left;color:#ffffff;">Account</div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td align="left" class="mobile-text-center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                            <div style="font-family:Roboto Condensed, Arial, sans-serif;font-size:28px;font-weight:bold;line-height:1;text-align:left;color:#ffffff;">Verification Code</div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <!--[if mso | IE]></td></tr></table><![endif]-->
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <!--[if mso | IE]></v:textbox></v:rect></td></tr></table></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:5px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0px 8px 16px 8px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:584px;" width="584" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><v:rect style="width:584px;" xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"><v:fill origin="0, -0.5" position="0, -0.5" src="https://lh3.googleusercontent.com/d/1jlAV9-Lz1tK56puxQk8Wg191Axixy9H-=w1000?authuser=1/view" type="frame" size="1,1" aspect="atleast" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0"><![endif]-->
              <div style="background:url('https://lh3.googleusercontent.com/d/1jlAV9-Lz1tK56puxQk8Wg191Axixy9H-=w1000?authuser=1/view') center top / cover no-repeat;background-position:center top;background-repeat:no-repeat;background-size:cover;margin:0px auto;border-radius:36px;max-width:584px;">
                <div style="line-height:0;font-size:0;">
                  <table align="center" background="https://lh3.googleusercontent.com/d/1jlAV9-Lz1tK56puxQk8Wg191Axixy9H-=w1000?authuser=1/view" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:url('https://lh3.googleusercontent.com/d/1jlAV9-Lz1tK56puxQk8Wg191Axixy9H-=w1000?authuser=1/view') center top / cover no-repeat;background-position:center top;background-repeat:no-repeat;background-size:cover;width:100%;border-radius:36px;">
                    <tbody>
                      <tr>
                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:584px;" ><![endif]-->
                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                    <div style="font-family:Roboto Condensed, Arial, sans-serif;font-size:16px;font-weight:600;line-height:1;text-align:center;color:#ffffff;">Your OTP ${type || ""}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center" style="font-size:0px;padding:12px 0px 28px 0px;word-break:break-word;">
                                    <div style="font-family:Roboto Condensed, Arial, sans-serif;font-size:36px;font-weight:bold;line-height:1;text-align:center;color:#ffffff;">${otpCode}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center" style="font-size:0px;padding:18px 0px 8px 0px;word-break:break-word;">
                                    <div style="font-family:Roboto Condensed, Arial, sans-serif;font-size:12px;font-weight:600;line-height:1;text-align:center;text-decoration:underline;color:#ffffff;">Your OTP code will expire in 5 minutes.</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center" style="font-size:0px;padding:5px 0px 0px 0px;word-break:break-word;">
                                    <div style="font-family:Roboto Condensed, Arial, sans-serif;font-size:12px;font-weight:600;line-height:1;text-align:center;color:#ffffff;">Please do not share your code with anyone for security reasons.</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <!--[if mso | IE]></td></tr></table><![endif]-->
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <!--[if mso | IE]></v:textbox></v:rect></td></tr></table></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>`
  return html
}
