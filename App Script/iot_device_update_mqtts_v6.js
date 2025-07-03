window.iot_device_update_mqtts = async(params)=>{
  const guid = params.ref;
  const profile_device_name = params.obj.attr('profile-device-name');
  const profile_subdevice_name = params.obj.attr('profile-subdevice-name');
  const extractVersion = (version) => {
    const v = version.match(/[0-9.]+/)[0];
    // apple store semantic format support
    const semanticVersion = v.replace(/(\d+)\.(\d)(\d+)/, '$1.$2.$3');
    try {
      return semanticVersion
        .split('.')
        .map((e) => parseInt(e))
        .join('.');
    } catch (err) {
      return semanticVersion;
    }
  }
  //check the firmware version
  let firmware_version = window.peripheral[guid].prop.firmware;
  if(parseFloat(extractVersion(firmware_version)) < 13.5){
    app.dialog.close();
    app.dialog.alert(_('Please update the firmware to v13.5 or above'));
    return;
  }
  app.dialog.preloader();
  setTimeout(() => {
    app.dialog.close();
    //mainView.router.back();
  }, 30000);
  try {
    await iot_ble_check_enable();
    if(deviceInfo.operatingSystem != 'ios'){
      await ble.requestMtu(
        peripheral[guid].prop.id,
        512,
        ()=>{},
        ()=>{},
      )
    }
    let bleList = [];
    let deviceMap = cloneDeep(erp.info.device[guid])
    if(!deviceMap){
      app.dialog.close();
      app.dialog.alert(_('Device not found'));
      return;
    }
    let settings = deviceMap.settings;
    let settingMap = {};
    settings.forEach((item)=>{
      if(item.setting_type == 'Wifi SSID'){
        settingMap.ssid = item.setting;
      }
      if(item.setting_type == 'Wifi Password'){
        settingMap.ssid_password = item.setting;
      }
      if(item.setting_type == 'Email Address'){
        settingMap.email = item.setting;
      }
      if(item.setting_type == 'Server Port'){
        settingMap.port = item.setting;
      }
      if(item.setting_type == 'Server URI'){
        settingMap.server_url = `mqtts://${erp.settings[erp.appId].mqtt_server}`;
      }
      if(item.setting_type == 'Server Username'){
        settingMap.username = item.setting;
      }
      if(item.setting_type == 'Server Password'){
        settingMap.password = item.setting;
      }
    })
    if(!settingMap.username){
      settingMap.username = 'iot-device-themira';
    }
    if(!settingMap.password){
      settingMap.password = 'Uiop0987!@#';
    }
    if(!settingMap.ssid || !settingMap.ssid_password || !settingMap.email || !settingMap.port || !settingMap.server_url || !settingMap.username || !settingMap.password){
      app.dialog.close();
      app.dialog.alert(_('Please fill in all the fields'));
    }
    //ssid
    let ssid_data = '932000' + settingMap.ssid.length.toString(16).pad('0000') + settingMap.ssid.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: ssid_data,
    });
    //ssid_password
    let ssid_password_data =
      '932100' + settingMap.ssid_password.length.toString(16).pad('0000') + settingMap.ssid_password.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: ssid_password_data,
    });
    //email
    let email_data =
      '932200' +
      settingMap.email.toLowerCase().length.toString(16).pad('0000') +
      settingMap.email.toLowerCase().convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: email_data,
    });
    //server_url
    let server_url_data =
      '930000' + settingMap.server_url.length.toString(16).pad('0000') + settingMap.server_url.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: server_url_data,
    });
    //port
    let port_data = '9301000002' + (settingMap.port * 1).toString(16).pad('0000');
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: port_data,
    });
    //username
    let username_data = '930200' + settingMap.username.length.toString(16).pad('0000') + settingMap.username.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: username_data,
    });
    //password
    let password_data = '930300' + settingMap.password.length.toString(16).pad('0000') + settingMap.password.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: password_data,
    });
    //write ble data
    try{
      await peripheral[guid].connect();
      await peripheral[guid].write(bleList);
    }catch(error){
      app.dialog.close();
      app.dialog.alert(_(erp.get_log_description(error)));
      return;
    }
    //post to erp data
    let profile_device = erp.info.profile.profile_device;
    let mac = core_utils_get_mac_address_from_guid(guid, false);
    profile_device.forEach((item)=>{
      if(item.name == profile_device_name){
        item.gateway = `${mac.toLowerCase()}-${settingMap.email.toLowerCase()}`;
      }
    })
    let url = `/api/resource/Profile/${erp.info.profile.name}`;
    let method = 'PUT';
    let data = {
      profile_device : profile_device
    };
    await http.request(url, {
      method: method,
      dataType: 'json',
      serializer: 'json',
      data: data,
      contentType: 'application/json',
    });
    //post to erp
    await iot_device_setting_sync_server(guid, null, null, true, {
      'Wifi SSID': settingMap.ssid,
      'Wifi Password': settingMap.ssid_password,
      'Email Address': settingMap.email || 'null',
      'Server Port': settingMap.port || 'null',
      'Server URI': settingMap.server_url || 'null',
      'Server Username': settingMap.username || 'null',
      'Server Password': settingMap.password || 'null',
    });
    //update the device gateway
    await http.request(`/api/method/appv6.checkDeviceGateways`, {
      method: 'POST',
      dataType: 'json',
      serializer: 'json',
      data: {
        guid: guid,
        platform: 'YO105',
        title: mac.toUpperCase(),
      },
      contentType: 'application/json',
    });
    //device restart
    await window.peripheral[guid].write([
      {
        service: 'ff80',
        characteristic: 'ff81',
        data: '810e',
      },
    ]);
    //wait 5s
    this.sleep(5000);
    await window.peripheral[guid].connect();
    app.dialog.close();
    window.globalUpdate = true;
    app.dialog.alert(_('Update Mqtts Successfully'));
  } catch (error) {
    app.dialog.close();
    window.globalUpdate = true;
    app.dialog.alert(_(erp.get_log_description(error)));
  }
}