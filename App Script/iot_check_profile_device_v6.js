window.iot_check_profile_device = (type) => {
  return new Promise((resolve, reject) => {
    let is_check = true;
    //if type == 'rcu',check only the wifi device, if type 'ble' check all the device
    let profile_devices = cloneDeep(erp.info.profile.profile_device);
    if(type == 'rcu'){
      let check_devices_mode = ['Curtain Motor Ac','Thermostat','Hdmicec'];
      let profile_devices_filter = profile_devices.filter((item) => check_devices_mode.indexOf(item.device_mode) != -1 && !item.device);
      debugger
      if(profile_devices_filter.length > 0){
        is_check = false;
      }
    }else{
      let profile_devices_filter = profile_devices.filter((item) => !item.device);
      if(profile_devices_filter.length > 0){
        is_check = false;
      }
    }
    resolve(is_check);
  });
};
