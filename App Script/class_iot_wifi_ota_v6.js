window.iotWifiOta = (function () {
  
  // 错误码定义 - 数字错误码系统 (从8000开始)
  const ERROR_CODES = {
    // 初始化阶段错误 (8000-8099)
    INIT_DEVICE_MODEL_NOT_FOUND: 8001,
    INIT_GATEWAY_VALIDATION_FAILED: 8002, 
    INIT_FIRMWARE_INFO_FAILED: 8003,
    INIT_CURRENT_FIRMWARE_FAILED: 8004,
    INIT_WIFI_STATUS_CHECK_FAILED: 8005,
    
    // WiFi连接阶段错误 (8100-8199)
    WIFI_PARAMS_INVALID: 8101,
    WIFI_CONNECTION_TIMEOUT: 8102,
    WIFI_CONNECTION_FAILED: 8103,
    WIFI_STATUS_CHECK_FAILED: 8104,
    WIFI_DEVICE_UNREACHABLE: 8105,
    
    // OTA升级阶段错误 (8200-8299)
    OTA_WIFI_NOT_CONNECTED: 8201,
    OTA_NO_FIRMWARE_AVAILABLE: 8202,
    OTA_COMMAND_SEND_FAILED: 8203,
    OTA_DEVICE_RECONNECT_FAILED: 8204,
    OTA_PROGRESS_STALLED: 8205,
    OTA_DOWNLOAD_TIMEOUT: 8206,
    OTA_PROGRESS_ABNORMAL: 8207,
    
    // 验证阶段错误 (8300-8399)
    VERIFY_FIRMWARE_MISMATCH: 8301,
    VERIFY_DEVICE_INFO_UNAVAILABLE: 8302,
    
    // 通用错误 (8900-8999)
    GENERAL_BLE_OPERATION_TIMEOUT: 8901,
    GENERAL_DEVICE_CONNECTION_LOST: 8902,
    GENERAL_UNKNOWN_ERROR: 8999
  };

  // 错误阶段定义
  const ERROR_STAGES = {
    INIT: 'init',
    WIFI: 'wifi', 
    OTA: 'ota',
    VERIFY: 'verify',
    GENERAL: 'general'
  };

  // 根据错误码获取错误阶段
  function getErrorStage(errorCode) {
    if (typeof errorCode === 'number') {
      if (errorCode >= 8000 && errorCode <= 8099) return ERROR_STAGES.INIT;
      if (errorCode >= 8100 && errorCode <= 8199) return ERROR_STAGES.WIFI;
      if (errorCode >= 8200 && errorCode <= 8299) return ERROR_STAGES.OTA;
      if (errorCode >= 8300 && errorCode <= 8399) return ERROR_STAGES.VERIFY;
      if (errorCode >= 8900 && errorCode <= 8999) return ERROR_STAGES.GENERAL;
    }
    // 兼容字符串错误码（向后兼容）
    if (typeof errorCode === 'string') {
      if (errorCode.startsWith('INIT_')) return ERROR_STAGES.INIT;
      if (errorCode.startsWith('WIFI_')) return ERROR_STAGES.WIFI;
      if (errorCode.startsWith('OTA_')) return ERROR_STAGES.OTA;
      if (errorCode.startsWith('VERIFY_')) return ERROR_STAGES.VERIFY;
    }
    return ERROR_STAGES.GENERAL;
  }

  // 获取错误码的描述信息
  function getErrorDescription(errorCode) {
    const descriptions = {
      // 初始化阶段错误 (8000-8099)
      [ERROR_CODES.INIT_DEVICE_MODEL_NOT_FOUND]: _('Device model not found'),
      [ERROR_CODES.INIT_GATEWAY_VALIDATION_FAILED]: _('Gateway validation failed'),
      [ERROR_CODES.INIT_FIRMWARE_INFO_FAILED]: _('Failed to get firmware information'),
      [ERROR_CODES.INIT_CURRENT_FIRMWARE_FAILED]: _('Failed to get current firmware version'),
      [ERROR_CODES.INIT_WIFI_STATUS_CHECK_FAILED]: _('WiFi status check failed'),
      
      // WiFi连接阶段错误 (8100-8199)
      [ERROR_CODES.WIFI_PARAMS_INVALID]: _('Please fill in the SSID and Password'),
      [ERROR_CODES.WIFI_CONNECTION_TIMEOUT]: _('Sorry, Wi-Fi is not connected yet'),
      [ERROR_CODES.WIFI_CONNECTION_FAILED]: _('Wi-Fi connection failed'),
      [ERROR_CODES.WIFI_STATUS_CHECK_FAILED]: _('WiFi status verification failed'),
      [ERROR_CODES.WIFI_DEVICE_UNREACHABLE]: _('Device is unreachable via WiFi'),
      
      // OTA升级阶段错误 (8200-8299)
      [ERROR_CODES.OTA_WIFI_NOT_CONNECTED]: _('Sorry, Wi-Fi is not connected yet'),
      [ERROR_CODES.OTA_NO_FIRMWARE_AVAILABLE]: _('No firmware available for upgrade'),
      [ERROR_CODES.OTA_COMMAND_SEND_FAILED]: _('Failed to send upgrade command'),
      [ERROR_CODES.OTA_DEVICE_RECONNECT_FAILED]: _('Failed to reconnect device'),
      [ERROR_CODES.OTA_PROGRESS_STALLED]: _('OTA progress stalled - device may have lost power or disconnected'),
      [ERROR_CODES.OTA_DOWNLOAD_TIMEOUT]: _('Download timeout'),
      [ERROR_CODES.OTA_PROGRESS_ABNORMAL]: _('Abnormal progress interruption'),
      
      // 验证阶段错误 (8300-8399)
      [ERROR_CODES.VERIFY_FIRMWARE_MISMATCH]: _('OTA upgrade failed'),
      [ERROR_CODES.VERIFY_DEVICE_INFO_UNAVAILABLE]: _('Device information unavailable'),
      
      // 通用错误 (8900-8999)
      [ERROR_CODES.GENERAL_BLE_OPERATION_TIMEOUT]: _('BLE operation timeout'),
      [ERROR_CODES.GENERAL_DEVICE_CONNECTION_LOST]: _('Device connection lost'),
      [ERROR_CODES.GENERAL_UNKNOWN_ERROR]: _('Unknown error occurred')
    };
    
    return descriptions[errorCode] || _('Unknown error');
  }

  // 创建标准化错误对象
  function createError(errorCode, originalMessage, userMessage) {
    const autoUserMessage = userMessage || getErrorDescription(errorCode);
    const error = new Error(autoUserMessage);
    error.code = errorCode;
    error.stage = getErrorStage(errorCode);
    error.originalMessage = originalMessage || autoUserMessage;
    error.userMessage = autoUserMessage;
    return error;
  }
  
  // 工具类，参考device_firmware_upgrade_v6.js的FirmwareUpgradeUtils
  class WifiOtaUtils {
    constructor(instance) {
      this.instance = instance;
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

    promisifyRead(device_id, service_uuid, characteristic_uuid) {
      return this.createBLEOperation(async(resolve, reject) => {
        try{``
          await window.peripheral[this.instance.prop.guid].connect();
          ble.read(device_id, service_uuid, characteristic_uuid, resolve, reject);
        }catch(err){
          reject(err);
        }
      });
    }

    // 数据转换工具
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

    // 版本号处理
    extractVersion(version) {
      const v = version.match(/[0-9.]+/)[0];
      const cleanV = v.replace(/\.+$/, '');
      
      const threePartMatch = cleanV.match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (threePartMatch) {
        return threePartMatch.slice(1).map(num => parseInt(num)).join('.');
      }
      
      const twoPartMatch = cleanV.match(/^(\d+)\.(\d)(\d+)$/);
      if (twoPartMatch) {
        return `${twoPartMatch[1]}.${twoPartMatch[2]}.${twoPartMatch[3]}`;
      }
      
      const parts = cleanV.split('.');
      if (parts.length === 2) {
        const [major, minor] = parts;
        if (minor.length >= 2) {
          return `${major}.${minor[0]}.${minor.slice(1)}`;
        } else {
          return `${major}.${minor}.0`;
        }
      }
      
      try {
        return cleanV
          .split('.')
          .map((e) => parseInt(e))
          .join('.');
      } catch (err) {
        return cleanV;
      }
    }

    // 检测并修复损坏的版本号
    detectAndFixCorruptedVersion(version) {
      if (!version || typeof version !== 'string') {
        return version;
      }
      
      const corruptedPattern = /^(\d+)\.(\d+)\.(\d)\.(\d+)$/;
      const match = version.match(corruptedPattern);
      
      if (match) {
        const [, major, minor, patch1, patch2] = match;
        const fixedVersion = `${major}.${minor}.${patch1}${patch2}`;
        console.log(`自动修复版本号: ${version} -> ${fixedVersion}`);
        return fixedVersion;
      }
      
      return version;
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

    // Dialog管理 (UI控制)
    showPreloader(message) {
      if (!this.instance.showUI) return;
      
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
      if (!this.instance.showUI) return;
      try {
        if (typeof app !== 'undefined' && app.dialog && this.instance.preloaderActive) {
          this.instance.preloaderActive = false;
          app.dialog.close();
        }
      } catch (e) {
        console.log('Preloader close error:', e);
      }
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
    async retryConnect(uuid, maxRetries = 3) {
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          // 断开现有连接
          try {
            await window.peripheral[this.instance.prop.guid].disconnect();
          } catch (err) {
            // 忽略断开连接错误
          }
          
          await this.sleep(5000);
          
          // 尝试连接
          await window.peripheral[this.instance.prop.guid].connect();
          return; // 连接成功，退出
          
        } catch (err) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw '7001'; // 连接失败
          }
        }
      }
    }

    // 清理方法
    // 关闭所有弹窗和UI元素的统一方法
    closeAllDialogs() {
      console.log('🔄 开始关闭所有UI弹窗...');
      
      // 关闭preloader
      this.hidePreloader();
      
      // 关闭Framework7 progress dialog
      this.instance.closeProgressDialog();
      
      // 强制关闭所有Framework7弹窗
      if (typeof app !== 'undefined') {
        try {
          // 关闭所有dialog
          if (app.dialog && app.dialog.close) {
            app.dialog.close();
          }
          
          // 关闭所有popup
          // if (app.popup && app.popup.close) {
          //   app.popup.close();
          // }
          
          // 关闭所有sheet
          // if (app.sheet && app.sheet.close) {
          //   app.sheet.close();
          // }
          
          // 关闭所有popover
          // if (app.popover && app.popover.close) {
          //   app.popover.close();
          // }
          
          // 关闭所有toast
          if (app.toast && app.toast.close) {
            app.toast.close();
          }
          
          // 强制隐藏preloader（Framework7内置方法）
          if (app.preloader && app.preloader.hide) {
            app.preloader.hide();
          }
          
        } catch (e) {
          console.log('⚠️ 关闭某些弹窗时出错（可忽略）:', e.message);
        }
      }
      
      console.log('✅ 所有UI弹窗已强制关闭');
    }

    cleanup() {
      for (const timerId of this.timers) {
        clearTimeout(timerId);
      }
      this.timers.clear();
      
      // 清理时也关闭所有弹窗
      this.closeAllDialogs();
    }

    // 错误处理
    handleError(error, defaultMessage = 'Unknown error') {
      this.cleanup();
      
      // 使用统一的关闭所有弹窗方法
      this.closeAllDialogs();
      
      let errorMessage;
      if (typeof error === 'string') {
        errorMessage = erp?.get_log_description ? erp.get_log_description(error) : error;
      } else {
        try {
          errorMessage = JSON.stringify(erp?.get_log_description ? erp.get_log_description(error) : error);
        } catch (e) {
          errorMessage = `${erp?.get_log_description ? erp.get_log_description(error) : error}`;
        }
      }
      
      this.instance.prop.status = 'failed';
      this.instance.lastError = errorMessage || defaultMessage;
      
      // 触发错误回调
      if (this.instance.onError) {
        this.instance.onError(this.instance.lastError);
      }
    }
  }

  function iotWifiOta(wifiObject = {}) {
    this.prop = {
      id: '',
      service: '',
      characteristic: '',
      currentFirmware: '',
      latestFirmware: '',
      latestFullFirmware: '',
      updateTime: '',
      ssid: '',
      password: '',
      progress: 0,
      status: '',
      guid: '',
      gateway: '',
      isOnline: false,
      issetWifi: false,
      deviceModelName: '',
    };
    
    // 初始化工具类
    this.utils = new WifiOtaUtils(this);
    this.lastError = '';
    this.showUI = wifiObject.showUI || false; // UI控制参数
    this.preloaderActive = false;
    this.currentDialog = null; // Framework7 progress dialog实例
    
    // 重试相关属性
    this.retryCount = 0;
    this.maxRetries = 3;
    this.isRetrying = false;
    this.currentOperation = null; // 当前执行的操作类型
    this.retryParams = null; // 重试时需要的参数
    this.lastErrorCode = null; // 最后一次错误的错误码
    this.lastErrorStage = null; // 最后一次错误的阶段
    
    // 回调函数
    this.onProgress = null;
    this.onError = null;
    this.onSuccess = null;
    this.onStatusChange = null;
    this.onRetryPrompt = null; // 新增：重试提示回调
    
    this.updateWifiObject(wifiObject);
  }

  // 更新WiFi对象
  iotWifiOta.prototype.updateWifiObject = function (wifiObject) {
    const SAFE_PROPS = new Set([
      'ssid', 'password', 'currentFirmware', 
      'latestFirmware', 'status', 'progress', 'guid', 'gateway', 'isOnline', 'issetWifi',
      'deviceModelName', 'latestFullFirmware'
    ]);
    Object.keys(wifiObject).forEach(key => {
      if (SAFE_PROPS.has(key) && wifiObject[key] !== undefined) {
        this.prop[key] = wifiObject[key];
      }
    });
  };

  // 设置回调函数
  iotWifiOta.prototype.setCallbacks = function(callbacks) {
    if (callbacks.onProgress) this.onProgress = callbacks.onProgress;
    if (callbacks.onError) this.onError = callbacks.onError;
    if (callbacks.onSuccess) this.onSuccess = callbacks.onSuccess;
    if (callbacks.onStatusChange) this.onStatusChange = callbacks.onStatusChange;
    if (callbacks.onRetryPrompt) this.onRetryPrompt = callbacks.onRetryPrompt;
  };

  // 设置UI显示控制
  iotWifiOta.prototype.setShowUI = function(show) {
    this.showUI = show;
  };

  // 快捷方法：关闭所有弹窗
  iotWifiOta.prototype.closeAllDialogs = function() {
    return this.utils.closeAllDialogs();
  };

  // 更新进度（只用于下载进度更新）
  iotWifiOta.prototype.updateProgress = function(progress, message) {
    this.prop.progress = Math.min(100, Math.max(0, progress));
    
    // 只有在存在progress dialog时才更新
    if (this.currentDialog) {
      // 先更新文本，再更新进度
      if (message) {
        this.currentDialog.setText(_(message));
      }
      this.currentDialog.setProgress(this.prop.progress);
      
      // 完成时立即关闭，不延迟
      if (this.prop.progress >= 85) { // 85% is our mapped 100% download progress
        if (this.currentDialog) {
          this.currentDialog.close();
          this.currentDialog = null;
        }
      }
    }
    
    if (this.onProgress) {
      this.onProgress(this.prop.progress);
    }
  };

  // 更新状态
  iotWifiOta.prototype.updateStatus = function(status) {
    this.prop.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  };

  // 关闭当前progress dialog
  iotWifiOta.prototype.closeProgressDialog = function() {
    if (this.currentDialog) {
      this.currentDialog.close();
      this.currentDialog = null;
    }
  };

  // 开始progress dialog用于真正的下载进度
  iotWifiOta.prototype.startDownloadProgress = function(initialMessage) {
    // 先关闭所有弹窗
    this.utils.closeAllDialogs();
    
    // 创建progress dialog用于下载进度显示
    if (this.showUI && typeof app !== 'undefined' && app.dialog) {
      // 立即创建progress dialog，初始进度为40%（下载开始）
      this.currentDialog = app.dialog.progress('progress-bar', 40);
      if (this.currentDialog && initialMessage) {
        this.currentDialog.setText(_(initialMessage));
      }
    }
  };

  // 检查并生成gateway
  iotWifiOta.prototype.checkGatewayValue = function() {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.prop.gateway) {
          // 从设备获取gateway
          let mac = core_utils_get_mac_address_from_guid(this.prop.guid);
          if (!mac) {
            throw createError(ERROR_CODES.INIT_GATEWAY_VALIDATION_FAILED, 'Unable to extract MAC address from device GUID: ' + this.prop.guid);
          }
          if (!users[users.current] || !users[users.current].usr) {
            throw createError(ERROR_CODES.INIT_GATEWAY_VALIDATION_FAILED, 'Current user information not available');
          }
          let gateway = mac + '-' + users[users.current].usr.toLowerCase();
          this.prop.gateway = gateway;
          console.log('Generated gateway:', gateway);
        }
        
        // 验证gateway格式
        if (!this.prop.gateway.includes('-')) {
          throw createError(ERROR_CODES.INIT_GATEWAY_VALIDATION_FAILED, 'Invalid gateway format (missing separator): ' + this.prop.gateway);
        }
        
        resolve();
      } catch (error) {
        console.error('Gateway validation failed:', error);
        reject(error);
      }
    });
  };

  // 获取设备固件版本
  iotWifiOta.prototype.getCurrentFirmware = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const uuid = window.peripheral[self.prop.guid].prop.id;
        const mac = await self.utils.promisifyRead(uuid, '180a', '2a26');
        const version = self.utils.extractVersion(mac.convertToAscii());
        self.prop.currentFirmware = version;
        resolve(version);
      } catch (error) {
        debugger
        // 尝试从存储获取
        try {
          let storedFirmware = window.peripheral[self.prop.guid].prop.firmware;
          const fixedVersion = self.utils.detectAndFixCorruptedVersion(storedFirmware);
          
          if (fixedVersion !== storedFirmware) {
            console.log(`修复设备${self.prop.guid}的固件版本号: ${storedFirmware} -> ${fixedVersion}`);
            window.peripheral[self.prop.guid].prop.firmware = fixedVersion;
            storedFirmware = fixedVersion;
          }
          
          self.prop.currentFirmware = self.utils.extractVersion(storedFirmware);
          resolve(self.prop.currentFirmware);
        } catch (err) {
          // 从备用数据源获取
          if (erp.info.device[self.prop.guid] && erp.info.device[self.prop.guid].firmware) {
            let backupFirmware = erp.info.device[self.prop.guid].firmware;
            backupFirmware = self.utils.detectAndFixCorruptedVersion(backupFirmware);
            self.prop.currentFirmware = self.utils.extractVersion(backupFirmware);
            resolve(self.prop.currentFirmware);
          } else {
            self.prop.currentFirmware = '0.0.0';
            resolve(self.prop.currentFirmware);
          }
        }
      }
    });
  };

  // 获取固件信息
  iotWifiOta.prototype.getFirmwareInformation = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const firmwareResponse = await http2.request({
          url: encodeURI(`/api/method/appv6.getFirmware`),
          method: 'GET',
          responseType: 'json',
          serializer: 'json',
          params: {
            model: self.prop.deviceModelName,
          },
        });
        
        if (firmwareResponse.data.firmware) {
          const firmware = firmwareResponse.data.firmware;
          self.prop.latestFullFirmware = firmware.name;
          self.prop.latestFirmware = self.utils.extractVersion(firmware.name);
          console.log('Latest firmware:', self.prop.latestFirmware);
          resolve(firmware);
        } else {
          self.prop.latestFirmware = '';
          self.prop.latestFullFirmware = '';
          resolve(null);
        }
      } catch (error) {
        console.error('获取固件信息失败:', error);
        reject(createError(ERROR_CODES.INIT_FIRMWARE_INFO_FAILED, error.message || error));
      }
    });
  };

  // 初始化
  iotWifiOta.prototype.init = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        console.log('init', self.prop.guid);
        
        // 开始新的初始化操作，显示preloader
        self.utils.showPreloader(_('Initializing device...'));
        
        // 获取设备型号
        const hexid = self.prop.guid.substring(self.prop.guid.length - 6, self.prop.guid.length - 2);
        const device_model = erp.doctype.device_model[hexid.toUpperCase()];
        if (!device_model) {
          throw createError(ERROR_CODES.INIT_DEVICE_MODEL_NOT_FOUND, 'Device model not found for: ' + hexid);
        }
        self.prop.deviceModelName = device_model.model_code;
        console.log('Device model name:', self.prop.deviceModelName);
        self.utils.closeAllDialogs();
        self.utils.showPreloader(_('Validating device configuration...'));
        // 检查gateway值
        await self.checkGatewayValue();
        console.log('gateway: ', self.prop.gateway);
        self.utils.closeAllDialogs();
        self.utils.showPreloader(_('Checking firmware information...'));
        // 获取固件信息
        await self.getFirmwareInformation();
        self.utils.closeAllDialogs();
        self.utils.showPreloader(_('Reading current firmware version...'));
        // 获取当前固件版本
        await self.getCurrentFirmware();
        console.log(`设备${self.prop.guid}当前固件版本: ${self.prop.currentFirmware}`);
        
        // 检查是否是最新版本
        if (self.prop.currentFirmware === self.prop.latestFirmware || !self.prop.latestFirmware) {
          self.isLatest = true;
        } else {
          self.isLatest = false;
        }
        self.utils.closeAllDialogs();
        self.utils.showPreloader(_('Checking Wi-Fi connectivity...'));
        // 检查当前WiFi连接状态
        try {
          const isOnline = await self.checkWifiStatus();
          self.prop.isOnline = isOnline;
          console.log(`设备${self.prop.guid}WiFi状态: ${isOnline ? '已连接' : '未连接'}`);
        } catch (error) {
          console.log('WiFi状态检测失败，假设未连接:', error);
          self.prop.isOnline = false;
        }
        
        self.utils.closeAllDialogs();
        resolve();
      } catch (error) {
        console.error('初始化失败:', error);
        self.utils.handleError(error);
        reject(error);
      }
    });
  };

  // WiFi连接
  iotWifiOta.prototype.wifiConnect = function (showSuccessMessage = true) {
    const self = this;
    return new Promise(async(resolve, reject) => {
      const connect_timer = setTimeout(async () => {
        const error = createError(ERROR_CODES.WIFI_CONNECTION_TIMEOUT, 'WiFi connection timeout after 3 minutes');
        try {
          await self.handleErrorWithRetry(error, 'wifiConnect', { showSuccessMessage });
          resolve();
        } catch (retryError) {
          reject(retryError);
        }
      }, 1000*60*3);
      
      self.utils.timers.add(connect_timer);

      try {
        // 检查参数
        if (self.prop.ssid === '' || self.prop.password === '') {
          clearTimeout(connect_timer);
          self.utils.timers.delete(connect_timer);
          const error = createError(ERROR_CODES.WIFI_PARAMS_INVALID, 'SSID or password is empty');
          self.utils.handleError(error);
          reject(error);
          return;
        }

        self.updateStatus('connecting_wifi');
        self.utils.showPreloader(_('Checking current Wi-Fi status...'));

        // 先检查当前WiFi连接状态
        let isOnline = await self.checkWifiStatus();
        self.prop.isOnline = isOnline;

        if (isOnline) {
          clearTimeout(connect_timer);
          self.utils.timers.delete(connect_timer);
          
          if (showSuccessMessage) {
            // 显示WiFi已连接的成功提示
            self.utils.showPreloader(_('Wi-Fi is already connected successfully!'));
            await self.utils.sleep(1500); // 让用户看到成功提示
          }
          self.utils.closeAllDialogs();
          
          self.updateStatus('wifi_connected');
          if (self.onSuccess) {
            self.onSuccess('Wi-Fi already connected successfully');
          }
          resolve();
          return;
        }

        self.utils.showPreloader(_('Preparing Wi-Fi configuration...'));

        // 生成WiFi配置
        const bleList = self.utils.generateWifiConfig(self.prop.ssid, self.prop.password, self.prop.gateway);
        
        self.utils.showPreloader(_('Sending Wi-Fi configuration...'));

        // 写入配置
        await window.peripheral[self.prop.guid].write(bleList);
        self.utils.showPreloader(_('Waiting for device restart...'));

        // 等待设备重启
        await self.utils.sleep(20 * 1000);
        self.utils.showPreloader(_('Reconnecting to device...'));

        // 重新连接设备
        await window.peripheral[self.prop.guid].connect();
        self.utils.showPreloader(_('Verifying Wi-Fi connection...'));

        // 检查WiFi状态
        isOnline = await self.checkWifiStatus();
        self.prop.isOnline = isOnline;

        if(isOnline){
          clearTimeout(connect_timer);
          self.utils.timers.delete(connect_timer);
          
          if (showSuccessMessage) {
            // 显示WiFi连接成功的提示
            self.utils.showPreloader(_('Wi-Fi connected successfully!'));
            await self.utils.sleep(1500); // 让用户看到成功提示
          }
          self.utils.closeAllDialogs();
          
          self.updateStatus('wifi_connected');
          if (self.onSuccess) {
            self.onSuccess('WiFi connected successfully');
          }
          resolve();
        } else {
          const error = createError(ERROR_CODES.WIFI_CONNECTION_FAILED, 'WiFi connection verification failed');
          try {
            await self.handleErrorWithRetry(error, 'wifiConnect', { showSuccessMessage });
            resolve();
          } catch (retryError) {
            reject(retryError);
          }
        }
      } catch(error) {
        clearTimeout(connect_timer);
        self.utils.timers.delete(connect_timer);
        try {
          await self.handleErrorWithRetry(error, 'wifiConnect', { showSuccessMessage });
          resolve();
        } catch (retryError) {
          reject(retryError);
        }
      }
    });
  };

  // 检查WiFi状态
  iotWifiOta.prototype.checkWifiStatus = function () {
    const self = this;
    return new Promise((resolve, reject) => {
      let isOnline = false;
      let timeoutId = null;
      
      const handleWifiInfo = (data) => {
        try {
          const rs = data.rs;
          const jsonData = JSON.parse(self.utils.hexToPlainText(rs.substring(10)));
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
        if (timeoutId) {
          clearTimeout(timeoutId);
          self.utils.timers.delete(timeoutId);
        }
        emitter.off('iot/wifi/info', handleWifiInfo);
      };

      const completeCheck = (result) => {
        cleanup();
        resolve(result);
      };

      // 监听WiFi信息
      emitter.on('iot/wifi/info', handleWifiInfo);

      // 延迟发送WiFi状态查询命令
      const delayedWriteTimer = setTimeout(async () => {
        self.utils.timers.delete(delayedWriteTimer);
        try {
          await window.peripheral[self.prop.guid].write([
            {
              service: 'ff80',
              characteristic: 'ff81',
              data: '9329',
            },
          ]);
        } catch(error) {
          completeCheck(isOnline);
        }
      }, 500);
      self.utils.timers.add(delayedWriteTimer);

      timeoutId = setTimeout(() => {
        self.utils.timers.delete(timeoutId);
        completeCheck(isOnline);
      }, 1000 * 6);
      self.utils.timers.add(timeoutId);
    });
  };

  // 开始OTA升级
  iotWifiOta.prototype.startOta = function () {
    const self = this;
    return new Promise(async(resolve, reject) => {
      try {
        // 检查WiFi连接状态
        if (!self.prop.isOnline) {
          const error = createError(ERROR_CODES.OTA_WIFI_NOT_CONNECTED, 'Device WiFi is not connected');
          try {
            await self.handleErrorWithRetry(error, 'startOta');
            resolve(_('The firmware is the latest.'));
          } catch (retryError) {
            reject(retryError);
          }
          return;
        }

        self.updateStatus('upgrading');
        self.utils.showPreloader(_('Preparing firmware upgrade...'));

        if (!self.prop.latestFullFirmware) {
          const error = createError(ERROR_CODES.OTA_NO_FIRMWARE_AVAILABLE, 'No firmware available for this device model');
          try {
            await self.handleErrorWithRetry(error, 'startOta');
            resolve(_('The firmware is the latest.'));
          } catch (retryError) {
            reject(retryError);
          }
          return;
        }

        self.utils.showPreloader(_('Checking firmware compatibility...'));

        // 生成固件文件名
        const version = parseInt(self.prop.latestFirmware.split('.')[0]);
        let full_firmware_name = self.prop.latestFullFirmware;
        
        // 设备型号特殊处理规则
        if ((self.prop.deviceModelName === 'YO105' || self.prop.deviceModelName === 'YO161') && version < 10) {
          full_firmware_name = full_firmware_name + 'D';
        }
        full_firmware_name = full_firmware_name + '.bin';

        self.utils.showPreloader(_('Sending upgrade command...'));

        // 使用BLE方式升级
        const command = '93300000' + full_firmware_name.length.toString(16).pad('00') + full_firmware_name.convertToHex();
        console.log('Upgrade Firmware: ' + full_firmware_name);
        console.log('Upgrade Command: ' + command);

        await window.peripheral[self.prop.guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: command,
          },
        ]);

        self.utils.showPreloader(_('Waiting for device processing...'));

        // 等待设备处理
        await self.utils.sleep(10 * 1000);
        
        self.utils.showPreloader(_('Reconnecting for upgrade monitoring...'));
        // 重新连接并监听升级进度
        await self.utils.retryConnect(window.peripheral[self.prop.guid].prop.id, 3);

        // 监听升级进度（这里会切换到progress dialog）
        await self.receiveUpgradingProgress();
        
        // 确保所有弹窗已关闭，然后显示验证preloader
        self.utils.closeAllDialogs();
        self.utils.showPreloader(_('Verifying firmware update...'));

        // 最终验证
        await self.utils.sleep(5000);
        const isLatest = await self.compareFirmware();
        
        // 无论成功失败都要关闭所有弹窗
        self.utils.closeAllDialogs();
        
        if (isLatest) {
          self.updateStatus('success');
          if (self.onSuccess) {
            self.onSuccess('Firmware upgrade completed successfully');
          }
          resolve(_('The firmware is the latest.'));
        } else {
          const error = createError(ERROR_CODES.VERIFY_FIRMWARE_MISMATCH, 'Firmware verification failed after upgrade');
          try {
            await self.handleErrorWithRetry(error, 'startOta');
            resolve(_('The firmware is the latest.'));
          } catch (retryError) {
            reject(retryError);
          }
        }

      } catch(error) {
        try {
          await self.handleErrorWithRetry(error, 'startOta');
          resolve(_('The firmware is the latest.'));
        } catch (retryError) {
          reject(retryError);
        }
      }
    });
  };

  // 接收升级进度
  iotWifiOta.prototype.receiveUpgradingProgress = function() {
    const self = this;
    return new Promise((resolve, reject) => {
      let timeoutId = null;
      let progressStaleTimeoutId = null; // 新增：进度停滞检测定时器

      const startFailTimeout = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          self.utils.timers.delete(timeoutId);
        }

        timeoutId = setTimeout(() => {
          self.utils.timers.delete(timeoutId);
          emitter.off('ota/start', otaProgressHandler);
          self.utils.closeAllDialogs(); // 超时时关闭所有弹窗
          reject(createError(ERROR_CODES.OTA_DOWNLOAD_TIMEOUT, 'OTA download timeout after 5 minutes'));
        }, 1000 * 60 * 5); // 5分钟超时
        self.utils.timers.add(timeoutId);
      };

      // 新增：启动进度停滞检测定时器
      const startProgressStaleTimeout = () => {
        if (progressStaleTimeoutId) {
          clearTimeout(progressStaleTimeoutId);
          self.utils.timers.delete(progressStaleTimeoutId);
        }

        progressStaleTimeoutId = setTimeout(async () => {
          self.utils.timers.delete(progressStaleTimeoutId);
          console.log('❌ 检测到进度停滞30秒，判定OTA失败');
          
          // 清理所有定时器和监听器
          if (timeoutId) {
            clearTimeout(timeoutId);
            self.utils.timers.delete(timeoutId);
          }
          emitter.off('ota/start', otaProgressHandler);
          self.utils.closeAllDialogs();
          
          const error = createError(ERROR_CODES.OTA_PROGRESS_STALLED, 'OTA progress stalled for 30 seconds');
          
          // 尝试重试机制
          try {
            await self.handleErrorWithRetry(error, 'startOta');
            resolve(); // 重试成功
          } catch (retryError) {
            reject(retryError); // 重试失败
          }
        }, 30 * 1000); // 30秒进度停滞超时
        self.utils.timers.add(progressStaleTimeoutId);
      };

      let progressDialogStarted = false;

      const otaProgressHandler = (data) => {
        const rs = data.rs;
        if (data.guid && data.guid === self.prop.guid) {
          const command = parseInt(rs.substring(rs.length - 2, rs.length), 16);
          console.log('upgrading: ' + rs + ', percent: ' + command);
          
          if (timeoutId) {
            clearTimeout(timeoutId);
            self.utils.timers.delete(timeoutId);
          }
          
          if (command > 100) {
            console.log('Abnormal progress: ' + command);
            // 清理进度停滞定时器
            if (progressStaleTimeoutId) {
              clearTimeout(progressStaleTimeoutId);
              self.utils.timers.delete(progressStaleTimeoutId);
            }
            emitter.off('ota/start', otaProgressHandler);
            self.utils.closeAllDialogs(); // 异常进度时关闭所有弹窗
            reject(createError(ERROR_CODES.OTA_PROGRESS_ABNORMAL, 'Received abnormal progress value: ' + command));
          } else {
            // 第一次收到下载进度时，启动progress dialog
            if (!progressDialogStarted) {
              progressDialogStarted = true;
              const initialProgressPercent = 40 + (command / 100) * 45;
              self.startDownloadProgress(`Downloading firmware: ${Math.round(initialProgressPercent)}%`);
              
              // 启动进度停滞检测
              console.log('🔄 启动进度停滞检测（30秒）');
              startProgressStaleTimeout();
            }
            
            // 更新进度 (40-85的范围)
            const progressPercent = 40 + (command / 100) * 45;
            self.updateProgress(progressPercent, `Downloading firmware: ${Math.round(progressPercent)}%`);
            
            if (command === 100) {
              // 下载完成，清理进度停滞定时器
              if (progressStaleTimeoutId) {
                clearTimeout(progressStaleTimeoutId);
                self.utils.timers.delete(progressStaleTimeoutId);
              }
              
              // 下载完成，立即更新当前固件版本为最新版本
              self.prop.currentFirmware = self.prop.latestFirmware;
              console.log(`✅ 固件下载完成，当前版本已更新为: ${self.prop.currentFirmware}`);
              
              // 同时更新peripheral中的固件版本信息
              if (window.peripheral[self.prop.guid] && window.peripheral[self.prop.guid].prop) {
                window.peripheral[self.prop.guid].prop.firmware = self.prop.latestFirmware;
                console.log(`✅ Peripheral固件版本已更新为: ${self.prop.latestFirmware}`);
              }
              
              // 确保所有弹窗被关闭
              self.utils.closeAllDialogs();
              
              emitter.off('ota/start', otaProgressHandler);
              resolve();
            } else {
              // 重新启动总超时定时器
              startFailTimeout();
              
              // 重新启动进度停滞检测定时器（只要进度未完成就继续检测）
              startProgressStaleTimeout();
            }
          }
        }
      };

      emitter.on('ota/start', otaProgressHandler);
      startFailTimeout();
    });
  };

  // 比较固件版本（简化版 - 直接对比peripheral固件版本）
  iotWifiOta.prototype.compareFirmware = function () {
    const self = this;
    return new Promise(async(resolve, reject) => {
      try {
        console.log('开始简化版固件版本比较...');
        
        // 等待一小段时间，让设备固件信息更新
        await self.utils.sleep(2000);
        
        // 直接从peripheral获取当前固件版本
        let currentFirmware = '';
        
        if (window.peripheral[self.prop.guid] && window.peripheral[self.prop.guid].prop.firmware) {
          let rawFirmware = window.peripheral[self.prop.guid].prop.firmware;
          
          // 修复可能损坏的版本号
          rawFirmware = self.utils.detectAndFixCorruptedVersion(rawFirmware);
          
          // 提取标准版本号
          currentFirmware = self.utils.extractVersion(rawFirmware);
          
          console.log(`设备当前固件版本: ${currentFirmware}`);
          console.log(`目标固件版本: ${self.prop.latestFirmware}`);
          
          // 更新实例中的当前固件版本
          self.prop.currentFirmware = currentFirmware;
          
          // 比较版本号
          if (currentFirmware === self.prop.latestFirmware) {
            console.log('✅ 固件版本匹配，升级成功');
            resolve(true);
          } else {
            console.log(`❌ 固件版本不匹配: ${currentFirmware} !== ${self.prop.latestFirmware}`);
            resolve(false);
          }
        } else {
          console.log('⚠️ 无法获取设备固件信息，假设升级成功');
          // 如果无法获取固件信息，假设升级成功（兼容性处理）
          resolve(true);
        }
        
      } catch (error) {
        console.error('固件版本比较出错:', error);
        // 出错时也假设升级成功，避免阻塞流程
        resolve(true);
      }
    });
  };

  // 重置WiFi设置
  iotWifiOta.prototype.resetWifi = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        self.utils.showPreloader(_('Preparing Wi-Fi reset...'));
        
        const bleList = [];
        const ssid_data = '932000';
        const password_data = '932100';
        
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

        self.utils.showPreloader(_('Clearing Wi-Fi configuration...'));
        await window.peripheral[self.prop.guid].write(bleList);
        self.prop.isOnline = false;
        self.prop.issetWifi = false;
        
        self.utils.closeAllDialogs();
        if (self.onSuccess) {
          self.onSuccess('Wi-Fi settings reset successfully');
        }
        resolve();
      } catch (error) {
        self.utils.handleError(error);
        reject(error);
      }
    });
  };

  // 完整的升级流程（WiFi连接 + OTA升级）
  iotWifiOta.prototype.fullUpgrade = function(ssid, password) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        // 初始化
        await self.init();
        
        // 更新WiFi信息
        self.updateWifiObject({ ssid, password });
        
        // 检查WiFi连接状态
        if (!self.prop.isOnline) {
          // 1. 连接WiFi（在fullUpgrade流程中不显示成功提示）
          self.updateStatus('connecting_wifi');
          await self.wifiConnect(false);
          
          // WiFi连接完成后，显示准备升级的提示
          self.updateStatus('upgrading');
          self.utils.showPreloader(_('Wi-Fi connected successfully, preparing firmware upgrade...'));
        } else {
          console.log('设备已连接WiFi，跳过连接步骤');
          // 设备已连接WiFi，直接显示准备升级的提示
          self.updateStatus('upgrading');
          self.utils.showPreloader(_('Wi-Fi already connected, preparing firmware upgrade...'));
        }
        
        // 短暂延迟，让用户看到过渡状态
        await self.utils.sleep(1500);
        
        // 3. 开始OTA升级
        await self.startOta();
        
        // 3. 升级完成
        self.updateStatus('success');
        // onSuccess已经在startOta中调用过了，不需要重复调用
        resolve();
        
      } catch (error) {
        try {
          await self.handleErrorWithRetry(error, 'fullUpgrade', { ssid, password });
          resolve();
        } catch (retryError) {
          reject(retryError);
        }
      }
    });
  };

  // 清理资源
  iotWifiOta.prototype.destroy = function() {
    if (this.utils) {
      this.utils.cleanup(); // cleanup方法内部已经调用closeAllDialogs
    } else {
      // 如果utils不存在，直接尝试关闭弹窗
      this.closeProgressDialog();
    }
  };

  // 获取当前状态
  iotWifiOta.prototype.getStatus = function() {
    return {
      status: this.prop.status,
      progress: this.prop.progress,
      isOnline: this.prop.isOnline,
      issetWifi: this.prop.issetWifi,
      currentFirmware: this.prop.currentFirmware,
      latestFirmware: this.prop.latestFirmware,
      lastError: this.lastError,
      isLatest: this.isLatest || false,
      wifiStatus: this.prop.isOnline ? 'Connected' : 'Disconnected',
      needsWifiConnection: !this.prop.isOnline,
      needsFirmwareUpgrade: !this.isLatest,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      canRetry: this.retryCount < this.maxRetries && this.lastError && this.isRetryableError(this.lastError),
      lastErrorCode: this.lastErrorCode,
      lastErrorStage: this.lastErrorStage
    };
  };

  // 判断错误是否可重试
  iotWifiOta.prototype.isRetryableError = function(error) {
    // 如果是标准化错误对象，检查错误码
    if (error && error.code) {
      const retryableErrorCodes = [
        // WiFi连接阶段可重试错误
        ERROR_CODES.WIFI_CONNECTION_TIMEOUT,
        ERROR_CODES.WIFI_CONNECTION_FAILED,
        ERROR_CODES.WIFI_STATUS_CHECK_FAILED,
        ERROR_CODES.WIFI_DEVICE_UNREACHABLE,
        
        // OTA升级阶段可重试错误
        ERROR_CODES.OTA_COMMAND_SEND_FAILED,
        ERROR_CODES.OTA_DEVICE_RECONNECT_FAILED,
        ERROR_CODES.OTA_PROGRESS_STALLED,
        ERROR_CODES.OTA_DOWNLOAD_TIMEOUT,
        ERROR_CODES.OTA_PROGRESS_ABNORMAL,
        
        // 通用可重试错误
        ERROR_CODES.GENERAL_BLE_OPERATION_TIMEOUT,
        ERROR_CODES.GENERAL_DEVICE_CONNECTION_LOST
      ];
      return retryableErrorCodes.includes(error.code);
    }
    
    // 兼容旧的字符串错误检查
    const retryableErrors = [
      'OTA progress stalled - device may have lost power or disconnected',
      'Download timeout',
      'BLE operation timeout',
      '7001', // 连接失败
      'Sorry, Wi-Fi is not connected yet.',
      'Wi-Fi connection failed.',
      'Connection lost during upgrade'
    ];
    
    const errorString = typeof error === 'string' ? error : String(error);
    return retryableErrors.some(retryableError => 
      errorString.includes(retryableError) || errorString === retryableError
    );
  };

  // 显示重试提示对话框
  iotWifiOta.prototype.showRetryPrompt = function(error) {
    const self = this;
    return new Promise((resolve) => {
      // 如果有自定义的重试提示回调，使用它
      if (self.onRetryPrompt) {
        self.utils.closeAllDialogs();
        self.onRetryPrompt(error, self.retryCount, self.maxRetries, resolve);
        return;
      }

      // 默认的重试提示对话框
      if (self.showUI && typeof app !== 'undefined' && app.dialog) {
        let errorMessage;
        let stageMessage = '';
        
        if (error && error.code) {
          errorMessage = error.userMessage || error.originalMessage;
          stageMessage = self.getStageDisplayName(error.stage);
        } else {
          errorMessage = erp?.get_log_description ? erp.get_log_description(error) : error;
          stageMessage = self.getStageDisplayName(self.lastErrorStage);
        }
        
        const retryMessage = `${_('Operation failed')}: ${errorMessage}\n${_('Error stage')}: ${stageMessage}\n${_('Retry attempts')}: ${self.retryCount}/${self.maxRetries}\n\n${_('Would you like to retry?')}`;
        
        app.dialog.confirm(
          retryMessage,
          _('Retry Operation'),
          () => resolve(true),  // 用户选择重试
          () => resolve(false)  // 用户选择取消
        );
      } else {
        // 没有UI时默认不重试
        resolve(false);
      }
    });
  };

  // 执行重试
  iotWifiOta.prototype.executeRetry = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        self.isRetrying = true;
        self.retryCount++;
        
        console.log(`🔄 开始第${self.retryCount}次重试，操作类型: ${self.currentOperation}，错误阶段: ${self.lastErrorStage}`);
        
        // 清理当前状态
        self.utils.closeAllDialogs();
        await self.utils.sleep(2000); // 等待2秒让用户看到重试开始
        
        // 根据错误阶段和操作类型执行精准重试逻辑
        await self.executeStageBasedRetry();
        
        // 重试成功
        self.resetRetryState();
        resolve();
        
      } catch (error) {
        console.log(`❌ 第${self.retryCount}次重试失败:`, error);
        
        // 检查是否还能继续重试
        if (self.retryCount < self.maxRetries && self.isRetryableError(error)) {
          const shouldRetry = await self.showRetryPrompt(error);
          if (shouldRetry) {
            // 继续重试
            try {
              await self.executeRetry();
              resolve();
            } catch (finalError) {
              reject(finalError);
            }
          } else {
            // 用户选择不重试
            self.resetRetryState();
            reject(error);
          }
        } else {
          // 达到最大重试次数或不可重试错误
          self.resetRetryState();
          reject(error);
        }
      } finally {
        self.isRetrying = false;
      }
    });
  };

  // 基于错误阶段的精准重试逻辑
  iotWifiOta.prototype.executeStageBasedRetry = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🎯 执行精准重试 - 错误阶段: ${self.lastErrorStage}`);
        
        switch (self.lastErrorStage) {
          case ERROR_STAGES.INIT:
            console.log('🔄 从初始化阶段开始重试...');
            await self.fullUpgradeFromInit();
            break;
            
          case ERROR_STAGES.WIFI:
            console.log('🔄 从WiFi连接阶段开始重试...');
            await self.fullUpgradeFromWifi();
            break;
            
          case ERROR_STAGES.OTA:
            console.log('🔄 跳过WiFi连接，直接重试OTA升级...');
            await self.fullUpgradeFromOta();
            break;
            
          case ERROR_STAGES.VERIFY:
            console.log('🔄 重新验证固件版本...');
            await self.fullUpgradeFromVerify();
            break;
            
          default:
            // 默认重试逻辑 - 根据原始操作类型
            console.log('🔄 使用默认重试逻辑...');
            switch (self.currentOperation) {
              case 'wifiConnect':
                await self.wifiConnect();
                break;
              case 'startOta':
                await self.startOta();
                break;
              case 'fullUpgrade':
                await self.fullUpgrade(self.retryParams.ssid, self.retryParams.password);
                break;
              default:
                throw createError(ERROR_CODES.GENERAL_UNKNOWN_ERROR, 'Unknown operation type for retry: ' + self.currentOperation);
            }
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // 重置重试状态
  iotWifiOta.prototype.resetRetryState = function() {
    this.retryCount = 0;
    this.isRetrying = false;
    this.currentOperation = null;
    this.retryParams = null;
  };

  // 增强的错误处理（支持重试）
  iotWifiOta.prototype.handleErrorWithRetry = function(error, operation, params = null) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      // 如果正在重试过程中，直接抛出错误
      if (self.isRetrying) {
        reject(error);
        return;
      }

      // 记录错误信息用于精准重试
      self.recordErrorInfo(error);

      // 检查是否可重试
      if (self.retryCount < self.maxRetries && self.isRetryableError(error)) {
        // 设置当前操作信息
        self.currentOperation = operation;
        self.retryParams = params;
        
        const shouldRetry = await self.showRetryPrompt(error);
        if (shouldRetry) {
          try {
            await self.executeRetry();
            resolve();
          } catch (retryError) {
            // 重试最终失败，使用原来的错误处理
            self.utils.handleError(retryError);
            reject(retryError);
          }
        } else {
          // 用户选择不重试
          self.resetRetryState();
          self.utils.handleError(error);
          reject(error);
        }
      } else {
        // 不可重试或达到最大重试次数
        self.resetRetryState();
        self.utils.handleError(error);
        reject(error);
      }
    });
  };

  // 记录错误信息用于精准重试
  iotWifiOta.prototype.recordErrorInfo = function(error) {
    if (error && error.code) {
      this.lastErrorCode = error.code;
      this.lastErrorStage = error.stage;
      console.log(`📝 记录错误信息 - 错误码: ${error.code}, 阶段: ${error.stage}`);
    } else {
      // 兼容旧的字符串错误
      this.lastErrorCode = null;
      this.lastErrorStage = this.inferErrorStageFromMessage(error);
      console.log(`📝 记录错误信息 - 推测阶段: ${this.lastErrorStage}`);
    }
  };

  // 从错误消息推测错误阶段（兼容性处理）
  iotWifiOta.prototype.inferErrorStageFromMessage = function(error) {
    const errorString = typeof error === 'string' ? error : String(error);
    
    if (errorString.includes('Wi-Fi') || errorString.includes('WiFi')) {
      return ERROR_STAGES.WIFI;
    }
    if (errorString.includes('OTA') || errorString.includes('progress') || errorString.includes('download')) {
      return ERROR_STAGES.OTA;
    }
    if (errorString.includes('firmware') && errorString.includes('latest')) {
      return ERROR_STAGES.VERIFY;
    }
    if (errorString.includes('device model') || errorString.includes('gateway')) {
      return ERROR_STAGES.INIT;
    }
    
    return ERROR_STAGES.GENERAL;
  };

  // 获取阶段的用户友好显示名称
  iotWifiOta.prototype.getStageDisplayName = function(stage) {
    const stageNames = {
      [ERROR_STAGES.INIT]: _('Initialization'),
      [ERROR_STAGES.WIFI]: _('Wi-Fi Connection'), 
      [ERROR_STAGES.OTA]: _('Firmware Upgrade'),
      [ERROR_STAGES.VERIFY]: _('Verification'),
      [ERROR_STAGES.GENERAL]: _('General Operation')
    };
    return stageNames[stage] || _('Unknown Stage');
  };

  // 设置重试参数
  iotWifiOta.prototype.setRetryOptions = function(options) {
    if (options.maxRetries !== undefined) this.maxRetries = options.maxRetries;
    if (options.resetCount !== undefined && options.resetCount) this.retryCount = 0;
  };

  // 手动重试上次失败的操作
  iotWifiOta.prototype.manualRetry = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (!self.lastError) {
        reject('No previous error to retry');
        return;
      }

      if (self.retryCount >= self.maxRetries) {
        reject('Maximum retry attempts reached');
        return;
      }

      if (!self.isRetryableError(self.lastError)) {
        reject('Previous error is not retryable');
        return;
      }

      if (!self.currentOperation) {
        reject('No operation information available for retry');
        return;
      }

      try {
        await self.executeRetry();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // 从初始化阶段开始重试（完整流程）
  iotWifiOta.prototype.fullUpgradeFromInit = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        // 完整重试流程
        await self.init();
        await self.fullUpgradeFromWifi();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // 从WiFi连接阶段开始重试
  iotWifiOta.prototype.fullUpgradeFromWifi = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        // 检查WiFi连接状态
        if (!self.prop.isOnline) {
          self.updateStatus('connecting_wifi');
          await self.wifiConnect(false);
          
          self.updateStatus('upgrading');
          self.utils.showPreloader(_('Wi-Fi connected successfully, preparing firmware upgrade...'));
        } else {
          console.log('设备已连接WiFi，跳过连接步骤');
          self.updateStatus('upgrading');
          self.utils.showPreloader(_('Wi-Fi already connected, preparing firmware upgrade...'));
        }
        
        await self.utils.sleep(1500);
        await self.fullUpgradeFromOta();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // 从OTA升级阶段开始重试（跳过WiFi连接）
  iotWifiOta.prototype.fullUpgradeFromOta = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        await self.startOta();
        self.updateStatus('success');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // 从验证阶段开始重试
  iotWifiOta.prototype.fullUpgradeFromVerify = function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        self.utils.showPreloader(_('Verifying firmware update...'));
        await self.utils.sleep(5000);
        
        const isLatest = await self.compareFirmware();
        self.utils.closeAllDialogs();
        
        if (isLatest) {
          self.updateStatus('success');
          if (self.onSuccess) {
            self.onSuccess('Firmware upgrade completed successfully');
          }
          resolve();
        } else {
          throw createError(ERROR_CODES.VERIFY_FIRMWARE_MISMATCH, 'Firmware version verification failed');
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  return iotWifiOta;
})(); 