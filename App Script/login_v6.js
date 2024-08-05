/********************************************************************************************/
/*                                                                                          */
/* in UI, func="XXXX" without erp.script.                                                   */
/* in code, use erp.script.XXXX()                                                           */
/* if want to use function name directly, please add below line at the end of this textarea */
/* window.XXXX = erp.script.XXXX                                                            */
/*                                                                                          */
/********************************************************************************************/
window.login = async (params) => {
  console.log('login', params);
  implicitLogin = params.implicit || false;

  // cordova.plugin.http.setFollowRedirect(true);
  let data = { usr: '', pwd: '', device: 'mobile' };
  if (isset(params.usr) && isset(params.pwd)) {
    data.usr = params.usr;
    data.pwd = params.pwd;
  } else {
    data = app.utils.extend(data, app.form.convertToData('#login-form'));

    if (data.usr.trim() == '' || data.pwd.trim() == '') {
      return;
    }
    app.preloader.show();
  }

  let userInfo;
  try {
    await http.request('/api/method/logout', {
      method: 'POST',
      dataType: 'json',
      data: {},
    });
  } catch (e) {}
  try {
    userInfo = await http.request('/api/method/login', {
      method: 'POST',
      data: data,
      xhrFields: { withCredentials: true },
      cache: false,
      ContentType: 'application/json',
      responseType: 'json',
    });
  } catch (e) {
    app.preloader.hide();
    try {
      let message = JSON.parse(e)['message'];
      if (message && !isset(params.implicit)) {
        if (message == 'User disabled or missing') {
          app.dialog.alert(
            _('The account is marked as deleted. Please contact the administrator if you would like to reactivate the account!')
          );
        } else if (message == 'Invalid login credentials') {
        //   if(data.usr=='takyeyu@gmail.com'){
            sync_from_old_yoswit(data.usr, data.pwd);
        //   }else{
        //     app.dialog.alert(_('Username and Password is incorrect, please check and try again.'));
        //   }
        } else {
          app.dialog.alert(_(message));
        }
        return;
      }
    } catch (__) {
      app.dialog.alert(_(`${e}`));
    }
  }

  if (userInfo) {
    try {
      // get cookie detail
      let temp = userInfo['headers']['set-cookie'].split(';');
      for (let i in temp) {
        if (temp[i].trim().startsWith('Path=/,') || temp[i].trim().startsWith('SameSite=Lax,')) {
          let keypair = temp[i].trim().replace('Path=/,', '').replace('SameSite=Lax,', '').split('=');
          if (keypair.length < 2) continue;

          keypair[0] = keypair[0].trim();
          keypair[1] = keypair[1].trim();
          if (keypair[0] == 'user_id') {
            data.usr = keypair[1].replace('%40', '@');

            // alert(keypair[1]);
            // alert(data.usr);
            break;
          }
        }
      }
      let key = data.usr + '@' + erp.appId;

      //login success
      if (!isset(users[key])) {
        users[key] = {};
      }
      delete data.device;

      // set erp detail
      users[key] = app.utils.extend(users[key], data);
      users[key].gateway = deviceInfo.deviceId + '-' + data.usr;
      users[key].app_id = erp.appId;
      users[key].app_api_url = erp.setting.app_api_url;
      users[key].logo = erp.setting.logo;
      users[key].social_login = false;
      users[key].social_app_api_url = '';
      users[key].social_usr = '';
      users[key].social_pwd = '';

      // set cookie detail
      for (let i in temp) {
        if (temp[i].trim().startsWith('Path=/,') || temp[i].trim().startsWith('SameSite=Lax,')) {
          let keypair = temp[i].trim().replace('Path=/,', '').replace('SameSite=Lax,', '').split('=');
          if (keypair.length < 2) continue;

          keypair[0] = keypair[0].trim();
          keypair[1] = keypair[1].trim();
          users[key][keypair[0]] = decodeURI(keypair[1]);
          try {
            if (keypair[0] == 'user_image') {
              users[key][keypair[0]] = await http.downloadToFile(erp.setting.app_api_url + keypair[1], md5(keypair[1]));
            }
          } catch (error) {}
        }
      }
      users['current'] = key;

      // change the default app to current login one
      if (isset(appInfo.virtualId) && appInfo.virtualId != '') {
        appInfo.id = appInfo.virtualId;
        appInfo.virtualId = null;
        await db.set('appInfo', JSON.stringify(appInfo));
      }

      // reload app setting
      let networkAppSetting = JSON.parse(
        (
          await http.request('/api/method/appv6.getAppSetting?appId=' + erp.appId, {
            timeout: 60,
          })
        ).data
      ).config;
      if (isset(erp.settings[erp.appId])) {
        // update
        erp.settings[erp.appId] = { ...erp.settings[erp.appId], ...networkAppSetting };
        await db.set('appSettings', JSON.stringify(erp.settings));
      } else {
        erp.settings[erp.appId] = { ...networkAppSetting };
        await db.set('appSettings', JSON.stringify(erp.settings));
      }

      // reload master
      erp.doctype = {};
      erp.script = {};
      erp.pageScript = {};
      erp.doctype = JSON.parse(await db.get(erp.appId + '_master')) || {};
      let timeout = 5;
      erp.doctype = app.utils.extend(
        erp.doctype,
        JSON.parse(
          (
            await http.request('/api/method/appv6.getMaster?modified=' + (erp.doctype.modified || '1970-01-01 00:00:00'), {
              timeout: timeout,
							cacheStrategy: false
            })
          ).data
        )
      );
      db.set(erp.appId + '_master', JSON.stringify(erp.doctype));
      if (isset(erp.doctype.app_script)) {
        let errorScript = [];
        for (let i in erp.doctype.app_script) {
          if (erp.doctype.app_script[i].status == 'Deprecated') continue;
          try {
            eval(erp.doctype.app_script[i].javascript);
          } catch (e) {
            errorScript.push(i);
          }
        }
        if (errorScript.length > 0)
          app.dialog.alert(_('The below script(s) have error, please fixed.<br />') + errorScript.join('<br />\n'));
      }

      await theme.setMode(appInfo.themeMode, appInfo.id);
    } catch (e) {}
  } else {
    let key = data.usr + '@' + erp.appId;
    delete users[key];
    users['current'] = null;
  }
  await db.set('users', JSON.stringify(users));

  app.preloader.hide();
  everythingReady();
};
