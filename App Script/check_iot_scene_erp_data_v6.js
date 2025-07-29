check_iot_scene_erp_data = async () => {
  let profile_devices = cloneDeep(erp.info.profile.profile_device);
  let scenes = cloneDeep(erp.info.scene);
  let curtain_check_status = true;
  //check the wifi device
  let wifi_devices = profile_devices.filter((item) => (item.device_model.includes('YO121') || item.device_model.includes('360') || item.device_model.includes('YO103')));
  let curtain_devices = profile_devices.filter((item) => item.device_model.includes('YO121'));
  let curtain_scene_list = [];
  let wifi_scene_list = [];
  for (let i in scenes) {
    if (scenes[i].scene_template == 'RCU Curtain') {
      curtain_scene_list.push(scenes[i]);
    }
    //reset scene
    if (scenes[i].scene_template == 'RCU Radar' && scenes[i].title.toLowerCase().includes('reset')) {
      wifi_scene_list.push(scenes[i]);
    }
    if (scenes[i].scene_template == 'Welcome Scene') {
      wifi_scene_list.push(scenes[i]);
    }
  }
  if(curtain_scene_list.length == 0){
    curtain_check_status = false;
  }
  console.log("wifi_devices",wifi_devices)

  //check the curtain device
  for (let i in curtain_scene_list) {
    let isCorrect = false;
    let action = curtain_scene_list[i].action;
    curtain_devices.forEach((item)=>{
      let guid = item.device;
      let mac = core_utils_get_mac_address_from_guid(guid);
      let action_check = action.includes(mac);
      let action_guid_check = action.includes(guid);
      if(action_guid_check && action_check){
        isCorrect = true;
        return;
      }
    })
    if(!isCorrect){
      app.dialog.alert(tran(curtain_scene_list[i].title) + _(' is not correct'));
    }
  }

  //check the wifi device
  for (let i in wifi_scene_list) {
    let action = wifi_scene_list[i].action;
    let ui_configuration = wifi_scene_list[i].ui_configuration;
    let scene_template = wifi_scene_list[i].scene_template;
    let deviceStatusList = [];
    if (isset(ui_configuration)) {
      try {
        deviceStatusList = JSON.parse(ui_configuration).deviceStatusList;
      } catch (error) {
        console.log('error', error);
      }
    }
    wifi_devices.forEach((item) => {
      let isCorrect = false;
      let guid = item.device;
      let mac = core_utils_get_mac_address_from_guid(guid);
      let action_check = action.includes(mac);
      let action_guid_check = action.includes(guid);
      let ui_configuration_check = ui_configuration.includes(`${guid}_device`);
      console.log('action check', action_check);
      console.log('ui_configuration check', ui_configuration_check);
      console.log('action_guid_check', action_guid_check);
      if (scene_template == 'Welcome Scene' && wifi_scene_list[i].title.toLowerCase().includes('no people')) {
        // no people
        if (action_guid_check && action_check) {
          isCorrect = true;
        }
      } else if (scene_template == 'Welcome Scene') {
        // welcome mode
        if (action_guid_check && action_check && ui_configuration_check) {
          if (deviceStatusList.length > 0) {
            deviceStatusList.forEach((item) => {
              if (item.device == guid) {
                isCorrect = true;
              }
            });
          }
        }
      } else {
        // reset scene
        if (action_guid_check && action_check) {
          isCorrect = true;
        }
      }
      if (!isCorrect) {
        app.dialog.alert(_(item.device_model+'-' + item.device_name) + ' in ' + tran(wifi_scene_list[i].title) + _(' is not correct'));
      }
    });
  }
  //check other wifi devices

  if (!curtain_check_status) {
    app.dialog.alert(_('Can not find the scene for curtain device'));
  } else {
    // app.dialog.alert(_('All curtain device have the scene'));
  }
};
