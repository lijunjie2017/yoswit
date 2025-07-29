window.iot_device_repair = async (params) => {
  const guid = params.ref;
  const profile_device_name = params.obj.attr('profile-device-name');
  const profile_subdevice_name = params.obj.attr('profile-subdevice-name');
  let repair_device_model = '';
  try {
    let deviceObj = erp.info.device[guid];
    repair_device_model = deviceObj.device_model;
  } catch (error) {}
  /*
  repair功能需要包含一下内容：
  1.检测model是否有mesh功能，如果有mesh功能，则需要先reset mesh再重新mesh
  2.检测device setting得数据，主要检测ssid，password，email，server_url，port，username，password得设置
  3.如果检测到device setting有异常，如何恢复到复制的数据？
  4.恢复setting的数据
  5.恢复场景的数据
  */

  //check the device mesh status
  const check_device_mesh_status = (guid) => {
    return new Promise(async (resolve, reject) => {
      debugger;
      try {
        //check if no mesh device
        if (
          repair_device_model.includes('YO121-AC-R2W') ||
          repair_device_model.includes('M360s') ||
          repair_device_model.includes('YO103') ||
          repair_device_model.includes('YO790DC')
        ) {
          resolve(true);
          return;
        }
        let rcu_mesh_num = 0;
        let self_mesh_num = 0;
        //find the rcu device
        let profile_device = cloneDeep(erp.info.profile.profile_device);
        let rcu_device = profile_device.find((item) => item.device_model == 'YO780' || item.device_model == 'RCU Controller');
        if (rcu_device) {
          let rcu_device_guid = rcu_device.device;
          rcu_mesh_num = window.peripheral[rcu_device_guid].prop.mnSize;
        } else {
          resolve(false);
        }
        self_mesh_num = window.peripheral[guid].prop.mnSize;
        if (rcu_mesh_num == self_mesh_num && rcu_mesh_num > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(error);
      }
    });
  };
  const sleep_for_repair = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const reset_mesh_for_repair = async (guid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await window.peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: '8110',
          },
        ]);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  const get_network_id = () => {
    let network_id = '';
    let network_position = '';
    let profile_device = cloneDeep(erp.info.profile.profile_device);
    profile_device.forEach((item) => {
      if (item.name == profile_device_name) {
        network_id = item.network_id;
        network_position = item.network_position;
      }
    });
    return { network_id, network_position };
  };

  //首先获取所有设置的内容
  const initSettingList = async (guid) => {
    let settings = [];
    try {
      settings = erp.info.device[guid] ? erp.info.device[guid].settings : [];
    } catch (error) {
      settings = [];
    }
    let thisList = [];
    settings.forEach((item) => {
      let list = iot_ble_device_setting_type_init(item.setting_type, item.setting, guid, guid);
      thisList = thisList.concat(list);
    });
    console.log('thisList', thisList);
    return thisList;
  };
  //获取场景的内容
  const initSceneList = async (guid) => {
    let sceneList = [];
    let scenes = cloneDeep(erp.info.scene);
    for (let scene in scenes) {
      let scene_item = scenes[scene];
      scene_item.writeStatus = false;
      let scene_device_location = scene_item.scene_device_location || [];
      let scene_location_map = scene_device_location.find((item) => item.device == guid);
      if (scene_location_map) {
        sceneList.push(scenes[scene]);
      }
      if (repair_device_model.includes('M86-DP')) {
        if (scenes[scene].title.includes('Do Not Disturb') || scenes[scene].title.includes('Clean Up')) {
          sceneList.push(scenes[scene]);
        }
      }
    }
    console.log('sceneList', sceneList);
    let sceneBleList = await replaceRcuSceneDeviceCommand(sceneList);
    // console.log('sceneBleList', sceneBleList);
    return sceneBleList;
  };
  const replaceRcuSceneDeviceCommand = (sceneList) => {
    return new Promise(async (resolve, reject) => {
      let scenes = cloneDeep(erp.info.scene);
      let postScene = [];
      let bleList = [];
      for (let i in sceneList) {
        let item = sceneList[i];
        let scene_device_location = item.scene_device_location || [];
        let templateName = item.scene_template;
        let trigger = JSON.parse(item.trigger);
        let action = JSON.parse(item.action);
        let rcuGuid = getTheSceneRcu(item);
        let deviceMap = {};
        let deviceModel = '';

        try {
          deviceMap = erp.info.device[guid];
          deviceModel = deviceMap.device_model;
          repair_device_model = deviceModel;
        } catch (error) {}
        if (deviceModel == 'YO780') {
          let thisCommandList = await saveActionCommand(item);
          thisCommandList.forEach((item) => {
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: item.command,
            });
          });
        } else {
          bleList = bleList.concat(await saveTriggetCommand(item));
        }
      }
      resolve(bleList);
    });
  };

  const saveTriggetCommand = (scenesMap) => {
    return new Promise(async (resolve, reject) => {
      let triggerList = JSON.parse(scenesMap.trigger);
      let actionList = JSON.parse(scenesMap.action);
      let rcuGuid = getTheSceneRcu(scenesMap);
      let oldMac = core_utils_get_mac_address_from_guid(guid);
      let bleList = [];
      let uiConfiguration = null;
      try {
        uiConfiguration = JSON.parse(scenesMap.ui_configuration);
      } catch (e) {
        uiConfiguration = null;
      }
      for (let i in triggerList) {
        if (triggerList[i].guid != guid) {
          continue;
        }
        let triggercommand = triggerList[i].triggercommand;
        let actionCommand = triggerList[i].actionCommand;
        let settingCommandList = triggerList[i].settingCommandList;
        let ledTriggerOn = triggerList[i].ledTriggerOn;
        let ledTriggerOff = triggerList[i].ledTriggerOff;
        let ledActionOn = triggerList[i].ledActionOn;
        let ledActionOff = triggerList[i].ledActionOff;
        let ledRawSettingCommand = triggerList[i].ledRawSettingCommand;
        if (triggercommand) {
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: triggercommand,
          });
        }
        if (actionCommand) {
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: actionCommand,
          });
        }
        if (settingCommandList && settingCommandList.length) {
          settingCommandList.forEach((item) => {
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: item,
            });
          });
        }
        if (ledTriggerOn) {
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: ledTriggerOn,
          });
        }
        if (ledTriggerOff) {
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: ledTriggerOff,
          });
        }
        if (ledActionOn) {
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: ledActionOn,
          });
        }
        if (ledActionOff) {
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: ledActionOff,
          });
        }
        if (ledRawSettingCommand) {
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: ledRawSettingCommand,
          });
        }
      }
      if (uiConfiguration) {
        let keyList = Object.keys(uiConfiguration);
        keyList.forEach((item) => {
          if (
            uiConfiguration[item] &&
            typeof uiConfiguration[item] === 'string' &&
            uiConfiguration[item].includes('8f32') &&
            repair_device_model == 'M86-DP'
          ) {
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: uiConfiguration[item].toLowerCase(),
            });
          }
        });
      }
      resolve(bleList);
    });
  };
  const saveActionCommand = (scenesMap) => {
    return new Promise(async (resolve, reject) => {
      let sceneTemplate = scenesMap.scene_template;
      let sceneName = scenesMap.title;
      let scene_device_location = scenesMap.scene_device_location || [];
      let scene_virtual_button = scenesMap.scene_virtual_button || [];
      let actionMap = JSON.parse(scenesMap.action);
      let triggerMap = JSON.parse(scenesMap.trigger);
      let uiConfiguration = null;
      let rcuGuid = getTheSceneRcu(scenesMap);
      let oldMac = core_utils_get_mac_address_from_guid(guid);
      let commandList = [];
      try {
        uiConfiguration = JSON.parse(scenesMap.ui_configuration);
      } catch (e) {
        uiConfiguration = null;
      }
      if (sceneTemplate == 'RCU Radar' || sceneTemplate == 'Welcome Scene') {
        let triggerCommand = triggerMap[0].triggercommand;
        commandList.push({
          guid: rcuGuid,
          command: triggerCommand.toLocaleLowerCase(),
        });
        let uiConfigurationMap = uiConfiguration[`${guid}_device`];
        if (isset(uiConfiguration) && isset(uiConfigurationMap)) {
          commandList.push({
            guid: rcuGuid,
            command: uiConfigurationMap.toLocaleLowerCase(),
          });
        }
        if (isset(uiConfiguration[`${guid}_scene_command`])) {
          commandList.push({
            guid: rcuGuid,
            command: uiConfiguration[`${guid}_scene_command`].toLocaleLowerCase(),
          });
        }
      }
      if (actionMap[rcuGuid]) {
        if (typeof actionMap[rcuGuid] === 'string') {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[rcuGuid]['actionCommand']) && actionMap[rcuGuid]['actionCommand']) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid]['actionCommand'].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[rcuGuid]['settingCommand']) && actionMap[rcuGuid]['settingCommand']) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid]['settingCommand'].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[rcuGuid]['defaultOnCommand']) && actionMap[rcuGuid]['defaultOnCommand']) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid]['defaultOnCommand'].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[rcuGuid]['defaultOffCommand']) && actionMap[rcuGuid]['defaultOffCommand']) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid]['defaultOffCommand'].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[rcuGuid]['actionCommand_2']) && actionMap[rcuGuid]['actionCommand_2']) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid]['actionCommand_2'].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[rcuGuid]['trigger']) && actionMap[rcuGuid]['trigger']) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid]['trigger'].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[rcuGuid]['trigger_2']) && actionMap[rcuGuid]['trigger_2']) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[rcuGuid]['trigger_2'].toLocaleLowerCase(),
          });
        }
        if (isset(actionMap[`second_action_${rcuGuid}`])) {
          commandList.push({
            guid: rcuGuid,
            command: actionMap[`second_action_${rcuGuid}`].toLocaleLowerCase(),
          });
        }
      }
      resolve(commandList);
    });
  };
  const getTheSceneRcu = (sceneMap) => {
    //select the profile rcu,and return the rcu guid
    let rcuGuid = '';
    let rcuList = [];
    let scene_device_location = sceneMap.scene_device_location || [];
    for (let i in scene_device_location) {
      let guid = scene_device_location[i].device;
      if (isset(erp.info.device[guid])) {
        let device_model = erp.info.device[guid].device_model;
        if (device_model == 'YO780') {
          if (rcuList.indexOf(guid) == -1) {
            rcuList.push(guid);
          }
        }
      }
    }
    //if have two rcu
    if (rcuList.length > 1) {
      rcuList.forEach((item) => {
        let setting = erp.info.device[item].settings;
        setting.forEach((kitem) => {
          if (kitem.setting_type == 'main_rcu' && kitem.setting == '1') {
            rcuGuid = item;
          }
        });
      });
    } else if (rcuList.length == 1) {
      rcuGuid = rcuList[0];
    }
    return rcuGuid;
  };
  //获取组网的内容
  const initGroupList = async (guid) => {
    let profile_device = cloneDeep(erp.info.profile.profile_device);
    let network_id = '';
    let network_position = '';
    profile_device.forEach((item) => {
      if (item.device == guid) {
        network_id = item.network_id;
        network_position = item.network_position;
      }
    });
    let thisList = [];
    let targetNetworkCommandList = [];
    //show the pre device and the next device
    if (parseInt(network_id) > 0 && guid && parseInt(network_id) < 100) {
      let networkIdList = profile_device
        .filter((e) => e.network_id == network_id && e.network_id != 0)
        .sort((a, b) => {
          return a.network_position - b.network_position;
        });
      this.networkCount = networkIdList.length;
      let headBytes = '';
      let tailBytes = '';
      //if network_position in leader or end
      if (network_position == 0) {
        headBytes = `8500010000000000000000000000`;
        tailBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position) + 1].device, true).toLowerCase()}0100000000`;
        if (networkIdList.length > 1) {
          thisList.push(networkIdList[1]);
        }
      } else if (network_position == networkIdList.length - 1) {
        headBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position) - 1].device, true).toLowerCase()}0000000000`;
        tailBytes = `8500010000000000000100000000`;
        thisList.push(networkIdList[network_position - 1]);
      } else {
        headBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position) - 1].device, true).toLowerCase()}0000000000`;
        tailBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position) + 1].device, true).toLowerCase()}0100000000`;
        thisList.push(networkIdList[network_position - 1]);
        thisList.push(networkIdList[network_position + 1]);
      }
      targetNetworkCommandList = ['85000000', '850200', tailBytes, '850201', headBytes, '850200'];
    } else {
      thisList = [];
    }
    return targetNetworkCommandList;
  };
  //获取mesh的内容
  const initMeshList = async (guid) => {
    //提醒用户，如果已经reset，需要重新mesh
  };
  const get_device_setting_type = (guid, setting_type) => {
    let settings = erp.info.device[guid].settings;
    if (settings && settings.length) {
      let settingMap = settings.find((item) => item.setting_type == setting_type);
      if (settingMap) {
        return settingMap.setting;
      } else {
        return '';
      }
    } else {
      return '';
    }
  };
  check_device_firmware_version_and_update = async (guid) => {
    return new Promise(async (resolve, reject) => {
      const self = this;
      const oldResolve = resolve;
      const oldReject = reject;
      try {
        //get the device gateway
        let gateway = '';
        let profile_device = cloneDeep(erp.info.profile.profile_device);
        profile_device.forEach((item) => {
          if (item.device == guid) {
            gateway = item.gateway;
          }
        });
        let ssid = get_device_setting_type(guid, 'Wifi SSID');
        let password = get_device_setting_type(guid, 'Wifi Password');
        if (!ssid) {
          //find the ssid from other device
          let devices = cloneDeep(erp.info.device);
          for (let i in devices) {
            if (devices[i].device_model == 'YO780' || devices[i].device_mode == 'RCU Controller') {
              let rcu_ssid = get_device_setting_type(devices[i].guid, 'Wifi SSID');
              let rcu_password = get_device_setting_type(devices[i].guid, 'Wifi Password');
              if (rcu_ssid) {
                ssid = rcu_ssid;
              }
              if (rcu_password) {
                password = rcu_password;
              }
            }
          }
        }
        const otaInstance = new window.iotWifiOta({
          guid: guid,
          gateway: gateway,
          ssid: ssid,
          password: password,
          showUI: true, // 启用UI提示显示
        });
        otaInstance.setCallbacks({
          onProgress: (progress) => {
            console.log(`进度: ${progress}%`);
            if (progress > 100) {
              //reject error
              reject(_('Abnormal progress Interruption'));
            }
          },
          onError: (error) => {
            console.log('error', error);
            // 显示错误信息
            reject(error);
          },
          onSuccess: (message) => {
            console.log(`成功: ${message}`);
            // resolve(true);
          },
          onRetryPrompt: (error, retryCount, maxRetries, resolve) => {
            console.log(`失败原因: ${error}`);
            console.log(`重试次数: ${retryCount}/${maxRetries}`);
            app.dialog.confirm(
              _(error) + '\n\n' + _('Would you like to try again?'),
              async () => {
                try {
                  await check_device_firmware_version_and_update(guid);
                  oldResolve(true);
                } catch (error) {
                  oldReject(error);
                }
              },
              () => {
                oldResolve(true);
              }
            );
          },
        });
        await otaInstance.init();
        const status = otaInstance.getStatus();
        console.log('WiFi状态:', status.wifiStatus);
        console.log('需要连接WiFi:', status.needsWifiConnection);
        console.log('需要固件升级:', status.needsFirmwareUpgrade);
        //判断是否需要OTA升级
        if (status.needsFirmwareUpgrade) {
          //需要OTA升级
          if (status.needsWifiConnection) {
            console.log('开始连接WiFi...');
            await otaInstance.wifiConnect();
            console.log('WiFi连接成功');
            console.log('开始固件升级...');
            await otaInstance.fullUpgrade();
            console.log('固件升级成功');
            resolve(true);
          } else {
            console.log('WiFi连接成功');
            console.log('开始固件升级...');
            await otaInstance.fullUpgrade();
            console.log('固件升级成功');
            resolve(true);
          }
        } else {
          //不需要OTA升级
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
  };
  const iot_start_repair = async () => {
    try {
      await check_device_firmware_version_and_update(guid);
    } catch (error) {
      app.dialog.alert(error);
      return;
    }
    //if YO121-AC-R2W
    if (repair_device_model.includes('YO121-AC-R2W')) {
      try {
        await window.peripheral[guid].write([{ service: 'ff80', characteristic: 'ff81', data: '8f130101028900' }]);
      } catch (error) {
        app.dialog.alert(erp.get_log_description(error));
        return;
      }
    }
    //if M360s
    if (repair_device_model.includes('M360s')) {
      try {
        await window.peripheral[guid].write([{ service: 'ff80', characteristic: 'ff81', data: '8f130101029403029404029405029406' }]);
      } catch (error) {
        app.dialog.alert(erp.get_log_description(error));
        return;
      }
    }
    //if YO103
    if (repair_device_model.includes('YO103')) {
      try {
        await window.peripheral[guid].write([{ service: 'ff80', characteristic: 'ff81', data: '8f130101028010' }]);
      } catch (error) {
        app.dialog.alert(erp.get_log_description(error));
        return;
      }
    }

    let settingList = await initSettingList(guid);
    let sceneList = await initSceneList(guid);
    let groupList = await initGroupList(guid);
    debugger;
    console.log('groupList', groupList);
    let settingBleList = [];
    settingList.forEach((item) => {
      settingBleList.push({
        service: 'ff80',
        characteristic: 'ff81',
        data: item.command,
      });
    });
    //先更新setting指令
    let settingUpdateStatus = true;
    if (settingBleList.length > 0) {
      window.this_dialog = app.dialog.progress(`${_('Restore Device Setting')}`, 0);
      let settingIndex = 1;
      let totalSettingCount = settingBleList.length;
      for (let i in settingBleList) {
        try {
          await window.peripheral[guid].write([settingBleList[i]]);
          window.this_dialog.setProgress(parseInt((settingIndex / totalSettingCount) * 100));
          window.this_dialog.setText(`${_('Restore Device Setting')}: ${settingIndex}/${totalSettingCount}`);
          settingIndex++;
          if (settingIndex == totalSettingCount) {
            window.this_dialog.close();
          }
        } catch (error) {
          console.log('error', error);
          // if(!error.includes('window.this_dialog')){
          //     app.dialog.close();
          //     app.dialog.alert(erp.get_log_description(error));
          //     settingUpdateStatus = false;
          // }
        }
      }
    }

    if (!settingUpdateStatus) {
      return;
    }
    //更新scene指令
    let sceneUpdateStatus = true;
    if (sceneList.length) {
      let sceneIndex = 1;
      let totalSceneCount = sceneList.length;
      console.log('sceneList', sceneList);
      window.this_dialog = app.dialog.progress(`${_('Restore Scene')}`, 0);
      for (let i in sceneList) {
        try {
          await window.peripheral[guid].write([sceneList[i]]);
          window.this_dialog.setProgress(parseInt((sceneIndex / totalSceneCount) * 100));
          window.this_dialog.setText(`${_('Restore Scene')} ${sceneIndex}/${totalSceneCount}`);
          sceneIndex++;
          if (sceneIndex == totalSceneCount) {
            window.this_dialog.close();
          }
        } catch (error) {
          // app.dialog.close();
          // app.dialog.alert(erp.get_log_description(error));
          // sceneUpdateStatus = false;
        }
      }
    }
    //更新组网
    let groupStatus = true;
    if (groupList.length) {
      let groupIndex = 1;
      let totalGroupCount = groupList.length;
      window.this_dialog = app.dialog.progress(`${_('Restore Network Command')}`, 0);
      for (let i in groupList) {
        try {
          await window.peripheral[guid].write([
            {
              service: 'ff80',
              characteristic: 'ff81',
              data: groupList[i],
            },
          ]);
          window.this_dialog.setProgress(parseInt((groupIndex / totalGroupCount) * 100));
          window.this_dialog.setText(`${_('Restore Network Command')} ${groupIndex}/${totalGroupCount}`);
          groupIndex++;
          if (groupIndex == totalGroupCount) {
            window.this_dialog.close();
          }
        } catch (error) {
          app.dialog.close();
          app.dialog.alert(erp.get_log_description(error));
          groupStatus = false;
        }
      }
    }
    if (!groupStatus) {
      return;
    }

    //update the device gateway to the profile
    try{
      let profile_email = erp.info.profile.profile_email;
      if(profile_email){
        //check if the profile device have the gateway
        let profile_device = cloneDeep(erp.info.profile.profile_device);
        let profile_device_map = profile_device.find((item)=>item.device == guid);
        if(profile_device_map){
          app.dialog.preloader(`${_('Update Device Gateway...')}`);
          let gateway = profile_device_map.gateway;
          if(gateway){
            let url = `/api/method/appv6.updateProfileDeviceGateway`;
            await	http2.request(encodeURI(url), {
              serializer: "json",
              responseType: "json",
              method: "POST",
              data: {
                device : guid,
                gateway : `${core_utils_get_mac_address_from_guid(guid)}-${profile_email}`,
                profile_name : erp.info.profile.name,
              }
            });
            await ha_profile_ready(2);
            app.dialog.close();
          }
        }
      }
    }catch(error){
      app.dialog.close();
      app.dialog.alert(erp.get_log_description(error));
    }
    try {
      app.dialog.preloader(`${_('Restart Device...')}`);
      await window.peripheral[guid].write([
        {
          service: 'ff80',
          characteristic: 'ff81',
          data: '810e',
        },
      ]);
      app.dialog.close();
      app.dialog.alert(_('Repair Successfully'));
      return;
    } catch (error) {
      app.dialog.close();
      app.dialog.alert(erp.get_log_description(error));
    }
  };

  try {
    let mesh_status = await check_device_mesh_status(guid);
    if (mesh_status) {
      iot_start_repair();
      return;
    }
    app.dialog.preloader(`${_('Reset Device...')}`);
    await reset_mesh_for_repair(guid);
    await sleep_for_repair(1000 * 8);
    //start connect
    await window.peripheral[guid].connect();
    app.dialog.close();
    //start mesh
    iot_setup_mesh_test_init_picker.open();
    //1秒后选择netwrok
    await sleep_for_repair(1000);
    $(`.picker-sheet`).find('.toolbar-save-link').trigger('click');
    if (erp.script.iot_mesh_check_function) {
      emitter.off('mesh/check/fun', erp.script.iot_mesh_check_function);
    }
    erp.script.iot_mesh_check_function = (data) => {
      console.log('data', data);
      if (data.code == 200) {
        //mesh成功
        iot_setup_mesh_test_init_picker.close();
        app.sheet.close();
        iot_start_repair();
      }
    };
    emitter.on('mesh/check/fun', erp.script.iot_mesh_check_function);
    // let { network_id, network_position } = get_network_id();
    // if(network_id && network_id > 100){
    //   let actNetwork = parseInt(network_id) - 100;

    // }
    //
    //
  } catch (error) {
    console.log('error', error);
  }
  /*
    需要恢复的设置包含以下内容：
    1.device setting的数据
    2.组网的数据
    3.mesh的数据
    4.场景的数据
    */
};
