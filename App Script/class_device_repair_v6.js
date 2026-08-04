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
      this.timers = new Set();
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

    hexToPlainText(hexString) {
      const hexPattern = /^[0-9A-Fa-f]+$/;
      if (!hexPattern.test(hexString)) {
        throw new Error('Invalid HEX input. Only hexadecimal characters (0-9, A-F) are allowed.');
      }

      const byteArray = [];
      for (let i = 0; i < hexString.length; i += 2) {
        byteArray.push(parseInt(hexString.substr(i, 2), 16));
      }

      const decoder = new TextDecoder();
      return decoder.decode(new Uint8Array(byteArray));
    }

    extractVersion(str) {
      if (!str) return '';
      const match = str.match(/\d+\.\d+(\.\d+)?/);
      return match ? match[0] : str;
    }

    async promisifyRead(uuid, service, characteristic) {
      return new Promise((resolve, reject) => {
        try {
          if (window.peripheral && window.peripheral[uuid] && typeof window.peripheral[uuid].read === 'function') {
            window.peripheral[uuid].read(service, characteristic, (res) => {
              resolve(res);
            }, (err) => {
              reject(err);
            });
          } else {
            reject('Device not found or read not supported');
          }
        } catch (e) {
          reject(e);
        }
      });
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
        const profileDevice = safeGet(erp, 'info.profile.profile_device', []);

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
    //修复wifi
    iotDeviceRepair.prototype.repairWifi = function () {
      let self = this;
      //定义操作码
      const NEED_RESTART = 101;
      const NEED_RESET = 102;
      const NEED_INPUT = 103;
      return new Promise(async (resolve, reject) => {
        //首先检查是否已经再setting中存在
        try{
          let ssid = self.findSettingValue('Wifi SSID');
          let password = self.findSettingValue('Wifi Password');
          if(ssid && password){
            return resolve(NEED_RESTART);
          }else{
            return resolve(NEED_INPUT);
          }
        }catch(error){
          reject(error)
        }
      });
    }

    //检查wifi设备的email是否与profile的一致
    iotDeviceRepair.prototype.checkWifiEmail = function () {
      let self = this;
      return new Promise(async (resolve, reject) => {
        let email = self.findSettingValue('Email Address');
        let profileEmail = erp.info.profile.profile_email;
        if(profileEmail && profileEmail !== email){
          return resolve(false);
        }else{
          return resolve(true);
        }
      });
    }

    // 更改device setting里面的配置和profile里面的配置
    iotDeviceRepair.prototype.updateEmailForDeviceAndProfile = function () {
      /*
      ** 这里最好一个api坐完这些动作
      */
      let self = this;
      return new Promise(async (resolve, reject) => {
        //首先先写入到设备，并需要提醒用户需要重启设备
        //首先需要拼接gateway
        const profile_email = erp.info.profile.profile_email;
        if(!profile_email){
          return resolve(true);
        }else{
          const emial = `${core_utils_get_mac_address_from_guid(self.props.guid, false)}-${profile_email}`;
          //开始写入蓝牙指令
          const email_data = `932200${profile_email.toLowerCase().length.toString(16).padStart(4, '0')}${profile_email.toLowerCase().convertToHex()}`;
          try{
            await window.peripheral[self.props.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: email_data,
              },
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: '810e',
              }
            ]);
            //成功之后通过api更新数据
            const emailResponse = await http2.request({
                url: encodeURI(`/api/method/appv6.updateProfileDeviceGateway`),
                method: 'POST',
                responseType: 'json',
                serializer: 'json',
                data: {
                  device: self.props.guid,
                  profile_name: erp.info.profile.name,
                  gateway: emial,
                  email: profile_email,
                },
              });
            //更改本地profile device gateway的值
            const profile_device = erp.info.profile.profile_device;
            profile_device.forEach((item) => {
              if(item.device == self.props.guid){
                item.gateway = emial;
              }
            });
            //更改本地的device setting的值
            const deviceMap = erp.info.device[self.props.guid];
            deviceMap.settings.forEach((item) => {
              if(item.setting_type == 'Email Address'){
                item.setting = profile_email;
              }
            });
            //告诉smart home要更新
            window.globalUpdate = true;
            //这里默认先把mobmob的状态更新为最新
            window.peripheral[self.props.guid].prop.is_mobmob = 1;
            return resolve(true);
          }catch(error){
            return reject(error)
          }
        }
      });
    }

    //检查wifi状态
    iotDeviceRepair.prototype.checkWifiStatus = function () {
      let self = this;
      return new Promise(async (resolve, reject) => {
        let isOnline = false;
        let timeoutId = null;
        let delayedWriteTimer = null;
        let isCompleted = false;

        const completeCheck = (result) => {
          if (isCompleted) return;
          isCompleted = true;
          cleanup();
          resolve(result);
        };
        const handleWifiInfo = (data) => {
          try {
            const rs = data.rs;
            const jsonData = JSON.parse(self.utils.hexToPlainText(rs.substring(10)));
            console.log("jsonData",jsonData);
            if (jsonData.ipv4) {
              isOnline = true;
              completeCheck(true);
            } else {
              completeCheck(false);
            }
          } catch (e) {
            // 解析失败通常是因为数据格式不对，不代表WiFi不通
          }
        };
        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            self.utils.timers.delete(timeoutId);
          }
          if (delayedWriteTimer) {
            clearTimeout(delayedWriteTimer);
            self.utils.timers.delete(delayedWriteTimer);
          }
          emitter.off('iot/wifi/info', handleWifiInfo);
        };
        try {
          // 监听WiFi信息
          emitter.on('iot/wifi/info', handleWifiInfo);
          // 延迟发送WiFi状态查询命令
          delayedWriteTimer = setTimeout(async () => {
            if (delayedWriteTimer) {
              self.utils.timers.delete(delayedWriteTimer);
              delayedWriteTimer = null;
            }
            if (isCompleted) return;

            try {
              if (window.peripheral && window.peripheral[self.props.guid]) {
                await window.peripheral[self.props.guid].write([
                  {
                    service: 'ff80',
                    characteristic: 'ff81',
                    data: '9329',
                  },
                ]);
              }
            } catch(error) {
              // 写入失败不一定代表WiFi不通，继续等待超时
            }
          }, 500);
          self.utils.timers.add(delayedWriteTimer);

          timeoutId = setTimeout(() => {
            if (timeoutId) {
              self.utils.timers.delete(timeoutId);
              timeoutId = null;
            }
            completeCheck(isOnline);
          }, 1000 * 6);
          self.utils.timers.add(timeoutId);
        } catch (error) {
          completeCheck(isOnline);
        }
      });
    };

    //检查Mqtt的连接状态
    iotDeviceRepair.prototype.checkMqttConnection = function () {
      //因为一开始已经初始化了设备，所有直接拿peripheral上面的mqtt状态即可
      let self = this;
      const deviceMap = cloneDeep(peripheral[self.props.guid]);
      if(deviceMap && deviceMap.prop && deviceMap.prop.is_mobmob){
        return true;
      }else{
        return false;
      }
    }
    // 检测mesh的方法
    iotDeviceRepair.prototype.checkMesh = function () {
      const self = this;

      return new Promise(function (resolve, reject) {
        try {
          // 检查是否是需要mesh的设备类型
          const isMeshDevice = MESH_DEVICE_MODELS.some(function (model) {
            return self.props.repair_device_model && self.props.repair_device_model.includes(model);
          });
          if (!isMeshDevice) {
            return resolve({ success: true });
          }

          // 开始mesh判断流程
          let rcu_mesh_num = 0; // rcu的mesh数量
          let self_mesh_num = 0; // 本身的mesh数量

          // 寻找rcu设备
          const rcu_device = self.findRcuDevice();
          if (!rcu_device) {
            return resolve({ 
              success: false, 
              reason: 'rcu_not_found',
              message: _('Main RCU controller not found in this room.')
            });
          }

          // 安全获取rcu的mesh数量
          const peripheralPath = 'peripheral.' + rcu_device.device + '.prop.mnSize';
          rcu_mesh_num = safeGet(window, peripheralPath, 0);
          self_mesh_num = safeGet(window, 'peripheral.' + self.props.guid + '.prop.mnSize', 0);
          
          // 检查mesh数量匹配
          if (rcu_mesh_num === self_mesh_num && rcu_mesh_num > 0) {
            return resolve({ success: true, rcu_mesh_num, self_mesh_num });
          } else {
            return resolve({ 
              success: false, 
              reason: 'mesh_mismatch',
              rcu_mesh_num, 
              self_mesh_num,
              message: rcu_mesh_num === 0 ? _('RCU has no mesh data.') : _('Mesh count mismatch with RCU.')
            });
          }
        } catch (e) {
          console.error('Error checking mesh:', e);
          return reject(e);
        }
      });
    };

    // 修复wifi的具体执行逻辑
    iotDeviceRepair.prototype.executeWifiRepair = async function (errorCode) {
      let self = this;
      const NEED_RESTART = 101;
      const NEED_RESET = 102;
      const NEED_INPUT = 103;

      try {
        let ssid = self.findSettingValue('Wifi SSID');
        let password = self.findSettingValue('Wifi Password');

        // 如果是 101 (已存在) 直接尝试重启
        if(errorCode == NEED_RESTART){
         await self.restartDevice();
         return true;
        }else if(errorCode == NEED_RESET){
          await self.resetDevice();
          return true;
        }else if(errorCode == NEED_INPUT){
          await self.sendWifiConfig(ssid, password);
          return true;
        }else{
          return true;
        }
      } catch (e) {
        console.error('executeWifiRepair error:', e);
        return false;
      }
    };

    // 下发 Wifi 配置的底层指令
    iotDeviceRepair.prototype.sendWifiConfig = async function (ssid, password) {
      let self = this;
      try {
        await window.peripheral[self.props.guid].connect();
        
        // 9301 是 SSID, 9302 是 Password (参考 MQTT 的 9302/9303，但 Wifi 通常是 01/02)
        // 注意：这里需要根据实际协议调整，如果协议不对请告知
        let ssid_data = '930100' + ssid.length.toString(16).padStart(4, '0') + ssid.convertToHex();
        let password_data = '930200' + (password || '').length.toString(16).padStart(4, '0') + (password || '').convertToHex();
        
        const bleList = [
          { service: 'ff80', characteristic: 'ff81', data: ssid_data },
          { service: 'ff80', characteristic: 'ff81', data: password_data }
        ];

        await window.peripheral[self.props.guid].write(bleList);
        
        // 下发后通常需要重启生效
        await window.peripheral[self.props.guid].write([
          { service: 'ff80', characteristic: 'ff81', data: '8110' }
        ]);

        return true;
      } catch (e) {
        console.error('sendWifiConfig error:', e);
        return false;
      }
    };

    //设备通过蓝牙获取场景的方法
    iotDeviceRepair.prototype.getDeviceSceneCommand = async function () {
      const self = this;
      return new Promise(async (resolve, reject) => {
        let sceneTimer = null;
        let sceneHandler = null;

        const cleanup = () => {
          if (sceneTimer) {
            clearTimeout(sceneTimer);
            sceneTimer = null;
          }
          if (sceneHandler) {
            emitter.off('get/device/notification', sceneHandler);
            sceneHandler = null;
          }
        };

        try {
          sceneTimer = setTimeout(async() => {
            cleanup();
            try{
              await self.disConnectDevice();
            }catch(error){
              console.error('disConnectDevice or disConnectDevice error:', error);
            }
            reject('Scene Check Timed Out');
          }, 1000 * 60);

          let deviceMap = erp.info.device[this.props.guid];
          if (!deviceMap) {
            cleanup();
            return reject('Device is not found.');
          }

          let deviceModel = deviceMap.device_model;
          if (!(deviceModel.includes('780') || deviceModel.includes('M146') || deviceModel.includes('M86'))) {
            cleanup();
            return resolve([]);
          }

          let commandList = [];
          
          sceneHandler = (data) => {
            // TODO: Device validation (skipped as per user request)
            let rs = data.rs;
            if (!rs) return;
            // 处理特殊指令的转换逻辑
            if (rs.startsWith('972303') && rs.length > 10) {
              const subType = rs.substring(8, 10);
              if (subType === '02' || subType === '01' || subType === '00') {
                const sceneId = rs.slice(6, 8);
                if (sceneId !== '00') {
                  rs = rs.replace('972303', '972003');
                }
              }
            }

            //特殊指令的处理机制
            if(rs.startsWith('8f32') && rs.length > 6){
              rs = rs.substring(0, rs.length-2);
            }

            commandList.push(rs);

            // 检查是否收齐了所有必要的包
            let isFinished = 
              commandList.indexOf('8f1300ff') !== -1 &&
              commandList.indexOf('8f200000ff') !== -1 &&
              commandList.indexOf('972303ff02') !== -1 &&
              commandList.indexOf('972303ff00') !== -1 &&
              commandList.indexOf('972303ff01') !== -1 &&
              commandList.indexOf('8f1000ff') !== -1;
            if(deviceModel.includes('M86') || deviceModel.includes('M146')){
              isFinished = 
              commandList.indexOf('8f1300ff') !== -1 &&
              commandList.indexOf('8f200000ff') !== -1 &&
              commandList.indexOf('972303ff02') !== -1 &&
              commandList.indexOf('972303ff00') !== -1 &&
              commandList.indexOf('972303ff01') !== -1 &&
              commandList.indexOf('8f32ff') !== -1 &&
              commandList.indexOf('8f1000ff') !== -1;
            }
            
            if (isFinished) {
              cleanup();
              resolve(commandList);
            }
          };

          emitter.on('get/device/notification', sceneHandler);

          try {
            let read_action_command = '8f1200ff';
            let read_trriger_command = `8f220000ff`;
            let read_scene_toggle_on_command = `972303ff01`;
            let read_scene_toggle_off_command = `972303ff00`;
            let read_scene_toggle_setting_command = `972303ff02`;
            let read_raw_setting_command = `8f1500ff`;
            let read_led_setting_command = `8f33ff`;
            let read_8_1_0_c = `8f0c01`; //同步设备的状态
            let totalCommand = `1303${read_8_1_0_c}04${read_action_command}05${read_trriger_command}05${read_scene_toggle_on_command}05${read_scene_toggle_off_command}05${read_scene_toggle_setting_command}04${read_raw_setting_command}03${read_led_setting_command}`;

            await window.peripheral[this.props.guid].connect();
            await window.peripheral[this.props.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: totalCommand.toLowerCase(),
              }
            ]);
          } catch(error) {
            cleanup();
            reject(error);
          }
        } catch (error) {
          cleanup();
          reject(error);
        }
      });
    };

    //设备断开连接的方法
    iotDeviceRepair.prototype.disConnectDevice = async function () {
      let self = this;
      try{
        await window.peripheral[self.props.guid].disconnect();
        return true;
      }catch(error){
        console.error('disConnectDevice error:', error);
        return false;
      }
    }

    //设备重启的方法

    iotDeviceRepair.prototype.restartDevice = async function () {
      let self = this;
      try{
        await window.peripheral[self.props.guid].write([
          { service: 'ff80', characteristic: 'ff81', data: '810e' }
        ]);
        return true;
      }catch(error){
        console.error('restartDevice error:', error);
        return false;
      }
    }
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

    //从erp中获取全部场景指令的数组
    iotDeviceRepair.prototype.getErpSceneCommandList = function () {
      let self = this;
      const erpSceneCommandList = [];
      return new Promise(async (resolve, reject) => {
        let sceneList = self.initSceneList();
        try{
          for(let j in sceneList){
            let item = sceneList[j];
              let scene_device_location = item.scene_device_location || [];
              let templateName = item.scene_template;
              let trigger = JSON.parse(item.trigger);
              let action = JSON.parse(item.action);
              let rcuGuid = self.getTheSceneRcu(item);
              let deviceMap = {};
              let deviceModel = '';
              try {
                deviceMap = erp.info.device[self.props.guid];
                deviceModel = deviceMap.device_model;
              } catch (error) {}
              if (deviceModel == 'YO780') {
                let thisCommandList = await self.saveActionCommand(item);
                console.log("thisCommandList",thisCommandList);
                thisCommandList.forEach((kitem) => {
                  if(erpSceneCommandList.indexOf(kitem.command.toLowerCase()) == -1){
                    erpSceneCommandList.push(kitem.command.toLowerCase());
                  }
                });
              } else {
                let thisCommandList = await self.saveTriggetCommand(item,self.props.guid);
                thisCommandList.forEach((kitem) => {
                  if(erpSceneCommandList.indexOf(kitem.data.toLowerCase()) == -1){
                    erpSceneCommandList.push(kitem.data.toLowerCase());
                  }
                });
              }
          }
          return resolve(erpSceneCommandList);
        }catch(error){
          console.error('Error getting erp scene command list:', error);
          return reject(error);
        }
      });
    };

    //核心检测方法，将erp存储的场景和蓝牙获取的场景进行对比，然后返回有错的场景id和相关的代码
    iotDeviceRepair.prototype.checkCoreSceneCommand = function () {
      let self = this;
      return new Promise(async (resolve, reject) => {
        let sceneList = self.initSceneList();
        const errorSceneList = [];
        //定义错误码
        const ERROR_CODE_SCENE_NOT_FOUND = 1001;
        const ERROR_CODE_SCENE_COMMAND_NOT_FOUND = 1002;
        const ERROR_CODE_SCENE_COMMAND_NOT_CORRECT = 1003;
        const returnData = {
          errorSceneList: [],
          errorCode: 100,
        };
        try{
          const sceneCommandList = await self.getDeviceSceneCommand();
          console.log(`sceneCommandList`,sceneCommandList);
          
          /*
          1. 如果发现蓝牙有场景，但是erp没有场景，需要提醒用户进行删除
          2. 如果发现erp有场景，但是蓝牙没有场景，需要提醒用户进行场景写入
          3. 如果sceneCommandList中的场景在sceneList中，则检查该场景的指令是否正确
          4. 如果指令不正确，则将该场景id和相关的代码添加到errorSceneList中
          5. 最后返回errorSceneList和错误码
          */
         if(sceneCommandList.length > 0 && sceneList.length == 0){
          returnData.errorCode = ERROR_CODE_SCENE_NOT_FOUND;
          return resolve(returnData)
         }else if(sceneList.length > 0 && sceneCommandList.length == 0){
          //提醒用户直接写入全部指令
          returnData.errorCode = ERROR_CODE_SCENE_NOT_FOUND;
          return resolve(returnData)
         }else if(sceneList.length > 0 && sceneCommandList.length > 0){
          //先获取全部erp场景的总数
          const erpSceneCommandList = await self.getErpSceneCommandList();
          console.log(`erpSceneCommandList`,erpSceneCommandList);
          //实际的运作方法
          for(let j in sceneList){
            let item = sceneList[j];
            let scene_device_location = item.scene_device_location || [];
            let templateName = item.scene_template;
            let trigger = JSON.parse(item.trigger);
            let action = JSON.parse(item.action);
            let rcuGuid = self.getTheSceneRcu(item);
            let deviceMap = {};
            let deviceModel = '';
            let bleList = [];
            try {
              deviceMap = erp.info.device[self.props.guid];
              deviceModel = deviceMap.device_model;
            } catch (error) {}
            if (deviceModel == 'YO780') {
              let thisCommandList = await self.saveActionCommand(item);
              // console.log("thisCommandList",thisCommandList);
              thisCommandList.forEach((item) => {
                bleList.push({
                  service: 'ff80',
                  characteristic: 'ff81',
                  data: item.command,
                });
              });
            } else {
              bleList = bleList.concat(await self.saveTriggetCommand(item,self.props.guid));
            }
            bleList.forEach((kitem) => {
              const command = kitem.data.toLowerCase();
              if(sceneCommandList.indexOf(command) == -1){
                errorSceneList.push({
                  sceneId: item.name,
                  command: command,
                  errorCode: ERROR_CODE_SCENE_COMMAND_NOT_CORRECT,
                });
              }
            });
          }

          // 检查“蓝牙有，ERP 全集无”（即设备上多余的指令）
          sceneCommandList.forEach((command) => {
            // 排除掉一些系统预定义的查询回复或状态指令
            const systemCommands = ['8f1300ff', '8f200000ff', '972303ff02', '972303ff00', '972303ff01', '8f1000ff','8f32ff'];
            if (systemCommands.indexOf(command.toLowerCase()) === -1 && erpSceneCommandList.indexOf(command.toLowerCase()) === -1) {
              //额外判断过滤一个检测，如果蓝牙有810c的指令，但是erp没有，则不用管
              if(command.toLowerCase().startsWith('8f0c')){
                return;
              }
              errorSceneList.push({
                sceneId: 'Extra', 
                command: command,
                errorCode: ERROR_CODE_SCENE_COMMAND_NOT_FOUND,
              });
            }
          });
          returnData.errorSceneList = errorSceneList;
          return resolve(returnData);
         }else{
          //没有场景需要检查
          returnData.errorCode = 100;
          returnData.errorSceneList = [];
          return resolve(returnData);
         }
        }catch(error){
          returnData.errorCode = ERROR_CODE_SCENE_COMMAND_NOT_CORRECT;
          returnData.errorSceneList = [];
          return resolve(returnData);
        }
      })
      
      
    }

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
        let rcuGuid = self.getTheSceneRcu(scenesMap);
        let oldMac = core_utils_get_mac_address_from_guid(self.props.guid);
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
        let rcuGuid = self.getTheSceneRcu(scenesMap);
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
          if (isset(uiConfiguration[`${self.props.guid}_scene_command`])) {
            commandList.push({
              guid: rcuGuid,
              command: uiConfiguration[`${self.props.guid}_scene_command`].toLocaleLowerCase(),
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
    //获取设备的设置项
    iotDeviceRepair.prototype.getDeviceSettingType = function (guid, setting_type) {
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
    //检查设备是否已经输入mqtt的用户与密码
    iotDeviceRepair.prototype.checkDeviceMqttUsernameAndPassword = function () {
      let self = this;
      try {
        const mqtts = erp.settings[erp.appId].mqtt_scheme;
        if(mqtts == 'mqtts'){
          let mqttUsername = self.findSettingValue('Server Username');
          let mqttPassword = self.findSettingValue('Server Password');
          //如果其中一个为空的情况，重新输入用户的账号密码，并重启设备
          if(!mqttUsername || !mqttPassword){
            return false;
          }
        }else{
          return true;
        }
      } catch (error) {
        console.error('Error checking device mqtt username and password:', error);
      }
    };

    //执行输入mqtts的方法
    iotDeviceRepair.prototype.executeInputMqttUsernameAndPassword = async function () {
      let self = this;
      try {
        const mqtts = erp.settings[erp.appId].mqtt_scheme;
        if(mqtts == 'mqtts'){
          //注意，目前都是只能写死一个用户名称和密码
          const mqttUsername = `iot-device-themira`;
          const mqttPassword = `Uiop0987!@#`;
          let server_username_data = '930200' + mqttUsername.length.toString(16).pad('0000') + mqttUsername.convertToHex();
          let server_password_data = '930300' + mqttPassword.length.toString(16).pad('0000') + mqttPassword.convertToHex();
          const bleList = [{
            service: 'ff80',
            characteristic: 'ff81',
            data: server_username_data,
          },{
            service: 'ff80',
            characteristic: 'ff81',
            data: server_password_data,
          }];
          try {
            await window.peripheral[self.props.guid].connect();
            await window.peripheral[self.props.guid].write(bleList);
            return true;
          } catch (error) {
            console.error('Error executing input mqtt username and password:', error);
            return false;
          }
        }
      } catch (error) {
        console.error('Error executing input mqtt username and password:', error);
      }
    }

    // 蓝牙本身读取固件的方法
    iotDeviceRepair.prototype.readFirmware = ()=>{
      let self = this;
      return new Promise(async (resolve, reject) => {
        try {
          await window.peripheral[self.props.guid].connect();
          const firmware = await window.peripheral[self.props.guid].getCurrentFirmware();
          return resolve(firmware);
        }catch(error){
          return reject(error);
        }
      })
    }

    // 通过接口获取固件版本信息
    iotDeviceRepair.prototype.getFirmwareFromApi = ()=>{
      let self = this;
      return new Promise(async (resolve, reject) => {
        try {
          const firmwareResponse = await http2.request({
            url: encodeURI(`/api/method/appv6.getFirmware`),
            method: 'GET',
            responseType: 'json',
            serializer: 'json',
            params: {
              model: self.props.repair_device_model,
            },
          });
          if (firmwareResponse.data.firmware) {
            const firmware = firmwareResponse.data.firmware;
            return resolve(firmware);
          }else{
            return resolve(null);
          }
        }catch(error){
          return reject(error);
        }
      })
    }

    // 获取设备上最新固件的方法
    iotDeviceRepair.prototype.getCurrentFirmware = ()=>{
      let self = this;
      return new Promise(async (resolve, reject) => {
        try {
          const uuid = window.peripheral[self.props.guid].prop.id;
          const mac = await self.utils.promisifyRead(uuid, '180a', '2a26');
          const version = self.utils.extractVersion(mac.convertToAscii());
          self.props.currentFirmware = version;
          resolve(version);
        }catch(error){

        }
      })
    }
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
            let rcu_ssid = self.getDeviceSettingType(rcu_device.name, 'Wifi SSID');
            let rcu_password = self.getDeviceSettingType(rcu_device.name, 'Wifi Password');
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
    iotDeviceRepair.prototype.updateDeviceSetting = async function (titleType = 'Repair') {
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
          self.utils.showProgress(`${_(titleType)} ${_('Device Setting')}`, 0, settingList.length);
          let settingIndex = 1;
          let totalSettingCount = settingBleList.length;
          for (let i in settingBleList) {
            try {
              let setting = settingBleList[i];
              await window.peripheral[self.props.guid].write([setting]);
              self.utils.showProgress(`${_('Device Setting Progress')}`, settingIndex, totalSettingCount);
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

    // 设备检测的方法
    iotDeviceRepair.prototype.check = async function (){
      let self = this;
    }

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
