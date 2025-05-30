window.iot_check_all_settings = async (params) => {
  //render the UI chceking
  /* 
  1.show the setting UI
  2.show the scene UI
  */
  const guid = params.obj.attr('guid');
  console.log('guid', guid);
  if (!guid) {
    app.dialog.alert(_('Device not found'));
    return;
  }

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

  const initSceneList = async (guid) => {
    let sceneList = [];
    let scenes = cloneDeep(erp.info.scene);
    for (let scene in scenes) {
      let scene_item = scenes[scene];
      scene_item.writeStatus = false;
      let scene_device_location = scene_item.scene_device_location || [];
      let scene_location_map = scene_device_location.find((item) => item.device == guid);
      if (scene_location_map) {
        scenes[scene]['isCheck'] = true;
        let sceneBleList = await replaceRcuSceneDeviceCommand(scenes[scene]);
        scenes[scene]['sceneBleList'] = sceneBleList;
        sceneList.push(scenes[scene]);
      }
    }
    console.log('sceneList', sceneList);

    // console.log('sceneBleList', sceneBleList);
    return sceneList;
  };
  const replaceRcuSceneDeviceCommand = (sceneMap) => {
    return new Promise(async (resolve, reject) => {
      let postScene = [];
      let bleList = [];
      let item = sceneMap;
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

  //render the UI
  const settingList = await initSettingList(guid);
  const sceneList = await initSceneList(guid);
  console.log('settingList', settingList);
  console.log('sceneList', sceneList);
  let totalCount = settingList.length;
  let sceneTotalCount = sceneList.length;
  erp.checkAllSettingsSheet = app.sheet.create({
    content: `
    <div class="sheet-modal" style="height:auto">
      <div class="sheet-modal-inner">
        <div class="swipe-handler"></div>
        <div class="page-content" style="height:600px;">
        <div class="block-title">${_('Device Settings')}</div>
          <div class="list list-strong list-outline list-dividers-ios">
            <ul class="manufacturing-steps-list">
              <li class="manufacturing-steps manufacturing-step1" deviceName="">
                <div class="item-content" style="padding-right:15px;">
                  <div class="item-inner">
                    <div class="item-title">
                      <span class="device-title">${_('Checking setting items.')}</span>
                    </div>
                  </div>
                  <div class="item-after">
                    <i class="icon material-icons checking-item-for-all-settings">watch_later</i>
                  </div>
                </div>
              </li>
              <li class="manufacturing-steps manufacturing-step2 display-flex justify-content-center align-items-center" style="padding:15px;">
                <p style="width:100%;"><span data-progress="10" class="progressbar" id="demo-inline-progressbar-check-all-settings"></span></p>
                <p style="width:100px;text-align:center;">
                <span class="progressbar-text star_progressbar_text" >0</span>
                <span class="progressbar-text">/</span>
                <span class="progressbar-text end_progressbar_text" >${totalCount}</span>
                </p>
              </li>
            </ul>
          </div>
          <div class="block-title">${_('Device Scenes')}</div>
          <div class="list list-strong list-outline list-dividers-ios">
            <ul class="manufacturing-steps-list">
              <li class="manufacturing-steps manufacturing-step1" deviceName="">
                <div class="item-content" style="padding-right:15px;">
                  <div class="item-inner">
                    <div class="item-title">
                      <span class="device-title">${_('Checking scene items.')}</span>
                    </div>
                  </div>
                  <div class="item-after">
                    <i class="icon material-icons checking-item-for-all-settings-scene">watch_later</i>
                  </div>
              </li>
              <li class="manufacturing-steps manufacturing-step2 display-flex justify-content-center align-items-center" style="padding:15px;">
                <p style="width:100%;"><span data-progress="10" class="progressbar" id="demo-inline-progressbar-check-all-settings-scene"></span></p>
                <p style="width:100px;text-align:center;">
                <span class="progressbar-text star_progressbar_text_scene" >0</span>
                <span class="progressbar-text">/</span>
                <span class="progressbar-text end_progressbar_text_scene" >${sceneTotalCount}</span>
                </p>
              </li>
            </ul>
          </div>
          <div class="block-title">${_('Problematic Scenario')}</div>
          <div class="list list-strong list-outline list-dividers-ios">
            <ul class="manufacturing-steps-list problematic-scenario-list" style="padding:0 15px;">
              
            </ul>
          </div>
          <div class="block-title">${_('Wifi Info')}</div>
          <div class="list list-strong list-outline list-dividers-ios">
            <ul class="manufacturing-steps-list" style="padding:0 15px;">
              <li class="manufacturing-steps manufacturing-step1">
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">${_('IPv4 address')}</div>
                    <div class="item-after" name="ipaddress"></div>
                  </div>
                </a>
              </li>
              <li class="manufacturing-steps manufacturing-step1">
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">${_('Wifi Mac Address')}</div>
                    <div class="item-after" name="wifimacaddress"></div>
                  </div>
                </a>
              </li>
              <li class="manufacturing-steps manufacturing-step1">
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">${_('Ipv6')}</div>
                    <div class="item-after" name="ipv6"></div>
                  </div>
                </a>
              </li>
              <li class="manufacturing-steps manufacturing-step1">
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">${_('Bssid')}</div>
                    <div class="item-after" name="bssid"></div>
                  </div>
                </a>
              </li>
              <li class="manufacturing-steps manufacturing-step1">
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">${_('Rssi')}</div>
                    <div class="item-after" name="rssi"></div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div class="block block-strong">
            <p class="row">
              <div class="col">
                <div class="button button-raised button-fill button-save start-check-all-settings" func="startCheckAllSettings">${_('Start')}</div>
                <div class="button button-raised button-fill button-save start-check-all-scene device-none" func="startCheckAllScene">${_('Fixed Scene')}</div>
              </div>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
    on: {
      closed: () => {
        if(erp.script.getWifiInfoFun){
          emitter.off('iot/wifi/info',erp.script.getWifiInfoFun);
        }
        console.log('closed');
      },
    },
    swipeToClose: true,
    push: true,
    backdrop: true,
  });
  erp.checkAllSettingsSheet.open();
  

  const getJsonData = async()=>{
    app.dialog.preloader(_('Get Wifi Info'));
    try{
      if(window.peripheral[guid].prop.connected){
        await window.peripheral[guid].disconnect();
      }
      await peripheral[guid].connect();
      erp.script.getWifiInfoFun = (data)=>{
        console.log('data',data);
        let rs = data.rs;
        let jsonData = JSON.parse(hexToPlainText(rs.substring(10, rs.length)));
        console.log('jsonData',jsonData);
        if (isset(jsonData)) {
          if(isset(jsonData.ipv4)){
            $('.item-after[name="ipaddress"]').html(jsonData.ipv4);
          }else{
            $('.item-after[name="ipaddress"]').html('N/A');
          }
          if(isset(jsonData.macAddress)){
            $('.item-after[name="wifimacaddress"]').html(jsonData.macAddress);
          }else{
            $('.item-after[name="wifimacaddress"]').html('N/A');
          }
          if(isset(jsonData.ipv6)){
            $('.item-after[name="ipv6"]').html(jsonData.ipv6);
          }else{
            $('.item-after[name="ipv6"]').html('N/A');
          }
          if(isset(jsonData.bssid)){
            $('.item-after[name="bssid"]').html(jsonData.bssid);
          }else{
            $('.item-after[name="bssid"]').html('N/A');
          }
          if(isset(jsonData.rssi)){
            $('.item-after[name="rssi"]').html(jsonData.rssi);
          }else{
            $('.item-after[name="rssi"]').html('N/A');
          }
        }
        app.dialog.close();
      };
      emitter.on('iot/wifi/info',erp.script.getWifiInfoFun);
      if(deviceInfo.operatingSystem != 'ios'){
        await ble.requestMtu(
          peripheral[guid].prop.id,
          512,
          ()=>{},
          ()=>{},
        )
      }
      // await ble.startNotification(
      //   peripheral[guid].prop.id,
      //   'ff80',
      //   'ff82',
      //   (rs) => {
      //     if (rs.startsWith('9329')) {
      //       let data = rs.substring(10, rs.length);
      //       console.log('>>>> iot_mode_setup_iaq_ip' + this.hexToPlainText(data));
      //       //check is nor wifi setting
      //       let wifi_length = rs.substring(8, 10);
      //       if (wifi_length == '00') {
      //         app.preloader.hide();
      //         if (type == 2) {
      //           app.dialog.alert('Wifi is not set or connection error.', runtime.appInfo.name);
      //         }
      //         return;
      //       }
      //       console.log(JSON.parse(this.hexToPlainText(data)));
      //       let jsonData = JSON.parse(this.hexToPlainText(data));
      //       if (isset(jsonData.ipv4)) {
      //         this.wifiInfo.ipaddress = jsonData.ipv4;
      //         this.wifiInfo.wifimacaddress = jsonData.macAddress;
      //         this.wifiInfo.ipv6 = jsonData.ipv6;
      //         this.wifiInfo.bssid = jsonData.bssid;
      //         this.wifiInfo.rssi = jsonData.rssi;
      //       }
      //     }
      //   },
      //   (err) => {
      //     console.log(err);
      //     //reject(err);
      //   }
      // );
      setTimeout(async()=>{
        await peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: '9329',
          },
        ]);
      },500)
    }catch(error){
      app.dialog.close();
      console.log(error);
      app.dialog.alert(erp.get_log_description(error));
    }
  }
  const hexToPlainText = (hexString) => {
    // 使用正则表达式检查输入是否是合法的十六进制字符串
    const hexPattern = /^[0-9A-Fa-f]+$/;
    if (!hexPattern.test(hexString)) {
      throw new Error('Invalid HEX input. Only hexadecimal characters (0-9, A-F) are allowed.');
    }

    // 将十六进制字符串转换为字节数组
    const byteArray = [];
    for (let i = 0; i < hexString.length; i += 2) {
      byteArray.push(parseInt(hexString.substr(i, 2), 16));
    }

    // 使用TextDecoder将字节数组转换为普通字符
    const decoder = new TextDecoder();
    const plainText = decoder.decode(new Uint8Array(byteArray));

    return plainText;
  }

  const getSceneFromBle = async()=>{
    return new Promise(async(resolve,reject)=>{
      app.dialog.preloader(_('Get scene from ble.'));
      let commandList = [];
      //define the timer
      let sceneTimer = null;
      sceneTimer = setTimeout(async()=>{
        clearTimeout(sceneTimer);
        app.dialog.close();
        reject(_('Get scene from ble timeout.'));
      },20000)
    if(erp.script.getSceneFromBleFun){
      emitter.off('iot/scene/from/ble',erp.script.getSceneFromBleFun);
    }
    erp.script.getSceneFromBleFun = (data)=>{
      let rs = data.rs;
      commandList.push(rs);
      if(commandList.indexOf('8f1300ff') != -1 && 
      commandList.indexOf('8f200000ff') != -1 &&
      commandList.indexOf('972303ff02') != -1 &&
      commandList.indexOf('8f1000ff') != -1){
        clearTimeout(sceneTimer);
        app.dialog.close();
        resolve(commandList);
      }
    }
    emitter.on('iot/scene/from/ble',erp.script.getSceneFromBleFun);
    let read_action_command = '8F1200FF';
    let read_trriger_command = `8F220000FF`;
    let read_scene_toggle_on_command = `972303ff01`;
    let read_scene_toggle_off_command = `972303ff00`;
    let read_scene_toggle_setting_command = `972303ff02`;
    let read_raw_setting_command = `8f1500ff`;
    try{
      await peripheral[guid].write([
        {
          service: 'ff80',
          characteristic: 'ff81',
          data: read_action_command,
        },
        {
          service: 'ff80',
          characteristic: 'ff81',
          data: read_trriger_command,
        },
        {
          service: 'ff80',
          characteristic: 'ff81',
          data: read_scene_toggle_on_command,
        },
        {
          service: 'ff80',
          characteristic: 'ff81',
          data: read_scene_toggle_off_command,
        },
        {
          service: 'ff80',
          characteristic: 'ff81',
          data: read_scene_toggle_setting_command,
        },
        {
          service: 'ff80',
          characteristic: 'ff81',
            data: read_raw_setting_command,
          },
        ]);
    }catch(error){
      app.dialog.close();
      // app.dialog.alert(erp.get_log_description(error));
      reject(error);
    }
    
    });
  }
  getJsonData();
  window.startCheckAllScene = async () => {
    $('.start-check-all-scene').addClass('disabled');
    $('.start-check-all-scene').html(_('Fixed Scene...'));
    for (let i in sceneList) {
      if(sceneList[i]['isCheck'] == false){
        let sceneBleList = sceneList[i].sceneBleList;
        let postChildStatus = true;
        for (let j in sceneBleList) {
          try{
            await window.peripheral[guid].write([sceneBleList[j]]);
          }catch(error){
            postChildStatus = false;
            break;
          }
        }
        sceneList[i]['isCheck'] = postChildStatus;
        if(postChildStatus){
          $(`.error-icon[scene-name="${sceneList[i].name}"]`).removeClass('text-color-red');
          $(`.error-icon[scene-name="${sceneList[i].name}"]`).html('check');
        }
      }
    }
    //check if the scene is fixed
    let haveProblematicScene = false;
    for (let i in sceneList) {
      if(sceneList[i]['isCheck'] == false){
        haveProblematicScene = true;
      }
    }
    if(!haveProblematicScene){
      $('.start-check-all-scene').addClass('device-none');
      $('.start-check-all-scene').removeClass('disabled');
      $('.start-check-all-settings').removeClass('disabled');
      $('.start-check-all-settings').removeClass('device-none');
      $('.start-check-all-settings').html(_('Start'));
    }
  }
  window.startCheckAllSettings = async () => {
    $('.start-check-all-settings').addClass('disabled');
    $('.start-check-all-settings').html(_('Checking Setting...'));
    $('.checking-item-for-all-settings').html('sync');
    $('.checking-item-for-all-settings').addClass('rotate-animation');
    let currentSettingCount = 0;
    let settingUpdateStatus = true;
    try {
      await window.peripheral[guid].connect();
    } catch (error) {
      app.dialog.close();
      app.dialog.alert(erp.get_log_description(error));
      settingUpdateStatus = false;
    }
    let settingBleList = [];
    settingList.forEach((item) => {
      settingBleList.push({
        service: 'ff80',
        characteristic: 'ff81',
        data: item.command,
      });
    });
    if (settingBleList.length > 0) {
      let totalSettingCount = settingList.length;
      for (let i in settingBleList) {
        try {
          await window.peripheral[guid].write([settingBleList[i]]);
          currentSettingCount++;
          app.progressbar.set(
            '#demo-inline-progressbar-check-all-settings',
            parseInt((currentSettingCount / totalSettingCount) * 100)
          );
          $('.star_progressbar_text').text(currentSettingCount);
          if (currentSettingCount == totalSettingCount) {
            $('.checking-item-for-all-settings').html('check');
            $('.checking-item-for-all-settings').removeClass('rotate-animation');
          }
        } catch (error) {
          app.dialog.close();
          app.dialog.alert(erp.get_log_description(error));
          settingUpdateStatus = false;
          break;
        }
      }
    }
    //get the scene from the ble
    let sceneCommandList = []
    try{
      $('.start-check-all-settings').html(_('Checking Scene...'));
      $('.checking-item-for-all-settings-scene').html('sync');
      $('.checking-item-for-all-settings-scene').addClass('rotate-animation');
      sceneCommandList = await getSceneFromBle();
      console.log('sceneCommandList',sceneCommandList);
    }catch(error){
      sceneCommandList = [];
      console.log(error);
    }
    //scene check
    let currentSceneCount = 0;
    let totalSceneCount = sceneList.length;
    if (sceneList.length > 0) {
      for (let i in sceneList) {
        let sceneItemIndex = 1;
        let item = sceneList[i];
        let sceneItemTotal = item.sceneBleList.length;
        let sceneBleList = item.sceneBleList;
        let postSceneStatus = true;
        if (sceneBleList.length > 0) {
          for (let j in sceneBleList) {
            try {
              // await window.peripheral[guid].write([sceneBleList[j]]);
              let commandItem = sceneBleList[j].data;
              if(sceneCommandList.indexOf(commandItem.toLocaleLowerCase()) == -1){
                postSceneStatus = false;
              }
              // sceneItemIndex++;
              // if (sceneItemIndex == sceneItemTotal) {
              // }

              // $('.star_progressbar_text').text(currentSceneCount);
            } catch (error) {
              sceneList[i]['isCheck'] = false;
              postSceneStatus = false;
              app.dialog.close();
              app.dialog.alert(erp.get_log_description(error));
              sceneUpdateStatus = false;
              break;
            }
          }
          sceneList[i]['isCheck'] = postSceneStatus;
          currentSceneCount++;
          app.progressbar.set('#demo-inline-progressbar-check-all-settings-scene', parseInt((currentSceneCount / totalSceneCount) * 100));
          $('.star_progressbar_text_scene').text(currentSceneCount);
        } else {
          currentSceneCount++;
          app.progressbar.set('#demo-inline-progressbar-check-all-settings-scene', parseInt((currentSceneCount / totalSceneCount) * 100));
          $('.star_progressbar_text_scene').text(currentSceneCount);
        }
        if (currentSceneCount == totalSceneCount) {
          $('.checking-item-for-all-settings-scene').html('check');
          $('.checking-item-for-all-settings-scene').removeClass('rotate-animation');
        }
      }
      console.log('sceneList',sceneList);
      //append the problematic scene to the list
      let haveProblematicScene = false;
      for (let i in sceneList) {
        if(sceneList[i]['isCheck'] == false){
          haveProblematicScene = true;
          $('.problematic-scenario-list').append(`<li class="manufacturing-steps manufacturing-step1">
            <a class="item-content" style="padding-left: 0px">
              <div class="item-inner" style="padding-right: 0px">
                <div class="item-title" style="font-weight:bold;">${tran(sceneList[i].title)}</div>
                <div class="item-after">
                  <i class="icon material-icons text-color-red error-icon" scene-name="${sceneList[i].name}">info</i>
                </div>
              </div>
            </a>
          </li>`);
        }
      }
      if(!haveProblematicScene){
        $('.problematic-scenario-list').html('');
        $('.problematic-scenario-list').addClass('hidden');
        $('.start-check-all-scene').addClass('device-none');
        $('.start-check-all-settings').html(_('Start'));
        $('.start-check-all-settings').removeClass('disabled');
      }else{
        $('.start-check-all-settings').hide();
        $('.start-check-all-scene').removeClass('device-none');
      }
    }
  };
};
