window.iot_device_restore = async (params) => {
  const guid = params.ref;
  const profile_device_name = params.obj.attr('profile-device-name');
  const profile_subdevice_name = params.obj.attr('profile-subdevice-name');
  /*
    需要恢复的设置包含以下内容：
    1.device setting的数据
    2.组网的数据
    3.mesh的数据
    4.场景的数据
    */
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
      let rcuGuid = getTheSceneRcu(scenesMap);
      let oldMac = core_utils_get_mac_address_from_guid(guid);
      let commandList = [];
      if (sceneTemplate == 'RCU Radar' || sceneTemplate == 'Welcome Scene') {
        let triggerCommand = triggerMap[0].triggercommand;
        commandList.push({
          guid: rcuGuid,
          command: triggerCommand.toLocaleLowerCase(),
        });
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
    if ( parseInt(network_id) > 0 && guid && parseInt(network_id) < 100) {
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
  let settingList = await initSettingList(guid);
  let sceneList = await initSceneList(guid);
  let groupList = await initGroupList(guid);
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
  if (settingBleList) {
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
        console.log("error",error)
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
  app.dialog.alert(_('Restore Successfully'));
  return;
};
