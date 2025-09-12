window.towngasSoap = (function () {
  //构造工具类函数
  class towngasUtils {
    constructor(instance) {
      this.instance = instance;
      this.timers = new Set();
      this.eventListeners = new Map();
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
  }
  function towngasSoap(soapObject) {
    this.props = {
      domian: 'https://frappe.cecgaming.com',
      logApi: '/api/method/towngas_soap_client.api.get_call_result',
      loginApi: '/api/method/towngas_soap_client.api.call_wsdl_method',
      loginMethod: 'Login',
      tempControllerAppService: 'TempControllerAppService',
      equAppService: 'EquAppService',
      methodName: soapObject && soapObject.methodName ? soapObject.methodName : '',
      appToken: 'token 9609c88e4794227:5b6d3a6ddc683cf',
      userToken: '',
      expiresIn: '',
      expiresNow: '',
      jsonParams: soapObject && soapObject.jsonParams ? soapObject.jsonParams : {},
      guestAccount: '96159708',
      password: 'Password2020!',
      smid: '353851664234621',
      phoneInfo: 'iPhone',
    };
    this.utils = new towngasUtils(this);
    this.currentDialog = null;
    this.preloaderActive = false;
    //登录的方法
    towngasSoap.prototype.login = () => {
      return new Promise(async (resolve, reject) => {
        // 优先使用本地已缓存且未过期的 token
        try {
          const maybeToken = await this.getValidUserToken();
          if (maybeToken) {
            resolve(maybeToken);
            return;
          }
        } catch (_) {
          // 忽略，继续发起登录
        }
        this.utils.showPreloader(_('Logging...'));
        try {
          const res = await http2.request(this.props.domian + this.props.loginApi, {
            method: 'POST',
            headers: {
              'Authorization': this.props.appToken,
            },
            data: {
              'service_type': this.props.tempControllerAppService,
              'method_name': this.props.loginMethod,
              'json_params': {
                'GuestAccount': this.props.guestAccount,
                'password': this.props.password,
                'SMID': this.props.smid,
                'PhoneInfo': this.props.phoneInfo,
              },
            },
          });
          console.log('res', res);
          if (res && res.data && res.data.message && res.data.message.log_id) {
            try {
              const logResult = await this.pollResponsePool(res.data.message.log_id, { intervalMs: 500, timeoutMs: 120000 });
              console.log('logResult', logResult);
              const decryptedData =
                logResult.data && logResult.data.message && logResult.data.message.data ? logResult.data.message.data.decrypted_data : null;
              const userToken =
                decryptedData && decryptedData['Data'] && decryptedData['Data']['userToken']
                  ? decryptedData['Data']['userToken'].userToken
                  : '';
              const expiresIn =
                decryptedData && decryptedData['Data'] && decryptedData['Data']['userToken']
                  ? decryptedData['Data']['userToken'].expiresIn
                  : '';
              this.props.expiresIn = expiresIn;
              if (userToken) {
                // 持久化与内存写入（异步）
                await this.saveUserTokenToDB(userToken, expiresIn);
                this.utils.hidePreloader();
                resolve(this.props.userToken);
              } else {
                this.utils.hidePreloader();
                reject(new Error('Login failed'));
              }
            } catch (err) {
              this.utils.hidePreloader();
              reject(err);
            }
          } else {
            this.utils.hidePreloader();
            reject(new Error('Login failed'));
          }
        } catch (error) {
          this.utils.hidePreloader();
          reject(error);
        }
      });
    };
    //获取用户的设备列表
    towngasSoap.prototype.getDeviceList = () => {
      return new Promise(async (resolve, reject) => {
        this.utils.showPreloader(_('Getting device list...'));
        const userToken = await this.getValidUserToken();
        if (!userToken) {
          this.utils.hidePreloader();
          reject(new Error('User token is not valid'));
        }
        try {
          const deviceListRes = await http2.request(this.props.domian + this.props.loginApi, {
            method: 'POST',
            headers: {
              'Authorization': this.props.appToken,
            },
            data: {
              'service_type': this.props.equAppService,
              'method_name': 'GetEquList_ZJ',
              'user_token': this.props.userToken,
              'json_params': {
                'equType': '',
                'GasAccount': this.props.guestAccount,
              },
            },
          });
          console.log('deviceListRes', deviceListRes);
          if (deviceListRes && deviceListRes.data && deviceListRes.data.message && deviceListRes.data.message.log_id) {
            try {
              const logResult = await this.pollResponsePool(deviceListRes.data.message.log_id, { intervalMs: 500, timeoutMs: 120000 });
              console.log('logResult', logResult);
              const decryptedData =
                logResult.data && logResult.data.message && logResult.data.message.data ? logResult.data.message.data.decrypted_data : null;
              const deviceList = decryptedData && decryptedData['Data'] ? decryptedData['Data'] : [];
              console.log('deviceList', deviceList);
              this.utils.hidePreloader();
              resolve(deviceList);
            } catch (err) {
              this.utils.hidePreloader();
              reject(err);
            }
          } else {
            this.utils.hidePreloader();
            reject(new Error('Get device list failed'));
          }
        } catch (error) {
          this.utils.hidePreloader();
          reject(error);
        }
      });
    };
    //从响应池中获取数据
    towngasSoap.prototype.getDataFromResponsePool = (logId) => {
      return http2.request(this.props.domian + this.props.logApi, {
        method: 'POST',
        headers: {
          'Authorization': this.props.appToken,
        },
        data: {
          'log_id': logId,
        },
      });
    };
    //通用轮询方法：轮询响应池，直到成功或超时
    towngasSoap.prototype.pollResponsePool = (logId, options) => {
      const intervalMs = options && options.intervalMs != null ? options.intervalMs : 500;
      const timeoutMs = options && options.timeoutMs != null ? options.timeoutMs : 120000;
      return new Promise((resolve, reject) => {
        let intervalId = null;
        let timeoutId = null;
        let finished = false;
        const clearAll = () => {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        };
        const handleResolve = (value) => {
          if (finished) return;
          finished = true;
          clearAll();
          resolve(value);
        };
        const handleReject = (err) => {
          if (finished) return;
          finished = true;
          clearAll();
          reject(err);
        };
        const checkOnce = async () => {
          try {
            const logResult = await this.getDataFromResponsePool(logId);
            const message = logResult && logResult.data && logResult.data.message ? logResult.data.message : null;
            const status = message && message.status ? message.status : null;
            if (status === 'Success') {
              handleResolve(logResult);
              return;
            }
            if (status === 'Failed' || status === 'Fail' || status === 'Error') {
              handleReject(new Error('Operation failed: ' + status));
              return;
            }
            // 其他状态（如 Pending/undefined）继续轮询
          } catch (error) {
            // 忽略瞬时错误，继续轮询直到超时
          }
        };
        intervalId = setInterval(checkOnce, intervalMs);
        timeoutId = setTimeout(() => {
          // 超时视为错误（包括仍为 Pending 的情况）
          handleReject(new Error('Timeout waiting for result'));
        }, timeoutMs);
        // 立即执行一次检查，加快首次响应
        checkOnce();
      });
    };
    // 保存 token 到本地与内存（db.set 异步）
    towngasSoap.prototype.saveUserTokenToDB = async (userToken, expiresInSec) => {
      try {
        const numericExpiresIn = Number(expiresInSec || 0);
        const nowMs = Date.now();
        const expiresNow = nowMs + (isNaN(numericExpiresIn) ? 0 : numericExpiresIn * 1000);
        this.props.userToken = userToken || '';
        this.props.expiresIn = numericExpiresIn;
        this.props.expiresNow = expiresNow;
        if (typeof db !== 'undefined' && db && typeof db.set === 'function') {
          await db.set('towngas_userToken', this.props.userToken);
          await db.set('towngas_expiresIn', String(this.props.expiresIn));
          await db.set('towngas_expiresNow', String(this.props.expiresNow));
        }
      } catch (e) {
        // 忽略存储异常，保留内存值
      }
    };
    // 从本地加载 token 到内存（db.get 异步）
    towngasSoap.prototype.loadUserTokenFromDB = async () => {
      let storedToken = '';
      let storedExpiresIn = '';
      let storedExpiresNow = '';
      try {
        if (typeof db !== 'undefined' && db) {
          if (typeof db.get === 'function') {
            storedToken = (await db.get('towngas_userToken')) || '';
            storedExpiresIn = (await db.get('towngas_expiresIn')) || '';
            storedExpiresNow = (await db.get('towngas_expiresNow')) || '';
          }
        }
      } catch (e) {
        // 忽略读取异常
      }
      const numericExpiresIn = Number(storedExpiresIn || 0);
      const numericExpiresNow = Number(storedExpiresNow || 0);
      if (storedToken) this.props.userToken = storedToken;
      if (!isNaN(numericExpiresIn)) this.props.expiresIn = numericExpiresIn;
      if (!isNaN(numericExpiresNow) && numericExpiresNow > 0) this.props.expiresNow = numericExpiresNow;
      return {
        userToken: storedToken,
        expiresIn: this.props.expiresIn,
        expiresNow: this.props.expiresNow,
      };
    };
    // 判断内存中的 token 是否有效（未过期且存在）
    towngasSoap.prototype.isUserTokenValid = () => {
      const token = this.props.userToken;
      const expiresNow = Number(this.props.expiresNow || 0);
      if (!token) return false;
      if (!expiresNow || isNaN(expiresNow)) return false;
      return Date.now() < expiresNow;
    };
    // 通用查询：优先返回内存有效 token，否则尝试从本地读取（异步）
    towngasSoap.prototype.getValidUserToken = async () => {
      if (this.isUserTokenValid()) {
        return this.props.userToken;
      }
      const loaded = await this.loadUserTokenFromDB();
      const expiresNow = Number(loaded && loaded.expiresNow ? loaded.expiresNow : 0);
      if (loaded && loaded.userToken && expiresNow && Date.now() < expiresNow) {
        return loaded.userToken;
      }
      // 返回空表示需要重新登录
      return '';
    };
  }
  return towngasSoap;
})();
