window.iotWifiOta = (function () {
  function iotWifiOta(wifiObject) {
    this.prop = {
      id: '',
      service: '',
      characteristic: '',
      currentFirmware: '',
      latestFirmware: '',
      updateTime: '',
      ssid: '',
      password: '',
      progress: 0,
      status: '',
      guid: '',
      gateway: '',
      isOnline: false,
      issetWifi: false,
    };
    this.updateWifiObject(wifiObject);
  }
  //update wifi object
  iotWifiOta.prototype.updateWifiObject = function (wifiObject) {
    const SAFE_PROPS = new Set([
      'ssid', 'password', 'currentFirmware', 
      'latestFirmware', 'status', 'progress', 'guid', 'gateway', 'isOnline', 'issetWifi'
    ]);
    Object.keys(wifiObject).forEach(key => {
      if (SAFE_PROPS.has(key) && wifiObject[key] !== undefined) {
        this.prop[key] = wifiObject[key];
      }
    });
  };
  //wifi connect
  iotWifiOta.prototype.wifiConnect = function () {
    //connect to wifi
    const self = this;
    return new Promise(async(resolve, reject) => {
      let oldResolve = resolve;
      let oldReject = reject;

      const connect_timer = setTimeout(() => {
        reject(_('Sorry, Wi-Fi is not connected yet.'));
      }, 1000*60*2);
      //check if the ssid and password is valid
      if (self.prop.ssid === '' || self.prop.password === '') {
        clearTimeout(connect_timer);
        reject(_('Please fill in the SSID and Password.'));
        return;
      }
      //save ssid and password
      const saveSsid = () => {
        const data = '932000' + self.prop.ssid.length.toString(16).pad('0000') + self.prop.ssid.convertToHex();
        return window.peripheral[self.prop.guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const savePassword = () => {
        const data = '932100' + self.prop.password.length.toString(16).pad('0000') + self.prop.password.convertToHex();
        return window.peripheral[self.prop.guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const saveEmail = () => {
        let list = self.prop.gateway.split('-');
        let email = list[1];
        const data = '932200' + email.length.toString(16).pad('0000') + email.convertToHex();
        return window.peripheral[self.prop.guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const savePort = () => {
        let port = erp.settings[erp.appId].mqtt_port;
        const data = '9301000002' + (port * 1).toString(16).pad('0000');
        return window.peripheral[self.prop.guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const saveServerUrl = () => {
        let serverUrl = 'mqtt://' + erp.settings[erp.appId].mqtt_server;
        const data = '930000' + serverUrl.length.toString(16).pad('0000') + serverUrl.convertToHex();
        return window.peripheral[self.prop.guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const restartDevice = () => {
        const data = '810e';
        return window.peripheral[self.prop.guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const sleep = (ms) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, ms);
        });
      };
      try{
        app.dialog.preloader(_('Connecting Wifi'));
        await saveSsid();
        await savePassword();
        await saveEmail();
        await savePort();
        await saveServerUrl();
        await restartDevice();
        await sleep(10 * 1000);
        await window.peripheral[self.prop.guid].connect();
        let isOnline = await self.checkWifiStatus();
        self.prop.isOnline = isOnline;
        if(isOnline){
          clearTimeout(connect_timer);
          app.dialog.close();
          resolve();
        }else{
          app.dialog.confirm(_('Sorry, Wi-Fi is not connected yet, please try again?'), async()=>{
            try{
              await self.wifiConnect();
              oldResolve();
            }catch(error){
              oldReject(error);
            }
          }, ()=>{
            oldReject(_('Wifi connect failed.'));
          });
        }
      }catch(error){
        clearTimeout(connect_timer);
        while (true) {
          try {
            const dialog = app.dialog.close();
            if (!dialog) {
              break;
            }
          } catch (err) {}
        }
        reject(error);
      }
    });
  };
  //check wifi status
  iotWifiOta.prototype.checkWifiStatus = function () {
    const self = this;
    //check wifi status
    return new Promise((resolve, reject) => {
      let wifiStatus = false;
      let timeoutId = null;
      let isOnline = false;
      const will_topic = `will/${md5(md5(self.prop.gateway))}`;
      const cleanup = () => {
        clearTimeout(timeoutId);
        emitter.off(will_topic, handleWillMessage);
      };
      const handleWillMessage = (payload) => {
        console.log('handleWillMessage: ', payload);
        if (payload.message.toLowerCase().includes('online')) {
          isOnline = true;
          completeCheck(true);
        }else{
          completeCheck(false);
        }
      };
      const completeCheck = (result) => {
        cleanup();
        resolve(result);
      };
      core_mqtt_subscribe(will_topic, 1, false);
      emitter.on(will_topic, handleWillMessage);
      timeoutId = setTimeout(() => {
        completeCheck(isOnline);
      }, 1000*3);
    });
  };
  //start ota
  iotWifiOta.prototype.startOta = function () {
    const self = this;
    return new Promise(async(resolve, reject) => {
      let oldResolve = resolve;
      let oldReject = reject;
      //check if the wifi is connected
      if(!self.prop.isOnline){
        reject(_('Sorry, Wi-Fi is not connected yet.'));
        return;
      }
      //defined the setTimeout
      const ota_timer = setTimeout(() => {
        reject(_('Sorry, OTA failed.'));
      }, 1000*60*10);
      //get the latest_full_firmware
      let hexModel = window.peripheral[self.prop.guid].prop.hexModel;
      let modelMap = erp.doctype.device_model[hexModel.toUpperCase()];
      if(modelMap){
        let device_model_name = modelMap.model_code;
        let latest_firmware = modelMap.latest_firmware;
        self.prop.latestFirmware = latest_firmware;
        if(latest_firmware){
          let version = parseInt(latest_firmware.split('.')[0]);
          let full_firmware_name = latest_firmware + '.bin';
          if ((device_model_name === 'YO105' || device_model_name === 'YO161') && version < 10) {
            full_firmware_name = full_firmware_name + 'D';
          }
          full_firmware_name = full_firmware_name + '.bin';
          //send command
          let topic = `cmd/${md5(md5(self.prop.gateway.toLowerCase()))}`;
          let ota_command = {
            command: 'OTA',
            function: 'bleHelper.ota',
            params: full_firmware_name,
            callback: '',
            raw: '',
          };
          try{
            await core_mqtt_publish(topic, ota_command, 0, false, false, false);
            //wait for the ota to complete
            await sleep(1000*60*2);
            //check if the firmware is the latest
            let isLatest = await self.compareFirmware();
            if(isLatest){
              clearTimeout(ota_timer);
              resolve(_('The firmware is the latest.'));
            }else{
              reject(_('Sorry, OTA failed.'));
            }
          }catch(error){
            reject(error);
          }
        }
      }
    });
  };
  //compare firmware
  iotWifiOta.prototype.compareFirmware = function () {
    const self = this;
    return new Promise(async(resolve, reject) => {
      //compare the firmware
      const status_topic = `status/${md5(md5(self.prop.gateway.toLowerCase()))}`;
      let timeoutId = null;
      let versionMatched = false;
      const cleanup = () => {
        clearTimeout(timeoutId);
        emitter.off(status_topic, handleStatusMessage);
      };


      const handleStatusMessage = (payload) => {
        console.log('handleStatusMessage: ', payload);
        try {
          const data = JSON.parse(payload.message);
          if (data.Info.version.toLowerCase() === self.prop.latestFirmware.toLowerCase()) {
            versionMatched = true;
            completeCheck(true);
          }
        } catch (e) {
          console.log(e);
        }
      };
      const completeCheck = (result) => {
        cleanup();
        resolve(result);
      };
      // 主动请求设备状态
      core_mqtt_publish(
        `cmd/${md5(md5(self.prop.gateway.toLowerCase()))}`,
        {
          command: 'Pubmsg',
          function: 'bleHelper.pubmsg',
          params: '',
          callback: '',
          raw: '',
        },
        0,
        false,
        false,
        false
      ).catch(console.error);
      core_mqtt_subscribe(status_topic, 1, false);
      emitter.on(status_topic, handleStatusMessage);
      timeoutId = setTimeout(() => {
        completeCheck(versionMatched);
      }, 1000*3);
    });
  };

  return iotWifiOta;
})();
