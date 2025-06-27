window.device_firmware_upgrade_vm = null;
window.device_firmware_upgrade_component = {
  template: /*html*/ `
  <div class="container" v-cloak>
    <yo-skeleton loading="true">
      <div style="height: 20px"></div>
      <div class="card no-border no-shadow no-padding no-margin" style="background: none">
        <div class="card-content card-content-padding">
          <div style="height: 30px"></div>
          <div class="display-flex align-items-center justify-content-center">
            <i class="state-normal f7-icons text-color-primary" style="font-size: 90px" v-if="updateStatus == 'Normal'">arrow_up_circle</i>
            <div class="state-upgrading text-color-primary position-relative" style="height: 180px; width: 180px" v-if="updateStatus == 'Upgrading'">
              <div class="loader"></div>
              <div class="display-flex flex-direction-column align-items-center justify-content-center" style="width: 100%; height: 100%">
                <span class="position-relative" style="font-size: 90px; font-weight: 200; line-height: 1; vertical-align: baseline">
                  <span class="current-progress" style="transition: all 0.5s ease-out">{{percent}}</span>
                  <span style="font-size: 20px; position: absolute; bottom: 14px; right: -20px">%</span>
                </span>
                <div style="height: 10px"></div>
                <div class="current-step" style="font-size: 16px"></div>
              </div>
            </div>
            <div class="state-success" v-if="updateStatus == 'Success'">
              <div class="display-flex flex-direction-column align-items-center">
                <i class="f7-icons text-color-green" style="font-size: 90px">checkmark_alt_circle</i>
                <div style="height: 10px"></div>
                <div class="text-color-green" style="font-size: 16px">{{ _("Update Successfully") }}</div>
              </div>
            </div>
            <div class="state-fail" v-if="updateStatus == 'Fail'">
              <div class="display-flex flex-direction-column align-items-center">
                <i class="f7-icons text-color-red" style="font-size: 90px">exclamationmark_circle</i>
                <div style="height: 10px"></div>
                <div class="text-color-red" style="font-size: 16px">{{ _("Update Fail") }}: {{fail_msg}}</div>
              </div>
            </div>
          </div>
          <div style="height: 20px"></div>
          <div class="text-align-center mb-1 is-latest" style="font-size: 16px; font-weight: bold" v-if="isLatest">
            {{ _("This is the latest version") }}
          </div>
          <div class="text-align-center mb-1 latest-version" style="font-size: 16px; font-weight: bold" v-if="!isLatest">
            {{ _("Latest Version") }}: <span>{{latest_firmware}}</span>
          </div>
          <div class="text-align-center mb-1" style="font-size: 16px; font-weight: bold" v-if="!isLatest">
            {{ _("Current Version") }}: <span v-if="checkingFirmware">{{current_firmware}}</span>
            <span v-else style="font-size: 12px;">Connecting...</span>
          </div>
          <div v-if="isUpgrading" class="text-align-center text-color-primary mt-4" style="font-size: 18px">Upgrading...</div>
          <div style="height: 20px"></div>
        </div>
      </div>
      <div style="height: 50px"></div>
      <h3 style="font-weight: bold; padding: 20px; font-size: 16px" v-if="updateStatus == 'Normal' && firmwareDescRef.value && !isLatest && checkingFirmware">${_('Update Logs')}</h3>
      <p class="text-muted" style="padding: 0 20px; font-size: 12px" v-if="updateStatus == 'Normal' && firmwareDescRef.value && !isLatest && checkingFirmware" v-html="firmwareDescRef.value"></p>
    </yo-skeleton>
  </div>
  `,
  props: {
    guid: {
      type: String,
      default: '',
    },
    gateway: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
  },
  data: () => {
    return {
      deviceList: [],
      checkingFirmware: false,
      percent: 0,
      currentStep: '',
      updateStatus: 'Normal', //Upgrading, Success, Fail
      isUpgrading: false,
      fail_msg: '',
      isLatest: false,
      latest_firmware: '',
      current_firmware: '',
      fake_progress: null,
      firmwareDescRef: {
        value: '',
      },
      device_model_name: '',
      isIniting: {
        value: false,
      },
      isLogged: !!users.current && users.current !== 'Guest',
      isDeveloper: false,
      downloadLink : '',
    };
  },
  methods: {
    extractVersion(version) {
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
    },
    promisifyWrite(device_id, service_uuid, characteristic_uuid, data) {
      return new Promise((resolve, reject) => {
        ble.write(
          device_id,
          service_uuid,
          characteristic_uuid,
          data.convertToBytes(),
          () => {
            resolve();
          },
          (error) => {
            if (data === '810e') {
              resolve();
            } else {
              reject(error);
            }
          }
        );
      });
    },
    promisifyWriteWithoutResponse(device_id, service_uuid, characteristic_uuid, data) {
      return new Promise((resolve, reject) => {
        ble.writeWithoutResponse(
          device_id,
          service_uuid,
          characteristic_uuid,
          data.convertToBytes(),
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      });
    },
    promisifyConnect(device_id) {
      let isConnect = false;
      return new Promise((resolve, reject) => {
        ble.connect(
          device_id,
          () => {
            isConnect = true;
            resolve();
          },
          (error) => {
            if (!isConnect) {
              reject(error);
            }
          }
        );

        setTimeout(() => {
          if (isConnect) return;

          // promisifyDisconnect(device_id).catch(() => {});
          reject('7001');
        }, 6000);
      });
    },
    promisifyDisconnect(device_id) {
      return new Promise((resolve, reject) => {
        ble.disconnect(
          device_id,
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      });
    },
    promisifyRead(device_id, service_uuid, characteristic_uuid) {
      return new Promise((resolve, reject) => {
        ble.read(
          device_id,
          service_uuid,
          characteristic_uuid,
          (res) => {
            resolve(res);
          },
          (error) => {
            reject(error);
          }
        );
      });
    },
    sleep(time = 1000) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    },
    arrayBufferToHex(arrayBuffer) {
      const uint8Array = new Uint8Array(arrayBuffer);
      return Array.from(uint8Array)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    },
    hexToBuffer(hexString) {
      // 假设 hexString 是一个表示十六进制数据的字符串，例如 "4A2F7C"
      // 首先将 hexString 解析为字节数组
      var bytes = new Uint8Array(Math.ceil(hexString.length / 2));
      for (var i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
      }

      // 然后创建一个 ArrayBuffer 对象并将字节数组复制到这个缓冲区中
      var buffer = bytes.buffer;

      return buffer;
    },
    bytesToString(buffer) {
      return String.fromCharCode.apply(null, new Uint8Array(buffer));
    },
    updatePercent() {
      this.percent = parseInt(this.fake_progress.progress * 100);
    },
    updateStatusFun(state) {
      this.updateStatus = state;
      if (state === 'Upgrading') {
        this.isUpgrading = true;
      } else {
        this.isUpgrading = false;
      }
    },
    getUUID() {
      let uuid = '';
      try {
        uuid = window.peripheral[this.guid].prop.id;
      } catch (error) {
        // ignore
      }
      if (!uuid) {
        app.dialog.alert('Device not here!');
        return '';
      }

      return uuid;
    },
    async readFirmware(uuid) {
      try{
        const mac = await this.promisifyRead(uuid, '180a', '2a26');
        return this.extractVersion(mac.convertToAscii());
      }catch(error){
        this.checkingFirmware = false;
        this.$emit('update-status',false);
        this.updateStatusFun('Fail');
        this.fail_msg = 'Firmware check failed';
        app.dialog.alert(_(erp.get_log_description(error)));
        return '';
      }
    },
    destory() {
      Capacitor.Plugins.NordicDFU.abortDFU();
      Capacitor.Plugins.NordicDFU.removeAllListeners();
    },
    async uploadFirmwareToServer() {
      try {
        await http.request(encodeURI('/api/resource/Device/' + this.guid), {
          method: 'PUT',
          responseType: 'json',
          serializer: 'json',
          debug: true,
          data: {
            firmware: this.current_firmware,
          },
        });
        peripheral[this.guid].getProp().firmware = this.current_firmware;
      } catch (err) {
        // ignore
      }
    },
    async startUpdateFirmware() {
      if (!this.latest_firmware){
        this.$emit('update-status',true);
        return
      };
      if(this.isLatest){
        this.$emit('update-status',true);
        return
      }
      if(!this.checkingFirmware){
        app.dialog.alert(_('Please wait for the firmware check to complete.'));
        return;
      }
      this.percent = 0;
      if (this.latest_full_firmware.endsWith('N')) {
        // this.updateNordicFirmware();
      } else if (this.latest_full_firmware.endsWith('E')) {
        //check wifi connect status
        app.dialog.preloader(_('Checking Wi-Fi...'));
        let wifiStatus = await this.checkWifiStatus();
        debugger
        app.dialog.close();
        let checkWifiStatus = true;
        if(!wifiStatus){
          let wifiInfo = null;
          try{
            wifiInfo = await this.connectAndCheckWifi();
          }catch(error){
            this.updateStatusFun('Fail');
            this.fail_msg = 'Wifi connection failed';
            this.$emit('update-status',false);
            return;
          }
          if(wifiInfo){
            try{
              await this.connectWifi(wifiInfo.username,wifiInfo.password);
            }catch(error){
              this.updateStatusFun('Fail');
              this.fail_msg = 'Wifi connection failed';
              this.$emit('update-status',false);
              return;
            }
          }else{
            this.updateStatusFun('Fail');
            this.fail_msg = 'Wifi connection failed';
            this.$emit('update-status',false);
          }
        }
        if(checkWifiStatus){
          this.updateWifiFirmware();
        }else{
          this.updateStatusFun('Fail');
          this.fail_msg = 'Wifi connection failed';
          this.$emit('update-status',false);
        }
      }
    },
    checkWifiStatus(){
      return new Promise((resolve, reject) => { 
        let wifiStatus = false;
        let will_topic = `will/${md5(md5(this.gateway))}`;
        let status_topic = `status/${md5(md5(this.gateway))}`;
        let timeoutId = null;
        let isOnline = false;
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
      })
    },
    connectWifi(ssid,password){
      return new Promise(async(resolve,reject)=>{
        app.dialog.preloader(_('Connect Wi-Fi, it will take about 2-3 minutes.'));
        let wifiConnectTimmer = setTimeout(()=>{
          app.dialog.close();
          reject('Sorry, Wi-Fi is not connected yet.');
        },1000*60*2);
        if (ssid === '' || password === '') {
          clearTimeout(wifiConnectTimmer);
          reject('Please fill in the SSID and Password.');
          return;
        }else{
          const saveSsid = () => {
            const data = '932000' + ssid.length.toString(16).pad('0000') + ssid.convertToHex();
            return window.peripheral[this.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
              },
            ]);
          };
          const saveSsidPassword = () => {
            const data = '932100' + password.length.toString(16).pad('0000') + password.convertToHex();
  
            return window.peripheral[this.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
              },
            ]);
          };
          const saveEmail = () => {
            let list = this.gateway.split('-');
            let email = list[1];
            const data = '932200' + email.length.toString(16).pad('0000') + email.convertToHex();
  
            return window.peripheral[this.guid].write([
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
  
            return window.peripheral[this.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
              },
            ]);
          };
          const saveServerUrl = () => {
            let server_url = 'mqtt://' + erp.settings[erp.appId].mqtt_server;
            if(erp.settings[erp.appId].mqtt_scheme){
              server_url = `${erp.settings[erp.appId].mqtt_scheme}://' + ${erp.settings[erp.appId].mqtt_server}`;
            }
            const data = '930000' + server_url.length.toString(16).pad('0000') + server_url.convertToHex();
  
            return window.peripheral[this.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
              },
            ]);
          };
          const restartDevice = () => {
            return window.peripheral[this.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: '810e',
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
            const checkIfOnline = () => {
              let will_topic = `will/${md5(md5(this.gateway))}`;
              try{
                core_mqtt_subscribe(will_topic, 1, false);
                window.$subscribeTimer = setTimeout(() => {
                  core_mqtt_subscribe(will_topic, 1, false);
                }, 10 * 1000);
              }catch(error){
                reject(error);
              }
            if (window.$wifiTopicFun) {
              emitter.off(will_topic, window.$wifiTopicFun);
            }
            window.$wifiTopicFun = async (res) => {
              console.log('component res', res);
              let message = res.message;
              if (message.includes('Online')) {
                clearTimeout(window.$subscribeTimer);
                clearTimeout(wifiConnectTimmer);
                //update profile_devices
                let thisMap = erp.info.profile.profile_device.find((item)=>item.device == this.guid);
                if(thisMap){
                  thisMap.gateway = this.gateway;
                }
                window.peripheral[this.guid].prop.is_mobmob = 1;
                app.dialog.close();
                resolve(true)
                //check the state of the connect status
              }
            };
            emitter.on(will_topic, window.$wifiTopicFun);
          };
          try{
            await saveSsid();
            await saveSsidPassword();
            await saveEmail();
            await savePort();
            await saveServerUrl();
            await restartDevice();
            await sleep(10 * 1000);
            await window.peripheral[this.guid].connect();
            checkIfOnline();
          }catch(error){
            clearTimeout(wifiConnectTimmer);
            app.dialog.close();
            reject(error)
          }
        }
      })
    },
    showPromptDialog(title){
      return new Promise(async(resolve,reject)=>{
        app.dialog.login(_(title),(username,password)=>{
          resolve({
            username : username,
            password : password,
          });
        },()=>{
          resolve(false);
        });
        //change the dialog to the wifi dialog
        setTimeout(()=>{
          $('.dialog-input-field input[name="dialog-username"]').attr('placeholder','Ssid');
          $('.dialog-input-field input[name="dialog-password"]').attr('type','text');
          $('.dialog-input-field input[name="dialog-password"]').attr('placeholder','Password');
          if(erp.wifiInfo){
            $('.dialog-input-field input[name="dialog-username"]').val(erp.wifiInfo.ssid);
            $('.dialog-input-field input[name="dialog-password"]').val(erp.wifiInfo.password);
          }
          // $('.dialog-input-field input[name="dialog-username"]').val(wifiInfoMap.ssid);
          // $('.dialog-input-field input[name="dialog-password"]').val(wifiInfoMap.password);
        },200);
      })
    },
    showUpdateConfirm(title){
      return new Promise(async(resolve,reject)=>{ 
        app.dialog.confirm(_(title),()=>{
          resolve(true);
        },()=>{
          resolve(false);
        });
      })
    },
    connectAndCheckWifi() {
      return new Promise(async (resolve, reject) => {
        while (true) {
          let wifiInfo = await this.showPromptDialog(_('Please enter the wifi information'));

          if (wifiInfo) {
            let ssid = wifiInfo.username;
            let password = wifiInfo.password;
            erp.wifiInfo = {
              ssid : ssid,
              password : password,
            }
            let confirmWifiInfo = await this.showUpdateConfirm(`Please confirm your ssid is (${ssid}) and the password is (${password}).`);

            if (confirmWifiInfo) {
              resolve(wifiInfo); // 用户确认，正确解析
              return; // 退出循环和函数
            }
            // 用户不确认则继续循环
          } else {
            let cancelWifiStatus = await this.showUpdateConfirm(
              _('Are you sure you want to cancel the Wi-Fi connection and discard the firmware upgrade?')
            );

            if (cancelWifiStatus) {
              reject(0); // 用户确认取消，拒绝Promise
              return; // 退出循环和函数
            }
            // 用户不取消则继续循环
          }
        }
      });
    },
    checkDeviceOnlineAndVersion(gatewayhash, expectedVersion) {
      return new Promise((resolve) => {
        const will_topic = `will/${gatewayhash}`;
        const status_topic = `status/${gatewayhash}`;
        let timeoutId = null;
        let isOnline = false;
        let versionMatched = false;
        let count = 0;
        const cleanup = () => {
          clearTimeout(timeoutId);
          emitter.off(will_topic, handleWillMessage);
          emitter.off(status_topic, handleStatusMessage);
        };
        const handleWillMessage = (payload) => {
          console.log('handleWillMessage: ', payload);
          if (payload.message.toLowerCase().includes('online') && !isOnline) {
            isOnline = true;
            checkVersionStatus();
          }
        };
        const handleStatusMessage = (payload) => {
          console.log('handleStatusMessage: ', payload);
          count++;
          try {
            const data = JSON.parse(payload.message);
            if (data.Info.version.toLowerCase() === expectedVersion.toLowerCase()) {
              versionMatched = true;
              completeCheck(true);
              return;
            }
            if(count == 3){
              if(data.Info.version.toLowerCase() === expectedVersion.toLowerCase()){
                versionMatched = true;
                completeCheck(true);
                return;
              }else{
                completeCheck(false);
                return;
              }
            }
          } catch (e) {
            console.log(e);
          }
        };
        const completeCheck = (result) => {
          cleanup();
          resolve(result);
        };
        const checkVersionStatus = () => {
          if (versionMatched) {
            completeCheck(true);
            return;
          }

          // 主动请求设备状态
          core_mqtt_publish(
            `cmd/${gatewayhash}`,
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
        };
        core_mqtt_subscribe(will_topic, 1, false);
        core_mqtt_subscribe(status_topic, 1, false);
        emitter.off(will_topic, handleWillMessage);
        emitter.off(status_topic, handleStatusMessage);
        emitter.on(will_topic, handleWillMessage);
        emitter.on(status_topic, handleStatusMessage);
        timeoutId = setTimeout(() => {
          completeCheck(isOnline && versionMatched);
        }, 60000 * 3);
        // 双重检测机制
        setTimeout(() => {
          // 先检测当前是否已在线
          core_mqtt_publish(
            `cmd/${gatewayhash}`,
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
          )
            .then(() => checkVersionStatus())
            .catch(console.error);
        }, 500);
      });
    },
    //Wifi Action
    async updateWifiFirmware() {
      try {
        
        const uuid = this.getUUID();
        this.updateStatusFun('Upgrading');
        const version = parseInt(this.current_firmware.split('.')[0]);
        let full_firmware_name = this.latest_full_firmware;
        if ((this.device_model_name === 'YO105' || this.device_model_name === 'YO161') && version < 10) {
          full_firmware_name = full_firmware_name + 'D';
        }
        full_firmware_name = full_firmware_name + '.bin';
        // send command
        const command = '93300000' + full_firmware_name.length.toString(16).pad('00') + full_firmware_name.convertToHex();
        console.log('Upgrade Firmware: ' + full_firmware_name);
        console.log('Upgrade Command: ' + command);
        // try {
        //   await this.promisifyConnect(uuid);
        //   app.dialog.close();
        // } catch (err) {
        //   app.dialog.close();
        //   debugger
        //   if (!this.gateway) {

        //   } else {
        //     let gateway_address = this.gateway;
        //     let topic = `cmd/${md5(md5(gateway_address.toLowerCase()))}`;
        //     let command = {
        //       command: 'OTA',
        //       function: 'bleHelper.ota',
        //       params: full_firmware_name,
        //       callback: '',
        //       raw: '',
        //     };
        //     await core_mqtt_publish(topic, command, 0, false, false, false);
        //     this.fake_progress.setProgress(0.1);
        //     this.updatePercent();
        //     await sleep(1000 * 20);
        //     this.fake_progress.setProgress(0.3);
        //     this.updatePercent();
        //     await sleep(1000 * 10);
        //     this.fake_progress.setProgress(0.5);
        //     this.updatePercent();
        //     await sleep(1000 * 10);
        //     this.fake_progress.setProgress(0.7);
        //     this.updatePercent();
        //     await sleep(1000 * 10);
        //     this.fake_progress.setProgress(0.85);
        //     this.updatePercent();
        //     await sleep(1000 * 10);
        //     let result = await this.checkDeviceOnlineAndVersion(md5(md5(gateway_address.toLowerCase())), this.latest_full_firmware);
        //     if (!result) {
        //       throw '6300';
        //     } else {
        //       this.fake_progress.setProgress(100);
        //       emitter.emit('ha:device:firmware:upgrade', { guid: this.guid });
        //       this.updateStatusFun('Success');
        //       //if success, will reset the wifi info
        //       if(this.model && (this.model.includes('RCU Scene Button') || this.model.includes('RF Sensor'))){
        //         await this.iotResetWifi();
        //       }
        //       this.$emit('update-status',true);
        //     }
        //   }
        // }
        // try {
        //   await this.promisifyWrite(uuid, 'ff80', 'ff81', command);
        // } catch (err) {
        //   console.error('[promisifyWrite] upgrade command error: ', err);
        // }
        this.fake_progress.setProgress(0.15);
        this.updatePercent();
        let gateway_address = this.gateway;
        let topic = `cmd/${md5(md5(gateway_address.toLowerCase()))}`;
        let ota_command = {
          command: 'OTA',
          function: 'bleHelper.ota',
          params: full_firmware_name,
          callback: '',
          raw: '',
        };
        setTimeout(()=>{
          cordova.plugin.innocow.mqtt.execute({
              command:"publish",
              id:(Math.floor(Math.random() * 100000) + 1),
              topic:`status/${md5(md5(gateway_address.toLowerCase()))}`,
              msg:'',
              qos:0,
              retained:false
          }, function(success){
              console.log("Publish status successfully.");
          }, function(error){
              console.log("Publish Error: "+JSON.stringify(error));
          });
          // core_mqtt_publish(`status/${md5(md5(gateway_address.toLowerCase()))}`, ota_command, 0, false, false, false);
        },10000);
        await core_mqtt_publish(topic, ota_command, 0, false, false, false);
        this.updatePercent();
        await sleep(1000 * 20);
        this.fake_progress.setProgress(0.3);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.4);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.5);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.6);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.7);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.8);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.85);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.9);
        this.updatePercent();
        await sleep(1000 * 10);
        this.fake_progress.setProgress(0.95);
        this.updatePercent();
        await sleep(1000 * 10);
        let result = await this.checkDeviceOnlineAndVersion(md5(md5(gateway_address.toLowerCase())), this.latest_full_firmware);
        if (!result) {
          throw '6300';
        } else {
          this.current_firmware = this.latest_firmware;
          await this.uploadFirmwareToServer();
          this.fake_progress.setProgress(100);
          emitter.emit('ha:device:firmware:upgrade', { guid: this.guid });
          this.updateStatusFun('Success');
          //if success, will reset the wifi info
          if(this.model && (this.model.includes('RCU Scene Button') || this.model.includes('RF Sensor'))){
            await this.iotResetWifi();
          }
          this.$emit('update-status',true);
        }
        return
        debugger
        // this.fake_progress.setProgress(0.15);
        // this.updatePercent();
        // await this.sleep(5000);
        // await this.retryConnect(uuid);
        // console.log('retry connect success');
        // this.fake_progress.setProgress(0.25);
        // this.updatePercent();
        // await window.peripheral[this.guid].connect();
        // this.fake_progress.setProgress(0.3);
        // this.updatePercent();
        // await this.receiveUpgradingPercentNotify(uuid);
        // await this.sleep(5000);
        // this.fake_progress.setProgress(0.85);
        // this.updatePercent();
        // await this.retryConnect(uuid);
        // await this.sleep(8000);
        // this.fake_progress.setProgress(0.87);
        // this.updatePercent();
        // await this.retryConnect(uuid);
        // await this.sleep(8000);
        // this.fake_progress.setProgress(0.89);
        // this.updatePercent();
        // // const firmware = await this.readFirmware(uuid);
        // // if (firmware !== this.latest_firmware) {
        // //   throw '6403';
        // // }
        // this.current_firmware = this.latest_firmware;
        // this.fake_progress.setProgress(0.9);
        // this.updatePercent();
        // await this.uploadFirmwareToServer();
        // this.fake_progress.setProgress(0.95);
        // this.updatePercent();
        // await this.sleep(1000);
        emitter.emit('ha:device:firmware:upgrade', { guid: this.guid });
        this.updateStatusFun('Success');
        //if success, will reset the wifi info
        if(this.model && (this.model.includes('RCU Scene Button') || this.model.includes('RF Sensor'))){
          await this.iotResetWifi();
        }
        this.$emit('update-status',true);
      } catch (err) {
        if (typeof err === 'string') {
          this.fail_msg = erp.get_log_description(err);
        } else {
          try {
            this.fail_msg = JSON.stringify(err);
          } catch (e) {
            fail_msg = `${err}`;
          }
        }

        // device maybe restart
        console.error('upgrade fail', err);

        this.updateStatusFun('Fail');
        this.$emit('update-status',false);
      }
    },
    iotResetWifi(){
      return new Promise(async(resolve,reject)=>{
        app.dialog.confirm(_('Are you sure you want to reset the wifi info?'),async()=>{
          app.dialog.preloader(_('Resetting Wi-Fi...'));
          let bleList = [];
          let ssid_data = '932000';
          let password_data = '932100';
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: ssid_data,
          });
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: password_data,
          });
          bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: '810e',
          });
          try{
            await window.peripheral[this.guid].write(bleList);
            app.dialog.close();
            resolve();
          }catch(error){
            app.dialog.close();
            reject(error);
          }
        },()=>{
          resolve();
        });
      })
    },
    async retryConnect(uuid) {
      return new Promise(async (resolve, reject) => {
        let isStop = false;
        let count = 0;

        // timeout connect
        setTimeout(() => {
          isStop = true;

          reject('7001');
        }, 20000);

        while (true) {
          if (isStop) {
            break;
          }

          try {
            await this.promisifyDisconnect(uuid);
          } catch (err) {
            // ignore
          }
          await sleep(1000);

          console.log('retry connect');

          try {
            await this.promisifyConnect(uuid);
            count++;

            if (count > 1) {
              isStop = true;
            }
          } catch (err) {
            // ignore
          }
        }

        resolve();
      });
    },
    async receiveUpgradingPercentNotify(uuid) {
      let isHandling = false;
      let timeoutId = null;

      return new Promise((resolve, reject) => {
        const subProgress = this.fake_progress.createSubProgress({ timeConstant: 5000, end: 0.8, autoStart: false });
        const startFailTimeout = () => {
          clearTimeout(timeoutId);

          timeoutId = setTimeout(() => {
            reject('6401'); // download timeout
          }, 1000 * 30);
        };

        ble.startNotification(
          uuid,
          'ff80',
          'ff82',
          (rs) => {
            console.log('receiveUpgradingPercentNotify: ' + rs);
            // 933000 v10 firmware
            // 932200 v3 firmware
            if (rs.startsWith('933000') || rs.startsWith('932200')) {
              isHandling = true;

              const command = parseInt(rs.substring(rs.length - 2, rs.length), 16);
              console.log('upgrading: ' + rs + ', percent: ' + command);
              clearTimeout(timeoutId);

              if (command > 100) {
                console.log('status: ' + command);
                reject('6402'); // Abnormal progress INTERRUPTION
              } else {
                subProgress.setProgress(command / 100);
                this.updatePercent();
                if (command === 100) {
                  resolve();
                } else {
                  startFailTimeout();
                }
              }
            }
          },
          (error) => {
            clearTimeout(timeoutId);
            reject('6001');
          }
        );

        startFailTimeout();
      });
    },
    checkGatewayValue(){
      return new Promise(async(resolve,reject)=>{
        if(!this.gateway){
          //get gateway from device
          let mac = core_utils_get_mac_address_from_guid(this.guid);
          let gateway = mac + '-' + users[users.current].usr.toLowerCase();
          this.gateway = gateway;
          resolve();
        }else{
          resolve();
        }
      })
    },
    async init() {
      console.log('init', this.guid);
      const hexid = this.guid.substring(this.guid.length - 6, this.guid.length - 2);
      const device_model = erp.doctype.device_model[hexid.toUpperCase()];
      this.device_model_name = device_model.name;
      await this.checkGatewayValue();
      console.log('gateway: ', this.gateway);
      await this.getFirmwareInfomation();
      try {
        if (this.isLogged) {
          this.isDeveloper = erp.info.user.roles.some((e) => e.role.includes('Developer'));
        }
      } catch (error) {
        console.error(error);
      }
      const uuid = this.getUUID();
      try {
        // await this.promisifyConnect(uuid);
        await window.peripheral[this.guid].connect();
        this.current_firmware = await this.readFirmware(uuid);
        this.checkingFirmware = true;
        //debugger
      } catch (err) {
        console.log(err);
        if (erp.info.device[this.guid]) {
          this.current_firmware = erp.info.device[this.guid].firmware;
        }
      }
      if (this.current_firmware === this.latest_firmware || !this.latest_firmware) {
        this.isLatest = true;
      } else {
        this.isLatest = false;
      }
    },
    async getFirmwareInfomation() {
      try {
        this.isIniting.value = true;
        const firmwareResponse = await http2.request({
          url: encodeURI(`/api/method/appv6.getFirmware`),
          method: 'GET',
          responseType: 'json',
          serializer: 'json',
          params: {
            model: this.device_model_name,
          },
        });
        if (firmwareResponse.data.firmware) {
          const firmware = firmwareResponse.data.firmware;
          this.latest_full_firmware = firmware.name;
          this.latest_firmware = this.extractVersion(firmware.name);
          this.downloadLink = firmware.download_link;

          const translated = _tran(firmware.description);
          let value = '';
          translated.split('\n').forEach((e) => {
            value += `<p>${e}</p>`;
          });

          this.firmwareDescRef.value = value;
        } else {
          this.latest_firmware = '';
          this.latest_full_firmware = '';
        }
        this.isIniting.value = false;
      } catch (error) {
        this.isIniting.value = false;
      }
    },
  },
  mounted() {
    this.fake_progress = core_utils_fake_progress({
      timeConstant: 8000 + (Math.floor(Math.random() * (3000 - 0 + 1)) + 0),
      autoStart: false,
    });
    //this is the error string, the model == mode
    console.log('model: ', this.model);
    this.init();
  },
};
