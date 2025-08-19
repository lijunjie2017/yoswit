window.device_firmware_upgrade_vm = null;

// 设备固件升级工具类
class FirmwareUpgradeUtils {
  constructor(component) {
    this.component = component;
    this.preloaderActive = false;
    this.timers = new Set();
    this.eventListeners = new Map();
  }

  // BLE操作工具
  createBLEOperation(operation) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject('BLE operation timeout');
      }, 6000);

      this.timers.add(timeoutId);

      const cleanup = () => {
        clearTimeout(timeoutId);
        this.timers.delete(timeoutId);
      };

      operation(
        (...args) => {
          cleanup();
          resolve(...args);
        },
        (error) => {
          cleanup();
          reject(error);
        }
      );
    });
  }

  promisifyWrite(device_id, service_uuid, characteristic_uuid, data) {
    return this.createBLEOperation((resolve, reject) => {
      ble.write(device_id, service_uuid, characteristic_uuid, data.convertToBytes(), resolve, (error) => {
        if (data === '810e') {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  promisifyWriteWithoutResponse(device_id, service_uuid, characteristic_uuid, data) {
    return this.createBLEOperation((resolve, reject) => {
      ble.writeWithoutResponse(device_id, service_uuid, characteristic_uuid, data.convertToBytes(), resolve, reject);
    });
  }

  promisifyConnect(device_id) {
    return this.createBLEOperation((resolve, reject) => {
      let isConnect = false;
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
    });
  }

  promisifyDisconnect(device_id) {
    return this.createBLEOperation((resolve, reject) => {
      ble.disconnect(device_id, resolve, reject);
    });
  }

  promisifyRead(device_id, service_uuid, characteristic_uuid) {
    return this.createBLEOperation((resolve, reject) => {
      ble.read(device_id, service_uuid, characteristic_uuid, resolve, reject);
    });
  }

  // Dialog管理
  showPreloader(message) {
    if (!this.preloaderActive) {
      this.preloaderActive = true;
      app.dialog.preloader(message);
    }
  }

  hidePreloader() {
    if (this.preloaderActive) {
      this.preloaderActive = false;
      app.dialog.close();
    }
  }

  // 事件监听器管理
  addEventListener(event, handler, context = this.component) {
    if (this.eventListeners.has(event)) {
      emitter.off(event, this.eventListeners.get(event));
    }

    const boundHandler = handler.bind(context);
    this.eventListeners.set(event, boundHandler);
    emitter.on(event, boundHandler);
  }

  removeEventListener(event) {
    if (this.eventListeners.has(event)) {
      emitter.off(event, this.eventListeners.get(event));
      this.eventListeners.delete(event);
    }
  }

  removeAllEventListeners() {
    for (const [event, handler] of this.eventListeners) {
      emitter.off(event, handler);
    }
    this.eventListeners.clear();
  }

  // 创建唯一的监听器标识，防止重复监听
  createUniqueHandler(event, originalHandler) {
    const handlerKey = `${event}_${this.component.guid}_${Date.now()}`;
    const uniqueHandler = (...args) => {
      // 检查事件是否与当前组件相关
      if (args[0] && args[0].guid && args[0].guid !== this.component.guid) {
        return; // 忽略不相关的事件
      }
      return originalHandler.call(this.component, ...args);
    };
    return uniqueHandler;
  }

  // 进度管理
  updateProgress(progress) {
    this.component.fake_progress.setProgress(progress);
    this.component.updatePercent();
  }

  // 数据转换工具
  arrayBufferToHex(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    return Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  hexToBuffer(hexString) {
    const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
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

  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  extractVersion(version) {
    // 先提取版本号中的数字和点部分
    const v = version.match(/[0-9.]+/)[0];

    // 移除末尾可能的多余点号
    const cleanV = v.replace(/\.+$/, '');

    // 检查是否已经是标准的三段式版本号 (x.y.z)
    const threePartMatch = cleanV.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (threePartMatch) {
      // 已经是三段式，直接返回标准化的格式
      return threePartMatch
        .slice(1)
        .map((num) => parseInt(num))
        .join('.');
    }

    // 检查是否是两段式需要转换的版本号 (x.yyy -> x.y.yy)
    const twoPartMatch = cleanV.match(/^(\d+)\.(\d)(\d+)$/);
    if (twoPartMatch) {
      // 转换为三段式
      return `${twoPartMatch[1]}.${twoPartMatch[2]}.${twoPartMatch[3]}`;
    }

    // 检查其他可能的格式 (x.yy -> x.y.y 或 x.y -> x.y.0)
    const parts = cleanV.split('.');
    if (parts.length === 2) {
      const [major, minor] = parts;
      if (minor.length >= 2) {
        // x.yy -> x.y.y (如 13.52 -> 13.5.2)
        return `${major}.${minor[0]}.${minor.slice(1)}`;
      } else {
        // x.y -> x.y.0 (如 13.5 -> 13.5.0)
        return `${major}.${minor}.0`;
      }
    }

    // 如果都不匹配，返回原始清理后的版本号
    try {
      return cleanV
        .split('.')
        .map((e) => parseInt(e))
        .join('.');
    } catch (err) {
      return cleanV;
    }
  }

  // 睡眠工具
  sleep(time = 1000) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.timers.delete(timeoutId);
        resolve();
      }, time);
      this.timers.add(timeoutId);
    });
  }

  // 错误处理
  handleError(error, defaultMessage = 'Unknown error') {
    this.hidePreloader();

    // 清理监听器以防止内存泄漏
    this.removeAllEventListeners();

    // 清理全局监听器
    if (erp.script.startWifiNotification) {
      emitter.off('ota/start', erp.script.startWifiNotification);
    }
    if (erp.script.getWifiInfoByBle) {
      emitter.off('iot/wifi/info', erp.script.getWifiInfoByBle);
    }

    this.component.updateStatusFun('Fail');

    let errorMessage;
    if (typeof error === 'string') {
      errorMessage = erp.get_log_description(error);
    } else {
      try {
        errorMessage = JSON.stringify(erp.get_log_description(error));
      } catch (e) {
        errorMessage = `${erp.get_log_description(error)}`;
      }
    }

    this.component.fail_msg = errorMessage || defaultMessage;
    this.component.uploadLogStatus = false;
    this.component.$emit('update-status', false);
  }

  // 清理方法
  cleanup() {
    for (const timerId of this.timers) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }

  // WiFi配置生成器
  generateWifiConfig(ssid, password, gateway) {
    const bleList = [];

    // SSID配置
    const ssidData = '932000' + ssid.length.toString(16).pad('0000') + ssid.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: ssidData,
    });

    // 密码配置
    const passwordData = '932100' + password.length.toString(16).pad('0000') + password.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: passwordData,
    });

    // 邮箱配置
    const email = gateway.split('-')[1];
    const emailData = '932200' + email.length.toString(16).pad('0000') + email.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: emailData,
    });

    // 端口配置
    const port = erp.settings[erp.appId].mqtt_port;
    const portData = '9301000002' + (port * 1).toString(16).pad('0000');
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: portData,
    });

    // 服务器URL配置
    const serverUrl = (erp.settings[erp.appId].mqtt_scheme || 'mqtt') + '://' + erp.settings[erp.appId].mqtt_server;
    const serverData = '930000' + serverUrl.length.toString(16).pad('0000') + serverUrl.convertToHex();
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: serverData,
    });

    // 重启设备
    bleList.push({
      service: 'ff80',
      characteristic: 'ff81',
      data: '810e',
    });

    return bleList;
  }

  // 重试连接工具
  async retryConnect(uuid, maxRetries = 3, isShow = false) {
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // 断开现有连接
        try {
          await window.peripheral[this.component.guid].disconnect();
        } catch (err) {
          // 忽略断开连接错误
        }

        await this.sleep(5000);

        if (isShow) {
          this.component.uploadLog = _(`Connection count is ${retryCount + 1}.`);
        }

        // 尝试连接
        await window.peripheral[this.component.guid].connect();
        return; // 连接成功，退出
      } catch (err) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw '7001'; // 连接失败
        }
      }
    }
  }

  // 检测并修复错误的版本号格式
  detectAndFixCorruptedVersion(version) {
    if (!version || typeof version !== 'string') {
      return version;
    }

    // 检测是否是被错误处理的版本号 (如 13.5.2.1)
    const corruptedPattern = /^(\d+)\.(\d+)\.(\d)\.(\d+)$/;
    const match = version.match(corruptedPattern);

    if (match) {
      // 这可能是 13.5.21 被错误处理成了 13.5.2.1
      // 尝试修复：将 13.5.2.1 还原为 13.5.21
      const [, major, minor, patch1, patch2] = match;
      const fixedVersion = `${major}.${minor}.${patch1}${patch2}`;

      console.log(`自动修复版本号: ${version} -> ${fixedVersion}`);
      return fixedVersion;
    }

    // 如果不是损坏的格式，直接返回
    return version;
  }
}

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
          <div v-if="uploadLogStatus" class="text-align-center text-color-primary mt-4" style="font-size: 14px">{{uploadLog}}</div>
          <div style="height: 20px"></div>
        </div>
      </div>
      <div style="height: 50px"></div>
      <h3 style="font-weight: bold; padding: 20px; font-size: 16px" v-if="updateStatus == 'Normal' && firmwareDescRef.value && !isLatest && checkingFirmware">${_('Update Logs')}</h3>
      <p class="text-muted" style="padding: 0 20px; font-size: 12px" v-if="updateStatus == 'Normal' && firmwareDescRef.value && !isLatest && checkingFirmware" v-html="firmwareDescRef.value"></p>
      <div class="row mt-4" style="position: fixed; bottom: calc(10px + var(--f7-safe-area-top))" v-if="isDeveloper || show">
        <div class="col-100">
          <a href="#" class="upgrade-action button button-fill color-theme button-raised" @click="startUpdateFirmware()">
            <span class="size-16">{{ _('Update Now') }}</span> 
          </a>
        </div>
      </div>
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
    show: {
      type: Boolean,
      default: false,
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
      downloadLink: '',
      wifiConnectStatus: false,
      uploadLog: '',
      uploadLogStatus: false,
      utils: null, // 工具类实例
    };
  },
  methods: {
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
      try {
        await window.peripheral[this.guid].connect();
        const mac = await this.utils.promisifyRead(uuid, '180a', '2a26');
        console.log('mac', mac);
        return this.utils.extractVersion(mac.convertToAscii());
      } catch (error) {
        this.utils.handleError(error, 'Firmware check failed');
        this.checkingFirmware = false;
        return '';
      }
    },
    destroy() {
      if (this.utils) {
        this.utils.cleanup();
      }
    },
    async uploadFirmwareToServer() {
      try {
        await http.request(encodeURI('/api/resource/Device/' + this.guid), {
          method: 'PUT',
          responseType: 'json',
          serializer: 'json',
          debug: true,
          data: {
            firmware: this.latest_full_firmware,
          },
        });
        // 升级成功后，应该使用latest_firmware的原始值，而不是经过extractVersion处理的
        peripheral[this.guid].getProp().firmware = this.latest_firmware;
      } catch (err) {
        // ignore
      }
    },
    async startUpdateFirmware() {
      try {
        this.utils.showPreloader(_('Checking Wi-Fi...'));

        if (!this.wifiConnectStatus) {
          this.wifiConnectStatus = await this.checkWifiStatus();
        }

        this.utils.hidePreloader();

        if (!this.latest_firmware) {
          this.updateStatusFun('Fail');
          this.fail_msg = 'No firmware available for upgrade';
          this.$emit('update-status', false);
          return;
        }
        if (this.isLatest && !this.show) {
          this.updateStatusFun('Success');
          this.fail_msg = 'Device firmware is already up to date';
          this.$emit('update-status', true);
          return;
        }
        if (!this.checkingFirmware) {
          app.dialog.alert(_('Please wait for the firmware check to complete.'));
          return;
        }
        this.percent = 0;
        if (this.latest_full_firmware.endsWith('N')) {
          // this.updateNordicFirmware();
        } else if (this.latest_full_firmware.endsWith('E')) {
          //check wifi connect status
          if (!this.wifiConnectStatus) {
            let wifiInfo = null;
            try {
              wifiInfo = await this.connectAndCheckWifi();
            } catch (error) {
              this.updateStatusFun('Fail');
              this.fail_msg = `WiFi configuration failed: ${error.message || error}`;
              this.$emit('update-status', false);
              return;
            }
            if (wifiInfo) {
              try {
                await this.connectWifi(wifiInfo.username, wifiInfo.password);
                await this.updateWifiFirmware();
              } catch (error) {
                this.updateStatusFun('Fail');
                this.fail_msg = `WiFi status check failed: ${error.message || error}`;
                this.$emit('update-status', false);
                return;
              }
            } else {
              this.updateStatusFun('Fail');
              this.fail_msg = 'Unable to obtain WiFi credentials from user';
              this.$emit('update-status', false);
            }
          } else {
            await this.updateWifiFirmware();
          }
        }
      } catch (error) {
        this.utils.handleError(error, 'Wi-Fi check failed');
        return;
      }
    },
    checkWifiStatus() {
      return new Promise((resolve, reject) => {
        let timeoutId = null;
        let isOnline = false;
        const handleWillMessage = (data) => {
          try {
            const rs = data.rs;
            const jsonData = JSON.parse(this.utils.hexToPlainText(rs.substring(10)));
            if (jsonData.ipv4) {
              isOnline = true;
              completeCheck(true);
            } else {
              completeCheck(false);
            }
          } catch (e) {
            completeCheck(false);
          }
        };
        const cleanup = () => {
          clearTimeout(timeoutId);
          emitter.off('iot/wifi/info', handleWillMessage);
        };
        const completeCheck = (result) => {
          cleanup();
          resolve(result);
        };
        emitter.off('iot/wifi/info', handleWillMessage);
        emitter.on('iot/wifi/info', handleWillMessage);
        const delayedWriteTimer = setTimeout(async () => {
          this.utils.timers.delete(delayedWriteTimer);
          try {
            await window.peripheral[this.guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: '9329',
              },
            ]);
          } catch (error) {
            completeCheck(isOnline);
          }
        }, 500);
        this.utils.timers.add(delayedWriteTimer);
        // core_mqtt_subscribe(will_topic, 1, false);
        // emitter.on(will_topic, handleWillMessage);
        timeoutId = setTimeout(() => {
          completeCheck(isOnline);
        }, 1000 * 6);
        this.utils.timers.add(timeoutId);
      });
    },

    connectWifi(ssid, password) {
      return new Promise(async (resolve, reject) => {
        this.utils.showPreloader(_('Connect Wi-Fi, it will take about 2-3 minutes.'));
        let wifiConnectTimmer = setTimeout(
          () => {
            this.utils.timers.delete(wifiConnectTimmer);
            this.utils.hidePreloader();
            reject('Sorry, Wi-Fi is not connected yet.');
          },
          1000 * 60 * 2
        );
        this.utils.timers.add(wifiConnectTimmer);
        if (ssid === '' || password === '') {
          clearTimeout(wifiConnectTimmer);
          this.utils.timers.delete(wifiConnectTimmer);
          this.utils.hidePreloader();
          reject('Please fill in the SSID and Password.');
          return;
        } else {
          let bleList = [];
          const saveSsid = () => {
            const data = '932000' + ssid.length.toString(16).pad('0000') + ssid.convertToHex();
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: data,
            });
          };
          const saveSsidPassword = () => {
            const data = '932100' + password.length.toString(16).pad('0000') + password.convertToHex();
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: data,
            });
          };
          const saveEmail = () => {
            let list = this.gateway.split('-');
            if (list.length < 2) {
              throw new Error('Invalid gateway format: ' + this.gateway);
            }
            let email = list[1];
            console.log('email', email);
            const data = '932200' + email.length.toString(16).pad('0000') + email.convertToHex();

            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: data,
            });
          };
          const savePort = () => {
            let port = erp.settings[erp.appId].mqtt_port;

            // if(parseFloat(this.current_firmware)  < 13.5){
            //   port = 32792;
            // }
            console.log('port', port);
            const data = '9301000002' + (port * 1).toString(16).pad('0000');
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: data,
            });
          };
          const saveServerUrl = () => {
            let server_url =
              (erp.settings[erp.appId].mqtt_scheme ? erp.settings[erp.appId].mqtt_scheme : 'mqtt') +
              '://' +
              erp.settings[erp.appId].mqtt_server;

            // if(parseFloat(this.current_firmware)  < 13.5){
            //   server_url = 'mqtt://themira.mob-mob.com';
            // }
            console.log('server_url', server_url);
            const data = '930000' + server_url.length.toString(16).pad('0000') + server_url.convertToHex();
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: data,
            });
          };
          const restartDevice = () => {
            bleList.push({
              service: 'ff80',
              characteristic: 'ff81',
              data: '810e',
            });
          };

          const checkIfOnline = () => {
            //check the wifi status by ble with retry logic
            let retryTimeoutId = null;
            let isCompleted = false;
            let retryCount = 0;
            const maxRetries = Math.floor(60 / 5); // 1分钟内每5秒重试一次，最多12次

            // 创建唯一的WiFi状态监听器，避免与其他组件实例冲突
            const wifiStatusHandler = (data) => {
              if (isCompleted) return; // 已经完成，忽略后续消息

              try {
                let rs = data.rs;
                let jsonData = JSON.parse(this.utils.hexToPlainText(rs.substring(10, rs.length)));

                if (isset(jsonData.ipv4)) {
                  console.log(`WiFi connection successful on attempt ${retryCount}: IP address found (${jsonData.ipv4})`);
                  completeSuccess();
                } else {
                  console.log(`WiFi connection attempt ${retryCount}: No IP address found, will retry in 5 seconds`);
                  // 不立即判断失败，等待下次重试
                }
              } catch (e) {
                console.log(`WiFi connection attempt ${retryCount}: Parse error`, e);
                // 检查catch到的错误是否是7200
                if (e === 7200 || e === '7200' || (e && e.toString && e.toString().includes('7200'))) {
                  console.log(`WiFi connection failed: Password error (7200) caught in exception`);
                  completeError('Sorry, Wi-Fi password is incorrect (7200).');
                  return;
                }
                // 其他错误不立即判断失败，等待下次重试
              }
            };

            const cleanup = () => {
              if (retryTimeoutId) {
                clearTimeout(retryTimeoutId);
                this.utils.timers.delete(retryTimeoutId);
              }
              emitter.off('iot/wifi/info', wifiStatusHandler);
            };

            const completeSuccess = () => {
              if (isCompleted) return;
              isCompleted = true;
              cleanup();
              clearTimeout(wifiConnectTimmer);
              this.utils.timers.delete(wifiConnectTimmer);
              this.utils.hidePreloader();
              resolve(true);
            };

            const completeError = (message) => {
              if (isCompleted) return;
              isCompleted = true;
              cleanup();
              clearTimeout(wifiConnectTimmer);
              this.utils.timers.delete(wifiConnectTimmer);
              this.utils.hidePreloader();
              reject(message);
            };

            const sendWifiStatusQuery = async () => {
              retryCount++;
              console.log(`WiFi status check attempt ${retryCount}/${maxRetries}`);

              try {
                await window.peripheral[this.guid].write([
                  {
                    service: 'ff80',
                    characteristic: 'ff81',
                    data: '9329',
                  },
                ]);

                // 如果还没达到最大重试次数，安排下次重试
                if (retryCount < maxRetries && !isCompleted) {
                  retryTimeoutId = setTimeout(() => {
                    this.utils.timers.delete(retryTimeoutId);
                    sendWifiStatusQuery(); // 递归重试
                  }, 5000);
                } else if (retryCount >= maxRetries && !isCompleted) {
                  // 达到最大重试次数，等待一小段时间后结束
                  setTimeout(() => {
                    if (!isCompleted) {
                      console.log('WiFi connection failed: Maximum retry attempts reached');
                      completeError('Sorry, Wi-Fi is not connected yet.');
                    }
                  }, 2000); // 等待2秒接收最后的响应
                }
              } catch (error) {
                console.log(`WiFi status query failed on attempt ${retryCount}:`, error);

                // 检查发送命令时的错误是否是7200
                if (error === 7200 || error === '7200' || (error && error.toString && error.toString().includes('7200'))) {
                  console.log(`WiFi connection failed: Password error (7200) in command send`);
                  completeError('Sorry, Wi-Fi password is incorrect (7200).');
                  return;
                }

                // 即使发送失败也继续重试
                if (retryCount < maxRetries && !isCompleted) {
                  retryTimeoutId = setTimeout(() => {
                    this.utils.timers.delete(retryTimeoutId);
                    sendWifiStatusQuery(); // 递归重试
                  }, 5000);
                  this.utils.timers.add(retryTimeoutId);
                } else if (!isCompleted) {
                  console.log('WiFi connection failed: Unable to send query commands');
                  completeError('Sorry, Wi-Fi connection failed due to communication error.');
                }
              }
            };

            // 清理可能存在的旧监听器
            if (erp.script.getWifiInfoByBle) {
              emitter.off('iot/wifi/info', erp.script.getWifiInfoByBle);
            }

            // 设置监听器
            emitter.off('iot/wifi/info', wifiStatusHandler);
            emitter.on('iot/wifi/info', wifiStatusHandler);

            // 500ms后开始第一次检查
            setTimeout(() => {
              sendWifiStatusQuery();
            }, 500);
          };
          try {
            saveSsid();
            saveSsidPassword();
            saveEmail();
            savePort();
            saveServerUrl();
            restartDevice();
            console.log('bleList', bleList);
            await window.peripheral[this.guid].write(bleList);
            await this.utils.sleep(20 * 1000);
            await window.peripheral[this.guid].connect();
            checkIfOnline();
          } catch (error) {
            clearTimeout(wifiConnectTimmer);
            this.utils.timers.delete(wifiConnectTimmer);
            this.utils.hidePreloader();
            reject(error);
          }
        }
      });
    },
    showPromptDialog(title) {
      return new Promise(async (resolve, reject) => {
        app.dialog.login(
          _(title),
          (username, password) => {
            resolve({
              username: username,
              password: password,
            });
          },
          () => {
            resolve(false);
          }
        );
        //change the dialog to the wifi dialog
        const dialogSetupTimer = setTimeout(() => {
          this.utils.timers.delete(dialogSetupTimer);
          $('.dialog-input-field input[name="dialog-username"]').attr('placeholder', 'Ssid');
          $('.dialog-input-field input[name="dialog-password"]').attr('type', 'text');
          $('.dialog-input-field input[name="dialog-password"]').attr('placeholder', 'Password');
          if (erp.wifiInfo) {
            $('.dialog-input-field input[name="dialog-username"]').val(erp.wifiInfo.ssid);
            $('.dialog-input-field input[name="dialog-password"]').val(erp.wifiInfo.password);
          }
          // $('.dialog-input-field input[name="dialog-username"]').val(wifiInfoMap.ssid);
          // $('.dialog-input-field input[name="dialog-password"]').val(wifiInfoMap.password);
        }, 200);
        this.utils.timers.add(dialogSetupTimer);
      });
    },
    showUpdateConfirm(title) {
      return new Promise(async (resolve, reject) => {
        app.dialog.confirm(
          _(title),
          () => {
            resolve(true);
          },
          () => {
            resolve(false);
          }
        );
      });
    },
    connectAndCheckWifi() {
      return new Promise(async (resolve, reject) => {
        let retryCount = 0;
        const maxRetries = 5; // 最多重试5次防止无限循环

        while (retryCount < maxRetries) {
          retryCount++;
          let wifiInfo = await this.showPromptDialog(_('Please enter the wifi information'));

          if (wifiInfo) {
            let ssid = wifiInfo.username;
            let password = wifiInfo.password;
            erp.wifiInfo = {
              ssid: ssid,
              password: password,
            };
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

        // 超过最大重试次数
        reject('Maximum retry attempts exceeded');
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
          if (timeoutId) {
            clearTimeout(timeoutId);
            this.utils.timers.delete(timeoutId);
          }
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
            const currentVersion = data.Info.version.toLowerCase();
            const targetVersion = expectedVersion.toLowerCase();

            if (currentVersion === targetVersion) {
              versionMatched = true;
              completeCheck(true);
              return;
            }

            // 达到最大检查次数但版本不匹配
            if (count >= 3) {
              console.log(`Version mismatch after ${count} attempts: ${currentVersion} !== ${targetVersion}`);
              completeCheck(false);
              return;
            }
          } catch (e) {
            console.log('Error parsing status message:', e);
            if (count >= 3) {
              completeCheck(false);
            }
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
          this.utils.timers.delete(timeoutId);
          completeCheck(isOnline && versionMatched);
        }, 60000 * 3);
        this.utils.timers.add(timeoutId);
        // 双重检测机制
        const doubleCheckTimer = setTimeout(() => {
          this.utils.timers.delete(doubleCheckTimer);
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
        this.utils.timers.add(doubleCheckTimer);
      });
    },
    //Wifi Action
    async updateWifiFirmware() {
      try {
        const uuid = this.getUUID();
        this.updateStatusFun('Upgrading');
        const version = parseInt(this.current_firmware.split('.')[0]);
        let full_firmware_name = this.latest_full_firmware;

        // 设备型号特殊处理规则
        const deviceSpecialRules = {
          'YO105': { minVersion: 10, suffix: 'D' },
          'YO161': { minVersion: 10, suffix: 'D' },
        };

        const rule = deviceSpecialRules[this.device_model_name];
        if (rule && version < rule.minVersion) {
          full_firmware_name = full_firmware_name + rule.suffix;
        }

        full_firmware_name = full_firmware_name + '.bin';
        // send command
        const command = '93300000' + full_firmware_name.length.toString(16).pad('00') + full_firmware_name.convertToHex();
        console.log('Upgrade Firmware: ' + full_firmware_name);
        console.log('Upgrade Command: ' + command);
        this.uploadLogStatus = true;
        this.uploadLog = _('Attempt to connect before updating.');
        try {
          await window.peripheral[this.guid].write([
            {
              service: 'ff80',
              characteristic: 'ff81',
              data: command,
            },
          ]);
          this.utils.hidePreloader();
        } catch (error) {
          this.utils.hidePreloader();
          this.uploadLogStatus = false;
          throw error;
        }
        this.fake_progress.setProgress(0.15);
        this.updatePercent();
        this.uploadLog = _('First connection after upgrade and restart, it will take 10s.');
        await this.utils.sleep(1000 * 10);
        try {
          await this.utils.retryConnect(uuid, 3, true);
        } catch (error) {
          console.error('connect error', error);
          //ignore this ble connect error, because wil connect and then disconnect
        }
        this.fake_progress.setProgress(0.25);
        this.updatePercent();
        this.uploadLog = _('Attempt to connect and receive update progress.');
        try {
          await window.peripheral[this.guid].connect();
        } catch (connect_error) {
          console.error('connect error', connect_error);
          //ignore this ble connect error, because wil connect and then disconnect
        }
        this.fake_progress.setProgress(0.3);
        this.updatePercent();
        await this.receiveUpgradingPercentNotify(uuid);
        await this.utils.sleep(5000);
        this.fake_progress.setProgress(0.85);
        this.updatePercent();
        this.uploadLog = _('Second connection after upgrade and restart.');
        try {
          await this.utils.retryConnect(uuid, 3, false);
        } catch (connect_error) {
          console.error('connect error', connect_error);
          //ignore this ble connect error, because wil connect and then disconnect
        }
        // 固件升级成功后，直接更新当前版本为最新版本
        this.current_firmware = this.latest_firmware;
        this.isLatest = true; // 标记为最新版本
        console.log(`固件升级成功，当前版本已更新为: ${this.current_firmware}`);
        this.fake_progress.setProgress(0.9);
        this.updatePercent();
        await this.uploadFirmwareToServer();
        this.fake_progress.setProgress(0.95);
        this.updatePercent();
        await this.utils.sleep(15000);
        emitter.emit('ha:device:firmware:upgrade', { guid: this.guid });
        this.updateStatusFun('Success');
        this.uploadLogStatus = false;
        //if success, will reset the wifi info
        if (this.model && (this.model.includes('RCU Scene Button') || this.model.includes('RF Sensor'))) {
          await this.iotResetWifi();
        }
        this.$emit('update-status', true);
      } catch (err) {
        // 确保关闭任何可能存在的preloader
        this.utils.hidePreloader();

        if (typeof err === 'string') {
          this.fail_msg = erp.get_log_description(err);
        } else {
          try {
            this.fail_msg = JSON.stringify(erp.get_log_description(err));
          } catch (e) {
            this.fail_msg = `${erp.get_log_description(err)}`;
          }
        }
        // device maybe restart
        console.error('upgrade fail', err);
        this.uploadLogStatus = false;
        this.updateStatusFun('Fail');
        this.$emit('update-status', false);
      }
    },
    iotResetWifi() {
      return new Promise(async (resolve, reject) => {
        this.utils.showPreloader(_('Resetting Wi-Fi...'));
        let bleList = [];
        let ssid_data = '9320000000';
        let password_data = '9321000000';
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
        try {
          await window.peripheral[this.guid].write(bleList);
          this.utils.hidePreloader();
          resolve();
        } catch (error) {
          this.utils.hidePreloader();
          reject(error);
        }
      });
    },

    async receiveUpgradingPercentNotify(uuid) {
      let isHandling = false;
      let timeoutId = null;

      return new Promise((resolve, reject) => {
        const subProgress = this.fake_progress.createSubProgress({ timeConstant: 5000, end: 0.8, autoStart: false });
        const startFailTimeout = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            this.utils.timers.delete(timeoutId);
          }

          timeoutId = setTimeout(() => {
            this.utils.timers.delete(timeoutId);
            emitter.off('ota/start', otaProgressHandler);
            reject('6401'); // download timeout
          }, 1000 * 30);
          this.utils.timers.add(timeoutId);
        };

        // 创建唯一的监听器，避免与其他组件实例冲突
        const otaProgressHandler = (data) => {
          let rs = data.rs;
          if (isset(data.guid) && data.guid == this.guid) {
            isHandling = true;
            const command = parseInt(rs.substring(rs.length - 2, rs.length), 16);
            console.log('upgrading: ' + rs + ', percent: ' + command);
            if (timeoutId) {
              clearTimeout(timeoutId);
              this.utils.timers.delete(timeoutId);
            }
            if (command > 100) {
              console.log('status: ' + command);
              emitter.off('ota/start', otaProgressHandler);
              reject('6402'); // Abnormal progress INTERRUPTION
            } else {
              // this.updateStatusFun(_('Receive update progress.'));
              subProgress.setProgress(command / 100);
              this.updatePercent();
              if (command === 100) {
                emitter.off('ota/start', otaProgressHandler);
                resolve();
              } else {
                startFailTimeout();
              }
            }
          }
        };

        // 清理可能存在的旧监听器
        if (erp.script.startWifiNotification) {
          emitter.off('ota/start', erp.script.startWifiNotification);
        }

        emitter.on('ota/start', otaProgressHandler);

        // 保存引用以便清理
        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            this.utils.timers.delete(timeoutId);
          }
          emitter.off('ota/start', otaProgressHandler);
        };

        // 在Promise结束时清理监听器
        const originalResolve = resolve;
        const originalReject = reject;

        resolve = (...args) => {
          cleanup();
          originalResolve(...args);
        };

        reject = (...args) => {
          cleanup();
          originalReject(...args);
        };
        // ble.startNotification(
        //   uuid,
        //   'ff80',
        //   'ff82',
        //   (rs) => {
        //     console.log('receiveUpgradingPercentNotify: ' + rs);
        //     // 933000 v10 firmware
        //     // 932200 v3 firmware
        //     if (rs.startsWith('933000') || rs.startsWith('932200')) {
        //       isHandling = true;

        //       const command = parseInt(rs.substring(rs.length - 2, rs.length), 16);
        //       console.log('upgrading: ' + rs + ', percent: ' + command);
        //       clearTimeout(timeoutId);

        //       if (command > 100) {
        //         console.log('status: ' + command);
        //         reject('6402'); // Abnormal progress INTERRUPTION
        //       } else {
        //         subProgress.setProgress(command / 100);
        //         this.updatePercent();
        //         if (command === 100) {
        //           resolve();
        //         } else {
        //           startFailTimeout();
        //         }
        //       }
        //     }
        //   },
        //   (error) => {
        //     clearTimeout(timeoutId);
        //     reject('6001');
        //   }
        // );

        startFailTimeout();
      });
    },
    checkGatewayValue() {
      return new Promise(async (resolve, reject) => {
        try {
          if (!this.gateway) {
            //get gateway from device
            let mac = core_utils_get_mac_address_from_guid(this.guid);
            if (!mac) {
              throw new Error('Unable to extract MAC address from device GUID: ' + this.guid);
            }
            if (!users[users.current] || !users[users.current].usr) {
              throw new Error('Current user information not available');
            }
            let gateway = mac + '-' + users[users.current].usr.toLowerCase();
            this.gateway = gateway;
            console.log('Generated gateway:', gateway);
          }

          // 验证gateway格式
          if (!this.gateway.includes('-')) {
            throw new Error('Invalid gateway format (missing separator): ' + this.gateway);
          }

          resolve();
        } catch (error) {
          console.error('Gateway validation failed:', error);
          reject(error);
        }
      });
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
        // 首先获取存储的固件版本
        let storedFirmware = window.peripheral[this.guid].prop.firmware;

        // 检测并修复可能损坏的版本号
        const fixedVersion = this.utils.detectAndFixCorruptedVersion(storedFirmware);

        // 如果版本号被修复了，更新存储的值
        if (fixedVersion !== storedFirmware) {
          console.log(`修复设备${this.guid}的固件版本号: ${storedFirmware} -> ${fixedVersion}`);
          window.peripheral[this.guid].prop.firmware = fixedVersion;
          storedFirmware = fixedVersion;
        }

        // 使用修复后的版本号
        this.current_firmware = this.utils.extractVersion(storedFirmware);
        this.checkingFirmware = true;

        console.log(`设备${this.guid}当前固件版本: ${this.current_firmware}`);
      } catch (err) {
        console.log('读取固件版本失败:', err);

        // 尝试从备用数据源获取
        if (erp.info.device[this.guid] && erp.info.device[this.guid].firmware) {
          let backupFirmware = erp.info.device[this.guid].firmware;
          // 也对备用数据进行修复检测
          backupFirmware = this.utils.detectAndFixCorruptedVersion(backupFirmware);
          this.current_firmware = this.utils.extractVersion(backupFirmware);
          console.log(`使用备用固件版本: ${this.current_firmware}`);
        } else {
          console.log('无法获取设备固件版本信息');
          this.current_firmware = '0.0.0'; // 默认值
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
          this.latest_firmware = this.utils.extractVersion(firmware.name);
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
    beforeDestroy() {
      this.destroy();
    },
  },
  mounted() {
    // 初始化工具类
    this.utils = new FirmwareUpgradeUtils(this);

    this.fake_progress = core_utils_fake_progress({
      timeConstant: 8000 + (Math.floor(Math.random() * (3000 - 0 + 1)) + 0),
      autoStart: false,
    });
    //this is the error string, the model == mode
    console.log('model: ', this.model);
    this.init();
  },
};
