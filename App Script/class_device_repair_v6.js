window.iotDeviceRepair = (function () {
  // 常量定义
  const MESH_DEVICE_MODELS = ['YO780', 'M86', 'M146'];
  const RCU_DEVICE_MODELS = ['YO780', 'RCU Controller'];
  const STATUS_DEVICE_MODELS = ['M360s', 'YO121-AC-R2W', 'YO103'];

  // 工具函数：安全访问嵌套属性
  function safeGet(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[keys[i]];
    }

    return current !== undefined ? current : defaultValue;
  }

  //构造场景修复函数工具类
  class iotDeviceRepairTool {
    constructor(instance) {
      this.instance = instance;
    }

    // Dialog管理 (UI控制)
    showPreloader(message) {
      // 如果已经有Framework7 progress dialog在显示，不显示preloader
      if (this.instance.currentDialog) return;

      try {
        if (typeof app !== 'undefined' && app.dialog && !this.instance.preloaderActive) {
          this.instance.preloaderActive = true;
          app.dialog.preloader(message);
        }
      } catch (e) {
        console.log('Preloader not available:', e);
      }
    }

    hidePreloader() {
      try {
        if (typeof app !== 'undefined' && app.dialog && this.instance.preloaderActive) {
          this.instance.preloaderActive = false;
          app.dialog.close();
        }
      } catch (e) {
        console.log('Preloader close error:', e);
      }
    }

    showProgress(message, currentIndex, totalIndex) {
      if (this.instance.progressObject) {
        this.instance.progressObject.setText(`${message}: (${currentIndex}/${totalIndex})`);
        this.instance.progressObject.setProgress(parseInt((currentIndex / totalIndex) * 100));
        return;
      }
      if (typeof app !== 'undefined' && app.dialog && !this.instance.progressActive) {
        this.instance.progressActive = true;
        this.instance.progressObject = app.dialog.progress(message, 0);
      }
    }

    hideProgress() {
      if (typeof app !== 'undefined' && app.dialog && this.instance.progressActive) {
        this.instance.progressActive = false;
        this.instance.progressObject = null;
        app.dialog.close();
      }
    }
  }

  //构造主函数
  function iotDeviceRepair(iotDeviceRepairMap) {
    // 参数验证
    if (!iotDeviceRepairMap || typeof iotDeviceRepairMap !== 'object') {
      throw new Error('iotDeviceRepairMap is required and must be an object');
    }

    this.props = {
      guid: iotDeviceRepairMap.guid,
      profile_device_name: iotDeviceRepairMap.profile_device_name,
      profile_subdevice_name: iotDeviceRepairMap.profile_subdevice_name,
      repair_device_model: iotDeviceRepairMap.repair_device_model,
    };

    this.utils = new iotDeviceRepairTool(this);
    this.currentDialog = null; //控制当前的dialog
    this.preloaderActive = false; //控制dialog的显示
    this.progressActive = false; //控制进度条的显示
    this.progressObject = null; //控制进度条的对象
    // 从profile中寻找rcu设备的方法 - 移到prototype外部，使用正确的this绑定
    iotDeviceRepair.prototype.findRcuDevice = function () {
      try {
        // 安全访问嵌套属性
        const profileDevice = safeGet(window, 'erp.info.profile.profile_device', []);

        if (!Array.isArray(profileDevice)) {
          console.warn('profile_device is not an array');
          return null;
        }

        const clonedProfileDevice = cloneDeep(profileDevice);

        return (
          clonedProfileDevice.find(function (item) {
            return item && RCU_DEVICE_MODELS.includes(item.device_model);
          }) || null
        );
      } catch (e) {
        console.error('Error finding RCU device:', e);
        return null;
      }
    };

    // 从Device表中寻找对应model的设备
    iotDeviceRepair.prototype.findRcuDeviceFromDeviceTable = function (valueList) {
      let self = this;
      let rcu_device = null;
      let device_table = cloneDeep(erp.info.device);
      for (let i in device_table) {
        let device_item = device_table[i];
        if (valueList.includes(device_item.device_model) || valueList.includes(device_item.device_mode)) {
          rcu_device = device_item;
        }
      }
      return rcu_device;
    };

    // 查找设备的gateway
    iotDeviceRepair.prototype.findDeviceGateway = function () {
      let self = this;
      let gateway = '';
      let profile_device = cloneDeep(erp.info.profile.profile_device);
      profile_device.forEach((item) => {
        if (item.device == self.props.guid) {
          gateway = item.gateway;
        }
      });
      return gateway;
    };

    // 检测mesh的方法
    iotDeviceRepair.prototype.checkMesh = function () {
      const self = this;

      return new Promise(function (resolve, reject) {
        try {
          // 检查是否是需要mesh的设备类型
          const isMeshDevice = MESH_DEVICE_MODELS.some(function (model) {
            return self.props.repair_device_model && self.props.repair_device_model.includes(model);
          });

          if (isMeshDevice) {
            resolve(true);
            return;
          }

          // 开始mesh判断流程
          let rcu_mesh_num = 0; // rcu的mesh数量
          let self_mesh_num = 0; // 本身的mesh数量

          // 寻找rcu设备
          const rcu_device = self.findRcuDevice();

          if (!rcu_device) {
            resolve(false);
            return;
          }

          // 安全获取rcu的mesh数量
          const peripheralPath = 'peripheral.' + rcu_device.device + '.prop.mnSize';
          rcu_mesh_num = safeGet(window, peripheralPath, 0);

          // 检查mesh数量匹配
          if (rcu_mesh_num === self_mesh_num && rcu_mesh_num > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          console.error('Error checking mesh:', e);
          reject(e);
        }
      });
    };
    // 设备重置的方法 - 返回状态码
    iotDeviceRepair.prototype.resetDevice = async function () {
      try {
        // 验证设备是否存在
        if (!this.props.guid) {
          return 1001; // 设备GUID未定义
        }

        const peripheral = safeGet(window, `peripheral.${this.props.guid}`, null);
        if (!peripheral || typeof peripheral.write !== 'function') {
          return 1002; // 设备不存在或不支持写入操作
        }

        await peripheral.write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: '8110',
          },
        ]);

        return true; // 成功
      } catch (error) {
        console.error('Device reset error:', error);
        return error; // 写入操作失败
      }
    };

    // 获取设备组网id
    iotDeviceRepair.prototype.getDeviceNetworkId = function () {
      let self = this;
      let network_id = '';
      let network_position = '';
      let profile_device = cloneDeep(erp.info.profile.profile_device);
      profile_device.forEach((item) => {
        if (item.name == self.props.profile_device_name) {
          network_id = item.network_id;
          network_position = item.network_position;
        }
      });
      return { network_id, network_position };
    };

    //获取组网的内容
    iotDeviceRepair.prototype.initGroupList = function () {
      let self = this;
      let thisList = [];
      let targetNetworkCommandList = [];
      let profile_device = cloneDeep(erp.info.profile.profile_device);
      let network_id = '';
      let network_position = '';
      profile_device.forEach((item) => {
        if (item.device == self.props.guid) {
          network_id = item.network_id;
          network_position = item.network_position;
        }
      });
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
        targetNetworkCommandList = [];
      }
      return targetNetworkCommandList;
    };

    // 获取设备的所有设置
    iotDeviceRepair.prototype.initSettingList = function () {
      let self = this;
      let settings = [];
      try {
        settings = erp.info.device[self.props.guid] ? erp.info.device[self.props.guid].settings : [];
      } catch (error) {
        settings = [];
      }
      let returnList = [];
      settings.forEach((item) => {
        let list = iot_ble_device_setting_type_init(item.setting_type, item.setting, this.props.guid, this.props.guid);
        returnList = returnList.concat(list);
      });
      console.log('returnList', returnList);
      return returnList;
    };

    // 从设备的设置内容中找到对应的value
    iotDeviceRepair.prototype.findSettingValue = function (setting_type) {
      let self = this;
      if (!setting_type) {
        return '';
      }
      let settings = erp.info.device[self.props.guid].settings;
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

    // 获取场景的方法
    iotDeviceRepair.prototype.initSceneList = function () {
      let self = this;
      let sceneList = [];
      let scenes = cloneDeep(erp.info.scene);
      for (let scene in scenes) {
        let scene_item = scenes[scene];
        scene_item.writeStatus = false;
        let scene_device_location = scene_item.scene_device_location || [];
        let scene_location_map = scene_device_location.find((item) => item.device == self.props.guid);
        if (scene_location_map) {
          sceneList.push(scene_item);
        }
        if (self.props.repair_device_model.includes('M86-DP')) {
          if (scene_item.title.includes('Do Not Disturb') || scene_item.title.includes('Clean Up')) {
            sceneList.push(scenes[scene]);
          }
        }
      }
      console.log('sceneList', sceneList);
      return sceneList;
    };

    //核心业务修改，需要补充指令的检查
    iotDeviceRepair.prototype.checkCoreTriggerCommand = function (triggerCommand) {
      let self = this;
      /*
      实现思路：
      1. 检查指令中是否包含自己的mac address（取反）
      2. 如果不包含，则需要重新架构该指令，并返回新的指令
      3. 如果包含，则直接返回该指令
      4. 这里需要分析部同场景不同的指令，是否考虑太复杂
      5. 如果直接用UI的JSON来处理，则等于重构一遍整个页面的逻辑，太耗时
      */
    };
    // 保存场景指令trigger的方法

    iotDeviceRepair.prototype.saveTriggetCommand = function (scenesMap) {
      let self = this;
      try {
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
          if (triggerList[i].guid != self.props.guid) {
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
              self.props.repair_device_model == 'M86-DP'
            ) {
              bleList.push({
                service: 'ff80',
                characteristic: 'ff81',
                data: uiConfiguration[item].toLowerCase(),
              });
            }
          });
        }
        return bleList;
      } catch (error) {
        console.error('Error saving trigger command:', error);
        return [];
      }
    };

    // 保存场景指令Action的方法
    iotDeviceRepair.prototype.saveActionCommand = function (scenesMap) {
      let self = this;
      try {
        let sceneTemplate = scenesMap.scene_template;
        let sceneName = scenesMap.title;
        let scene_device_location = scenesMap.scene_device_location || [];
        let scene_virtual_button = scenesMap.scene_virtual_button || [];
        let actionMap = JSON.parse(scenesMap.action);
        let triggerMap = JSON.parse(scenesMap.trigger);
        let uiConfiguration = null;
        let rcuGuid = getTheSceneRcu(scenesMap);
        let oldMac = core_utils_get_mac_address_from_guid(self.props.guid);
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
          let uiConfigurationMap = uiConfiguration[`${self.props.guid}_device`];
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
          if (isset(actionMap[rcuGuid]['triggerCommand']) && actionMap[rcuGuid]['triggerCommand']) {
            commandList.push({
              guid: rcuGuid,
              command: actionMap[rcuGuid]['triggerCommand'].toLocaleLowerCase(),
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
        return commandList;
      } catch (error) {
        console.error('Error saving action command:', error);
        return [];
      }
    };

    // 从场景对象中获取场景的rcu设备
    iotDeviceRepair.prototype.getTheSceneRcu = function (sceneMap) {
      let self = this;
      let rcuGuid = '';
      let rcuList = [];
      let scene_device_location = sceneMap.scene_device_location || [];
      for (let i in scene_device_location) {
        let guid = scene_device_location[i].device;
        if (isset(erp.info.device[guid])) {
          let device_model = erp.info.device[guid].device_model;
          if (device_model == 'YO780' || device_model == 'RCU Controller') {
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

    // 检查设备是否需要OTA
    iotDeviceRepair.prototype.checkDeviceFirmwareVersionAndUpdate = async function () {
      let self = this;
      try {
        //获取erp记录的gateway的值
        let gateway = self.findDeviceGateway();
        let ssid = self.findSettingValue('Wifi SSID');
        let password = self.findSettingValue('Wifi Password');
        //如果没有设置wifi的值，可以找到rcu设置的wifi的值
        if (!ssid) {
          let rcu_device = self.findRcuDeviceFromDeviceTable(RCU_DEVICE_MODELS);
          if (rcu_device) {
            let rcu_ssid = get_device_setting_type(rcu_device.guid, 'Wifi SSID');
            let rcu_password = get_device_setting_type(rcu_device.guid, 'Wifi Password');
            if (rcu_ssid) {
              ssid = rcu_ssid;
            }
            if (rcu_password) {
              password = rcu_password;
            }
          }
        }

        //初始化ota的class
        const otaInstance = new window.iotWifiOta({
          guid: self.props.guid,
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
              return _('Abnormal progress Interruption');
            }
          },
          onError: (error) => {
            console.log('error', error);
            // 显示错误信息
            return error;
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
              () => {
                // 告诉OTA实例：用户选择重试当前操作
                resolve(true);
              },
              () => {
                // 告诉OTA实例：用户选择放弃
                resolve(false);
              }
            );
          },
        });

        await otaInstance.init();
        const status = otaInstance.getStatus();
        console.log('WiFi状态:', status.wifiStatus);
        console.log('需要连接WiFi:', status.needsWifiConnection);
        console.log('需要固件升级:', status.needsFirmwareUpgrade);
        if (status.needsFirmwareUpgrade) {
          //需要OTA升级
          if (status.needsWifiConnection) {
            console.log('开始连接WiFi...');
            await otaInstance.wifiConnect();
            console.log('WiFi连接成功');
            console.log('开始固件升级...');
            await otaInstance.fullUpgrade();
            console.log('固件升级成功');
            return true;
          } else {
            console.log('WiFi连接成功');
            console.log('开始固件升级...');
            await otaInstance.fullUpgrade();
            console.log('固件升级成功');
            return true;
          }
        } else {
          //不需要OTA升级
          return true;
        }
      } catch (error) {
        console.error('Firmware update error:', error);
        return 4001; // OTA升级失败
      }
    };

    // 部分设备需要补充状态指令（窗帘、360，103电视机）
    iotDeviceRepair.prototype.writeStatusCommand = async function () {
      let self = this;
      if (STATUS_DEVICE_MODELS.includes(self.props.repair_device_model)) {
        //进一步判断是否是窗帘
        if (STATUS_DEVICE_MODELS.indexOf(self.props.repair_device_model) == 1) {
          //窗帘
          try {
            await window.peripheral[self.props.guid].write([{ service: 'ff80', characteristic: 'ff81', data: '8f130101028900' }]);
            return true;
          } catch (error) {
            throw error;
          }
        }
        if (STATUS_DEVICE_MODELS.indexOf(self.props.repair_device_model) == 0) {
          //360
          try {
            await window.peripheral[self.props.guid].write([
              { service: 'ff80', characteristic: 'ff81', data: '8f130101029403029404029405029406' },
            ]);
            return true;
          } catch (error) {
            throw error;
          }
        }
        if (STATUS_DEVICE_MODELS.indexOf(self.props.repair_device_model) == 2) {
          //103电视机
          try {
            await window.peripheral[self.props.guid].write([{ service: 'ff80', characteristic: 'ff81', data: '8f130101028010' }]);
            return true;
          } catch (error) {
            throw error;
          }
        }
      } else {
        return true;
      }
    };
    // 更新devicesetting的操作方法
    iotDeviceRepair.prototype.updateDeviceSetting = async function () {
      let self = this;
      let settingList = self.initSettingList();
      if (settingList.length > 0) {
        try {
          //获取setting
          let settingBleList = [];
          settingList.forEach((item) => {
            settingBleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: item.command,
            });
          });
          //开始更新setting,并显示UI进度条
          self.utils.showProgress('Restore Device Setting', 0, settingList.length);
          let settingIndex = 1;
          let totalSettingCount = settingBleList.length;
          for (let i in settingBleList) {
            try {
              let setting = settingBleList[i];
              await window.peripheral[self.props.guid].write([setting]);
              self.utils.showProgress('Restore Device Setting', settingIndex, totalSettingCount);
              console.log('settingIndex', settingIndex);
              console.log('totalSettingCount', totalSettingCount);
              if (settingIndex == totalSettingCount) {
                self.utils.hideProgress();
                return true;
              } else {
                settingIndex++;
              }
            } catch (error) {
              self.utils.hideProgress();
              throw error;
            }
          }
          return true;
        } catch (error) {
          throw error;
        }
      } else {
        return true;
      }
    };

    // 设备repair的主运行方法
    iotDeviceRepair.prototype.run = async function () {
      let self = this;
      try {
        //首先检查是否需要mesh
        let needMesh = await self.checkMesh();
        console.log('needMesh', needMesh);
        if (needMesh) {
          //不需要重新mesh
          //第一步先检查设备是否需要ota
          await self.checkDeviceFirmwareVersionAndUpdate();
          //第二步检查设备是否需要状态指令
          await self.writeStatusCommand();
          //第三步开始检查所有的device setting
          await self.updateDeviceSetting();
        } else {
          //需要重新reset后做mesh操作
        }
        return true;
      } catch (error) {
        console.error('Device repair run error:', error);
        return false;
      }
    };

    // 等待时间的方法 - 返回Promise，参数错误返回rejected Promise
    iotDeviceRepair.prototype.sleep = function (ms) {
      if (typeof ms !== 'number' || ms < 0) {
        return Promise.resolve(3001); // 参数错误
      }
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(0); // 成功
        }, ms);
      });
    };
  }

  return iotDeviceRepair;
})();
