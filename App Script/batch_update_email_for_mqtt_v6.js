batch_update_email_for_mqtt = async () => {
  // 筛选所有wifi设备
  let profile_devices = cloneDeep(erp.info.profile.profile_device);
  let wifi_devices = profile_devices.filter(
    (device) =>
      device.device_model.includes('360') ||
      device.device_model.includes('780') ||
      device.device_model.includes('790') ||
      device.device_model.includes('121') ||
      device.device_model.includes('103')
  );
  console.log(_('Found wifi devices:'), wifi_devices);

  const update_email_command = (guid) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取profile email
        let profile_email = erp.info.profile.profile_email;
        if (!profile_email) {
          profile_email = erp.info.profile.owner;
        }
        debugger
        let command = '932200' + profile_email.length.toString(16).pad('0000') + profile_email.toLowerCase().convertToHex();
        let bleList = [
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: command,
          },
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: '810e',
          },
        ];

        await window.peripheral[guid].write(bleList);
        profile_devices.forEach(device => {
          if(device.device == guid){
            device.gatewway = `${core_utils_get_mac_address_from_guid(guid)}-${profile_email}`;
          }
        });
        //update the profile data
        await http2.request(`/api/resource/Profile/${erp.info.profile.name}`, {
          method: 'PUT',
          serializer: 'json',
          responseType: 'json',
          debug: true,
          data: {
            profile_device : profile_devices
          },
        });
        await iot_device_setting_sync_server(guid,'Email Address',profile_email);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // 处理每个设备的更新
  for (let i = 0; i < wifi_devices.length; i++) {
    const device = wifi_devices[i];
    const device_guid = device.device;
    const device_name = `${device.device_model}-${device.device_name}`;

    let success = false;

    // 重试循环，直到成功或用户取消
    while (!success) {
      try {
        console.log(_('Updating device') + ` ${device_name} (${device_guid})...`);
        app.dialog.preloader(`${device_name} ${_('Updating...')}`);
        await update_email_command(device_guid);
        console.log(_('Device updated successfully') + `: ${device_name}`);
        success = true;
        app.dialog.close();
      } catch (error) {
        console.error(_('Device update failed') + `: ${device_name}`, error);
        app.dialog.close();

        // 使用f7的对话框询问用户是否重试
        const shouldRetry = await new Promise((resolve) => {
          app.dialog.confirm(
            _('Device update failed, please make sure you are close to the device and try again.') + _('Device ') + `: ${device_name}`,
            () => resolve(true), // 确认重试
            () => resolve(false) // 取消，跳过此设备
          );
        });

        if (!shouldRetry) {
          app.dialog.close();
          console.log(_('User chose to skip device') + `: ${device_name}`);
          success = true; // 跳过此设备，继续下一个
        }
        // 如果用户选择重试，则继续while循环
      }
    }
  }

  console.log(_('All devices processed'));
};
