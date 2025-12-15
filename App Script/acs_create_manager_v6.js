window.acs_create_manager = function () {
  // instance pre check
  if (window.acsManager) {
    return window.acsManager;
  }

  // Cache Key
  const KEY_ACCESS_CONTROL_IDENTIFICATION_TYPE = 'ACCESS_CONTROL:IDENTIFICATION_TYPE';
  const KEY_ACCESS_CONTROL_IDENTIFICATION = 'ACCESS_CONTROL:IDENTIFICATION';
  const KEY_ACCESS_CONTROL_DEVICE = 'ACCESS_CONTROL:DEVICE';
  const KEY_ACCESS_CONTROL_LAST_MODIFIED = 'ACCESS_CONTROL:LAST_MODIFIED';
  const KEY_ACCESS_CONTROL_MASTER_DATA_MAIN = 'ACCESS_CONTROL:MASTER_DATA:MAIN'; // split master data cache
  // @deprecated
  const KEY_ACCESS_CONTROL_MASTER_DATA_DEVICE_ACCESS = 'ACCESS_CONTROL:MASTER_DATA:DEVICE_ACCESS';

  // ACSManager class
  function ACSManager() {
    this.emitter = mitt();
    /**
     * access control database
     * @link https://github.com/storesafe/cordova-sqlite-storage
     * @type {{ sqlBatch: Function, executeSql: Function, transaction: Function, readTransaction: Function }}
     */
    this.db = null;

    this._initStatus = [null, null, null, null]; // uuidType, uuid, device, store | 0 is init, other is not init

    this.mode = 'Access Controller';
    this.uuid = null;
    this.uuidType = null;
    this.device = null;
    this.lastModified = null;
    /**
     * @type {{ device_access: any, iot_schedule: any, device_button_group_list: any, device_command: any, device_button_group: any }}
     */
    this.store = null;

    this.debug = false;
    this._user = 'non-identity'; // user, admin, root

    this.signals = {}; // 0: green, not 0: red
    this.typeEnum = {
      '0': 'WIFI MAC',
      '1': 'LAN MAC',
      '2': 'SN',
    };

    // mqtt topics
    this._topics = new Set();
    // release functions
    this._releaseFuncs = [];
    // kone socket ips
    this._koneSocketIps = [];
    // is create
    this._isCreated = false;

    // mailbox sensor
    this._mailboxOpenLockMap = {};
    this._mailboxSensorBlockMap = {};
    this._mailboxSensorReleaseMap = {};

    // encoder
    this.encoder = new TextEncoder();

    // queue
    this._globalQueue = ACSManager.createQueue('GLOBAL');
    // 写入串口485数据队列，避免多条写入不控制速率导致数据异常
    this._serialportQueue = ACSManager.createQueue('SERIAL_PORT');

    // serial port lock set
    this._serialportLockSet = new Set();

    // comelit
    this.comelitConstant = {
      FRAME_FLAG: {
        SOT: 0xfb, // 帧起始符
        EOT: 0xfc, // 帧结束符
      },
      // VIP呼叫相关帧类型（文档表3.3.2）
      FRAME_TYPE: {
        VIP_CALL_FROM_BUTTON: 0x0e,
        VIP_CALL_FROM_DIRECTORY: 0x20,
        VIP_PARAM_RESPONSE: 0x2a,
      },
    };

    // internal ui
    this._scanNFCModal = null;
    this._rootLoginScreen = null;
  }

  // static
  ACSManager.createQueue = function (name) {
    function Queue(name) {
      this.name = name;
      this._innerTasks = [];
      this._isTaskRunning = false;
    }

    Queue.prototype.addTask = function (func) {
      this._innerTasks.push(func);

      if (!this._isTaskRunning) {
        this.runTask();
      }
    };

    Queue.prototype.runTask = async function () {
      if (this._innerTasks.length <= 0) {
        this._isTaskRunning = false;
        return;
      }

      this._isTaskRunning = true;
      const task = this._innerTasks.shift();
      try {
        await task();
      } catch (err) {
        console.error('Task Error: ', err);
      }

      this.runTask();
    };

    Queue.prototype.cancel = function () {
      this._innerTasks = [];
      this._isTaskRunning = false;
    };

    return new Queue(name);
  };

  ACSManager.captureScreen = async function () {
    // CDN https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
    const version = '1.4.1';
    const cdn = `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/${version}/html2canvas.min.js`;
    // TODO
  };

  ACSManager.prototype.mockCreate = async function () {
    try {
      if (this._isCreated) return;

      try {
        // hide navbar
        $('.page.page-home').find('.navbar').hide();
        $('.page.page-home').find('.ptr-preloader').hide();
      } catch (error) {
        // ignore
      }

      // acs db init
      await this.initDatabase();

      // created var set
      this._isCreated = true;
    } catch (error) {
      // ignore
    }
  };

  /**
   * create ACSManager instance
   */
  ACSManager.prototype.create = async function () {
    try {
      if (this._isCreated) return;

      try {
        // hide navbar
        $('.page.page-home').find('.navbar').hide();
        $('.page.page-home').find('.ptr-preloader').hide();
      } catch (error) {
        // ignore
      }

      // acs db init
      await this.initDatabase();

      // data prepare
      await this.preInit();
      await this.setupEnv();

      // inspect env
      try {
        await this.inspectEnv();
      } catch (error) {
        // ignore
      }

      // request last modified master data
      this.rebuildMasterData().catch(() => {});

      // created var set
      this._isCreated = true;

      // gateway homepage navigate
      if (erp.info.device_gateway && erp.info.device_gateway.display_homepage && erp.info.device_gateway.homepage_link) {
        mainView.router.navigate(erp.info.device_gateway.homepage_link, {
          clearPreviousHistory: true,
          reloadAll: true,
          animate: false,
        });
      }
    } catch (err) {
      console.error('ACSManager Create Error: ', `${err}`);

      mainView.router.navigate('/mobile-app/acs-access-control-initialize', {
        // clearPreviousHistory: true,
        // reloadAll: true,
        // animate: false,
      });
    }
  };

  ACSManager.prototype.initDatabase = async function () {
    this.db = window.sqlitePlugin.openDatabase({ name: 'access_control.db', location: 'default' });

    // Device Access Table
    await this.executeSql(`
    CREATE TABLE IF NOT EXISTS \`tab_device_access\` (
      \`name\`                                VARCHAR(140) PRIMARY KEY,
      \`device\`                              VARCHAR(200) NOT NULL,
      \`device_button_group\`                 VARCHAR(200) NOT NULL,
      \`status\`                              VARCHAR(140) DEFAULT \`Pending\`,
      \`access_type\`                         VARCHAR(140) NOT NULL,
      \`guest_email\`                         VARCHAR(140),
      \`avatar\`                              TEXT,
      \`qr_code\`                             VARCHAR(200),
      \`pin\`                                 VARCHAR(140),
      \`pin_remark\`                          VARCHAR(140),
      \`key_card_id\`                         VARCHAR(140),
      \`key_card_secret\`                     VARCHAR(140),
      \`serial_port_code\`                    VARCHAR(140),
      \`octopus_card_id\`                     VARCHAR(140),
      \`octopus_check_digit\`                 VARCHAR(140),
      \`octopus_old_card_id\`                 VARCHAR(140),
      \`car_plate_id\`                        VARCHAR(140),
      \`one_time_access\`                     INTEGER DEFAULT 0,
      \`disabled\`                            INTEGER DEFAULT 0,
      \`valid_from\`                          DATETIME,
      \`valid_to\`                            DATETIME,
      \`blocking_schedule\`                   TEXT,
      \`door\`                                VARCHAR(140),
      \`flat\`                                VARCHAR(140),
      \`reference\`                           VARCHAR(140),
      \`modified\`                            DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`creation\`                            DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `);

    await this.addAccessLevelColumn();

    // Device Access Log Table
    await this.executeSql(`
    CREATE TABLE IF NOT EXISTS \`tab_device_access_log\` (
      \`id\`                                  INTEGER PRIMARY KEY AUTOINCREMENT,
      \`description\`                         TEXT,
      \`creation\`                            DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Device Mail Log Table
    await this.executeSql(`
    CREATE TABLE IF NOT EXISTS \`tab_device_mail_log\` (
      \`id\`                                  INTEGER PRIMARY KEY AUTOINCREMENT,
      \`door\`                                VARCHAR(140),
      \`device\`                              VARCHAR(200),
      \`timestamp\`                           DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`reference_local\`                     VARCHAR(200),
      \`status\`                              VARCHAR(140),
      \`details\`                             TEXT,
      \`device_button_group\`                 VARCHAR(200)
    );
    `);
  };

  ACSManager.prototype.preInit = async function () {
    if (!this.uuidType) {
      const uuidType = await db.get(KEY_ACCESS_CONTROL_IDENTIFICATION_TYPE);
      if (!uuidType) {
        throw new Error('Identification type not found');
      }
      this.uuidType = uuidType;
      this.setInitStatus(0, 0);
    }

    if (!this.uuid) {
      const uuid = await db.get(KEY_ACCESS_CONTROL_IDENTIFICATION);
      if (!uuid) {
        throw new Error('Identification not found');
      }
      this.uuid = uuid;
      this.setInitStatus(1, 0);
    }

    if (!this.store) {
      const master_data = await db.get(KEY_ACCESS_CONTROL_MASTER_DATA_MAIN);
      const last_modified = await db.get(KEY_ACCESS_CONTROL_LAST_MODIFIED);
      if (!master_data || !last_modified) {
        throw new Error('Master data not found');
      }

      this.lastModified = last_modified;
      this.store = JSON.parse(master_data);

      // const device_access = await db.get(KEY_ACCESS_CONTROL_MASTER_DATA_DEVICE_ACCESS);
      // if (device_access) {
      //   this.store.device_access = JSON.parse(device_access);
      // }

      this.setInitStatus(3, 0);
    }

    if (!this.device) {
      const device = await db.get(KEY_ACCESS_CONTROL_DEVICE);
      if (!device) {
        throw new Error('Device not found');
      }
      this.device = JSON.parse(device);
      this.setInitStatus(2, 0);
    }
  };

  ACSManager.prototype.setupEnv = async function () {
    // online log
    this.uploadGatewayOnlineLog().catch(() => {});

    // mock dot dot dot
    this.createMockBackInvisibleBlock();

    // listener and so on...
    await this._registerAllEvent();

    // devtool
    await this.startDevtool();

    // com path init
    const maxComPort = 5;
    // foreach 1 - 4
    for (let i = 1; i <= maxComPort; i++) {
      const device_name = this.getSetting(`com${i}_device_name`);

      if (device_name) {
        this.updateSignal(device_name, 0);

        try {
          const device_path = this.getSetting(`com${i}_path`);
          const device_device_baudrate = this.getSetting(`com${i}_device_baudrate`)
            ? parseInt(this.getSetting(`com${i}_device_baudrate`))
            : null;

          await Capacitor.Plugins.YoswitSerialPort.connect({
            deviceName: device_name,
            baudRate: device_device_baudrate,
            path: device_path,
          });
        } catch (err) {
          this.updateSignal(device_name, 1);
        }
      }
    }

    // kone socket init
    const kone_lift_ip_address = this.getSetting('kone_lift_ip_address');
    if (kone_lift_ip_address) {
      const ips = kone_lift_ip_address.split(',').filter((x) => x.trim());
      if (ips.length > 0) {
        this._koneSocketIps = ips;

        // connect
        this._koneSocketIps.forEach((ip) => {
          this.updateSignal('ss:' + ip + ':2004', 1);
          Capacitor.Plugins.YoswitSocket.connect({
            hostname: ip,
            port: 2004,
            opt: {
              timeout: 10 * 1000,
            },
          });

          this.updateSignal('ss:' + ip + ':2005', 1);
          Capacitor.Plugins.YoswitSocket.connect({
            hostname: ip,
            port: 2005,
            opt: {
              timeout: 10 * 1000,
            },
          });
        });

        const heartbeatTask = () => {
          try {
            this._koneSocketIps.forEach((ip) => {
              const timestamp = this.dateToWindowsFiletimeHex(new Date(), false);

              Capacitor.Plugins.YoswitSocket.writeHex({
                hostname: ip,
                port: 2004,
                hex: `800000001180008002${timestamp}`,
              }).catch(() => {});

              Capacitor.Plugins.YoswitSocket.writeHex({
                hostname: ip,
                port: 2005,
                hex: `800000001180028002${timestamp}`,
              }).catch(() => {});
            });
          } catch (error) {
            console.error('Kone Lift Heartbeat Error: ', error);
          }

          // loop
          setTimeout(heartbeatTask, (this.getSetting('kone_lift_heartbeat_interval') || '5') * 1 * 1000);
        };

        // heartbeat start
        setTimeout(() => {
          heartbeatTask();
        }, 1000);
      }
    }

    // face recognition
    try {
      if (this.getSetting('face_recognition_enabled') === 'true') {
        this.updateSignal('Face-Recognition', 1);
        await Capacitor.Plugins.FaceRecognition.activeEngine({ activeKey: this.getSetting('face_recognition_active_key') });
      }
    } catch (error) {
      console.error('Face Recognition Error: ', error);
    }

    // clean log
    try {
      await Capacitor.Plugins.YoswitDeviceInfo.addScheduleJob({
        'name': 'Clean Octopus Payment Log',
        'trigger_at': '2024-01-01T00:00',
        'interval': 24 * 60, // minutes
        'button_group': `CLEAN_LOG_OLDER_THAN_${this.getSetting('clear_octopus_transaction_log_after') || '120'}_DAYS`,
        'redo_in_minutes': 0,
        'is_disabled': 0,
      });
    } catch (error) {
      // ignore
    }

    // remove offline global tip banner
    try {
      this.forbiddenNetworkChangeBanner();
    } catch (error) {
      // ignore
    }
  };

  ACSManager.prototype.inspectEnv = async function () {
    // avoid multiple inspection
    if (this._inspected) {
      return;
    }

    let resp = null;

    try {
      resp = await http2.request({
        url: '/api/method/appv6.getAppSetting',
        method: 'GET',
        timeout: 15,
        cacheStrategy: false,
        params: {
          appId: erp.appId,
        },
      });
    } catch (error) {
      // ignore
    }

    if (!resp) {
      return;
    }

    const serverSetting = resp.data.config;
    const localSetting = erp.settings[erp.appId];

    if (serverSetting.role_profile !== localSetting.role_profile) {
      erp.settings[erp.appId] = serverSetting;
      // resave local settings
      await db.set('appSettings', JSON.stringify(erp.settings));

      // tmp fix for main page script
      if (localSetting.main_page_script !== serverSetting.main_page_script) {
        erp.info.device_gateway.display_homepage = 1;
        erp.info.device_gateway.homepage_link = serverSetting.main_page_script;
      }

      throw new Error('Role Profile Changed');
    }

    this._inspected = true;
  };

  ACSManager.prototype._registerAllEvent = async function () {
    // SerialPort listener
    try {
      await Capacitor.Plugins.YoswitSerialPort.removeAllListeners();

      await Capacitor.Plugins.YoswitSerialPort.addListener('SerialPortConnectEvent', (event) => {
        console.log('SerialPortConnectEvent', event);

        if (event.description === 'Connected') {
          this.updateSignal(event.device, event.code === 0 ? 0 : 1);
        } else {
          this.updateSignal(event.device, 1);
        }

        this.emitter.emit('cap:serial-port:connect', event);
      });

      await Capacitor.Plugins.YoswitSerialPort.addListener('SerialPortReceiveEvent', (event) => {
        console.log('SerialPortReceiveEvent', event);

        this.emitter.emit('cap:serial-port:receive', event);

        if (event.code === 0 && event.device === 'Mailbox') {
          this.collectMailboxSerialSigal(event.data.data);
        }
      });

      await Capacitor.Plugins.YoswitSerialPort.addListener('SerialPortCommandReceiveEvent', (event) => {
        console.log('SerialPortCommandReceiveEvent', event);

        this.emitter.emit('cap:serial-port:command-receive', event);
      });
    } catch (err) {
      console.error('SerialPort listener init error: ', err);
    }

    // Socket listener
    try {
      await Capacitor.Plugins.YoswitSocket.removeAllListeners();

      await Capacitor.Plugins.YoswitSocket.addListener('SocketConnectEvent', (event) => {
        const ip = event.hostname;

        if (event.code === 0) {
          this.emitter.emit('cap:socket:connect', event);
          this.updateSignal(`ss:${ip}:${event.port}`, 0);
        } else {
          this.emitter.emit('cap:socket:disconnect', event);
          this.updateSignal(`ss:${ip}:${event.port}`, 1);

          // reconnect in 5s later
          setTimeout(() => {
            Capacitor.Plugins.YoswitSocket.connect({
              hostname: ip,
              port: event.port,
              opt: {
                timeout: 10 * 1000,
              },
            });
          }, 5000);
        }
      });

      await Capacitor.Plugins.YoswitSocket.addListener('SocketReceiveEvent', (event) => {
        this.emitter.emit('cap:socket:receive', event);
      });
    } catch (err) {
      console.error('Socket listener init error: ', err);
    }

    // Face Recognition listener
    try {
      await Capacitor.Plugins.FaceRecognition.removeAllListeners();

      await Capacitor.Plugins.FaceRecognition.addListener('callback', (event) => {
        console.log('FaceRecognition callback: ', event);

        if (event.code === 115000) {
          // active engine success
          Capacitor.Plugins.FaceRecognition.init()
            .then(() => {
              this.updateSignal('Face-Recognition', 0);

              this.emitter.emit('cap:face-recognition:init');
            })
            .catch((error) => {
              console.error('Face-Recognition Init Error: ', error);
              this.updateSignal('Face-Recognition', 1);
            });
        } else if (event.code === 115001) {
          // active engine failed
          this.updateSignal('Face-Recognition', 1);
        } else if (event.code === 115020) {
          // recognition state success
          this.checkDeviceAccess('Avatar', event.data.name).catch((error) => console.error('Check Device Access Error', error));
        } else {
          // RegisterStateSuccess or RegisterStateFailed
          this.emitter.emit('cap:face-recognition:register-state', event);
        }
      });
    } catch (err) {
      console.error('Face Recognition listener init error: ', err);
    }

    // MQTT listener
    try {
      if (!this.uuid) {
        throw new Error('Device not initialized');
      }

      // device topic
      const mqttTopic = md5(md5(this.uuid) + this.uuid);
      console.log('mqttTopic: ', mqttTopic);
      this._topics.add(mqttTopic);

      // cmd gateway topic
      const gateway = erp.info.device_gateway.name;
      const gatewayTopic = mqtt.topic.cmd;
      this._topics.add(gatewayTopic);

      const register = () => {
        Array.from(this._topics).forEach((topic) => {
          this.subscribeMqttTopic(topic, true);
        });

        emitter.off(mqttTopic);
        emitter.on(mqttTopic, (data) => {
          console.log('Access Control Receive MQTT message: ', data);

          try {
            const message = JSON.parse(data.message);
            console.log('MQTT message: ', message);

            if (typeof message.data === 'string') {
              try {
                // could not use JSON.parse will cause error, so try to eval
                const evalRet = new Function(`return (${message.data})`)();
                console.log('evalRet: ', evalRet);

                if (evalRet.from === 'erp_server' && evalRet.type === 'DOCTYPE' && evalRet.doctype === 'Device Access') {
                  // Device Access Reg
                  this.addTask(async () => {
                    await this.registerDeviceAccess(evalRet, true);
                  });
                } else if (
                  evalRet.from === 'erp_server' &&
                  evalRet.type === 'DOCTYPE' &&
                  evalRet.doctype === 'Guest Registration Precheckin'
                ) {
                  // wrap event
                  this.emitter.emit('cap:mqtt:cmd:guest-precheckin:refresh', evalRet);
                } else if (evalRet.from === 'erp_server' && evalRet.type === 'SYSTEM' && evalRet.action === 'REBOOT') {
                  // Reboot
                  this.addTask(async () => {
                    this.restartApp();
                  });
                } else if (evalRet.from === 'erp_server' && evalRet.type === 'SYNC' && evalRet.action === 'SYNC_DEVICE_SETTING') {
                  // Device Setting Update
                  this.addTask(async () => {
                    await this.rebuildDeviceSettings();
                  });
                }
              } catch (err) {
                console.log('parse inner data error: ', err);
              }
            } else if (Object.prototype.toString.call(message.data) === '[object Object]') {
              const evalRet = message.data;

              if (evalRet.type === 'DOCTYPE' && evalRet.doctype === 'Guest Registration Precheckin' && evalRet.action === 'Refresh') {
                // wrap event
                this.emitter.emit('cap:mqtt:cmd:guest-precheckin:refresh', evalRet);
              }
            }
          } catch (err) {
            console.log('MQTT message parse error: ', err);
          }
        });

        emitter.off(gatewayTopic);
        emitter.on(gatewayTopic, (data) => {
          console.log('Access Control Receive MQTT message: ', data);

          try {
            const message = JSON.parse(data.message);
            console.log('MQTT message: ', message);

            if (typeof message.data !== 'string') {
              if (message.data.command === 'Control' && message.data.function === 'doorHelp.open') {
                this.emitter.emit('cap:mqtt:cmd:doorHelp.open', data);

                const button_group = this.getSetting('mqtt_open_lock_button_group');
                if (!button_group) return;

                this.triggerButtonGroup(button_group).catch((error) => {
                  console.error('Trigger Button Group Error: ', error);
                });
              } else if (message.data.command === 'Control' && message.data.function === 'doorHelp.close') {
                this.emitter.emit('cap:mqtt:cmd:doorHelp.close', data);

                const button_group = this.getSetting('mqtt_close_lock_button_group');
                if (!button_group) return;

                this.triggerButtonGroup(button_group).catch((error) => {
                  console.error('Trigger Button Group Error: ', error);
                });
              } else if (message.data.command === 'Control' && message.data.function === 'lockerHelp.open') {
                this.emitter.emit('cap:mqtt:cmd:lockerHelp.open', data);
              }
            }
          } catch (err) {
            console.log('MQTT message parse error: ', err);
          }
        });
      };

      const online_cb = async () => {
        this.updateSignal('mqtt', 0);
        register();
      };

      const offline_cb = async () => {
        this.updateSignal('mqtt', 1);
      };

      emitter.off('mqtt.onOnline', online_cb);
      emitter.on('mqtt.onOnline', online_cb);
      emitter.off('mqtt.onOffline', offline_cb);
      emitter.on('mqtt.onOffline', offline_cb);

      if (mqtt.connected) {
        this.updateSignal('mqtt', 0);
        register();
      }
    } catch (err) {
      console.error('MQTT listener init error: ', err);
    }

    // Device Info Listener
    try {
      await Capacitor.Plugins.YoswitDeviceInfo.removeAllListeners();

      // Schedule Job Event
      await Capacitor.Plugins.YoswitDeviceInfo.addListener('ScheduleJobEvent', async (event) => {
        console.log('ScheduleJobEvent: ', event);

        this.emitter.emit('cap:device-info:schedule-job', event);

        // complete job
        Capacitor.Plugins.YoswitDeviceInfo.completeScheduleJobTask({ name: event.name }).catch((error) => {
          console.error('completeScheduleJobTask', error);
        });

        // trigger button group
        let triggerError = null;
        try {
          if (!event.button_group) {
            throw new Error('Button Group not found');
          }

          if (event.name.startsWith('Door Blocking - ')) {
            await this.triggerDoorBlockingSchedule(event.name);
          } else {
            await this.triggerButtonGroup(event.button_group);
          }

          Capacitor.Plugins.YoswitDeviceInfo.saveScheduleJobLog({ id: event.id, status: 'Success' }).catch((error) => {
            console.error('saveScheduleJobLog', error);
          });
        } catch (error) {
          triggerError = error;

          Capacitor.Plugins.YoswitDeviceInfo.saveScheduleJobLog({ id: event.id, status: 'Failed', log: `${error}` }).catch((error) => {
            console.error('saveScheduleJobLog', error);
          });
        } finally {
          // create device access log from special event
          let access_type = null;

          if (event.name.startsWith('Door Blocking - ')) {
            access_type = 'Door Blocking Schedule';
          } else if (event.name.startsWith('Auto Open - ')) {
            access_type = 'Auto Open';
          }

          if (access_type) {
            setTimeout(() => {
              try {
                this.createDeviceAccessLog(access_type, event.name, triggerError, event);
              } catch (error) {
                // ignore
              }
            }, 0);
          }
        }
      });
    } catch (err) {
      console.error('Device Info listener init error: ', err);
    }

    // network status change
    try {
      const onNetworkChange = window.lodash.debounce(() => {
        this.healthCheck();
      }, 2000);

      emitter.on('cap:network:networkStatusChange', onNetworkChange);
    } catch (error) {
      // ignore
    }

    try {
      // app logout need clear
      const logoutFn = async () => {
        await this.reset();
        window.acsManager = null;

        // remove all listeners
        emitter.off('app:user:logout', logoutFn);
      };
      emitter.on('app:user:logout', logoutFn);
    } catch (error) {
      // ignore
    }
  };

  ACSManager.prototype.reset = async function () {
    await db.set(KEY_ACCESS_CONTROL_IDENTIFICATION_TYPE, '');
    await db.set(KEY_ACCESS_CONTROL_IDENTIFICATION, '');
    await db.set(KEY_ACCESS_CONTROL_MASTER_DATA_MAIN, '');
    await db.set(KEY_ACCESS_CONTROL_MASTER_DATA_DEVICE_ACCESS, '');
    await db.set(KEY_ACCESS_CONTROL_DEVICE, '');
    await db.set(KEY_ACCESS_CONTROL_LAST_MODIFIED, '');

    // clear db
    await this.executeSql('DELETE FROM `tab_device_access`;');
    await this.executeSql('DELETE FROM `tab_device_access_log`;');
    await this.executeSql('DELETE FROM `tab_device_mail_log`;');

    // clear runtime
    this.uuid = null;
    this.uuidType = null;
    this.device = null;
    this.lastModified = null;
    this.store = null;
  };

  ACSManager.prototype.setInitStatus = function (index, value) {
    if (index < 0 || index >= this._initStatus.length) {
      return;
    }
    this._initStatus[index] = value;
  };

  ACSManager.prototype.getInitStatus = function () {
    return this._initStatus;
  };

  ACSManager.prototype.setupFactory = async function (model, batch, overwrite = false) {
    if (!model || !batch) {
      throw new Error('Model and Batch is required');
    }

    const appInfo = await Capacitor.Plugins.App.getInfo();

    const DEFAULT_SETTINGS = this.createDefaultSettings();

    DEFAULT_SETTINGS['device_name'] = appInfo.name;
    DEFAULT_SETTINGS['access_app_version'] = `YO-ACS-v${appInfo.version}`;

    const batchResponse = await http2.request({
      method: 'GET',
      timeout: 15,
      url: encodeURI('/api/method/appv6.getFactoryCommand'),
      cacheStrategy: false,
      params: {
        batch: batch,
        model: model,
      },
    });

    Object.keys(batchResponse.data.command).forEach((key) => {
      try {
        const command = batchResponse.data.command[key];
        if (command.function) {
          const func = JSON.parse(command.function);
          if (func.type === 'device_setting' && func.pk === 'device_setting' && func.meta) {
            func.meta.forEach((meta) => {
              DEFAULT_SETTINGS[meta.key] = meta.value;
            });
          }
        }
      } catch (err) {
        console.error('Command Error: ', err);
      }
    });

    const data = {
      mac_address: this.uuid,
      guid: this.uuid,
      device_model: model,
      device_mode: this.mode,
      batch: batch,
      manufacture_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      settings: JSON.stringify(this.convertAndMigrateDeviceSettings(DEFAULT_SETTINGS)),
      firmware: DEFAULT_SETTINGS['access_app_version'],
      gateway: erp.info.device_gateway.name,
      override_settings: overwrite,
      gateway_title: erp.info.device_gateway.title,
    };

    const factoryResponse = await http2.request({
      method: 'POST',
      url: encodeURI('/api/method/appv6.acsDeviceFactory'),
      data: data,
    });

    const device = factoryResponse.data.data;
    this.device = device;
    await db.set(KEY_ACCESS_CONTROL_DEVICE, JSON.stringify(device));
  };

  ACSManager.prototype.rebuildMasterData = async function () {
    const response = await http2.request({
      method: 'GET',
      url: encodeURI('/api/method/appv6.getAccessControl'),
      timeout: 60 * 3, // seconds
      responseType: 'blob', // reduce memory usage
      cacheStrategy: false,
      params: {
        device: this.uuid,
        modified: this.lastModified || '',
      },
    });
    
    let master = await new Response(response.data).json();

    if (master['summary'] && Object.keys(master['summary']).length <= 0) {
      // no data to update
      return;
    }

    // check if last modified
    if (this.lastModified) {
      master = app.utils.extend(this.store || {}, master);
    }

    const device_access = master.device_access;
    delete master.device_access;

    const last_modified = master.modified;
    this.lastModified = last_modified;
    this.store = master;
    await db.set(KEY_ACCESS_CONTROL_MASTER_DATA_MAIN, JSON.stringify(master));
    // await db.set(KEY_ACCESS_CONTROL_MASTER_DATA_DEVICE_ACCESS, JSON.stringify(device_access));
    await db.set(KEY_ACCESS_CONTROL_LAST_MODIFIED, last_modified);
    await db.set(KEY_ACCESS_CONTROL_IDENTIFICATION, this.uuid);
    await db.set(KEY_ACCESS_CONTROL_IDENTIFICATION_TYPE, this.uuidType);

    // remount device access
    // this.store.device_access = device_access;

    // is initialized
    if (!this._isCreated) {
      const patientAlertId = setTimeout(() => {
        this.showToast(_('This may take a while, please wait...'), 8000);
      }, 8000);

      const accKeys = Object.keys(device_access) || [];
      for (let i = 0; i < accKeys.length; i++) {
        const acc = device_access[accKeys[i]];
        // ignore upload in factory
        acc.status = 'Registered';

        try {
          await this.registerDeviceAccess(acc);
        } catch (error) {
          // ignore
        }
      }

      clearTimeout(patientAlertId);
    } else {
      // prepare pending device acesss (schedule)
      this.prepareDeviceAccess(device_access).catch(() => {});
    }
  };

  ACSManager.prototype.prepareDeviceAccess = async function (device_access) {
    try {
      // old device access, need migrate
      const migrate = await db.get(KEY_ACCESS_CONTROL_MASTER_DATA_DEVICE_ACCESS);
      if (migrate) {
        const allAccess = JSON.parse(migrate);
        const allKeys = Object.keys(allAccess);
        for (let i = 0; i < allKeys.length; i++) {
          const acc = allAccess[allKeys[i]];
          // ignore upload in migrate
          acc.status = 'Registered';
          if (!acc.device) {
            acc.device = this.uuid;
          }

          try {
            await this.registerDeviceAccess(acc);
          } catch (error) {
            // ignore
          }
        }
      }

      // clear migrate
      await db.set(KEY_ACCESS_CONTROL_MASTER_DATA_DEVICE_ACCESS, '');
    } catch (error) {
      // ignore
    }

    try {
      // find auto open job to register
      if (device_access) {
        Object.values(device_access).forEach((access) => {
          if (access.status === 'Pending') {
            this.addTask(async () => {
              await this.registerDeviceAccess(access, true);
            });
          }
        });
      }
    } catch (error) {
      // ignore
    }
  };

  /**
   * 从ERP更新最新的Device Settings
   */
  ACSManager.prototype.rebuildDeviceSettings = async function () {
    if (!this.uuid) {
      throw new Error('Access control not initialized');
    }

    const response2 = await http2.request({
      method: 'GET',
      url: encodeURI('/api/resource/Device/' + this.uuid),
      cacheStrategy: false,
    });

    this.device = response2.data.data;

    const appInfo = await Capacitor.Plugins.App.getInfo();
    let DEFAULT_SETTINGS = this.createDefaultSettings();

    if (this.device) {
      this.device.settings.forEach((setting) => {
        DEFAULT_SETTINGS[setting.setting_type] = setting.setting;
      });
    }

    response2.data.data.settings.forEach((setting) => {
      DEFAULT_SETTINGS[setting.setting_type] = setting.setting;
    });

    // update version and name
    DEFAULT_SETTINGS['device_name'] = appInfo.name;
    DEFAULT_SETTINGS['access_app_version'] = `YO-ACS-v${appInfo.version}`;

    // fix & migrate settings
    DEFAULT_SETTINGS = this.convertAndMigrateDeviceSettings(DEFAULT_SETTINGS);
    this.device.settings = DEFAULT_SETTINGS;
    this.device.firmware = `YO-ACS-v${appInfo.version}`;

    // check if need start devtool
    await this.startDevtool();

    // update local
    await db.set(KEY_ACCESS_CONTROL_DEVICE, JSON.stringify(this.device));

    // update remote
    await http2.request({
      method: 'PUT',
      url: encodeURI('/api/resource/Device/' + this.uuid),
      data: {
        firmware: this.device.firmware,
        settings: this.device.settings,
      },
    });
  };

  /**
   * Migration Device Settings From Yoswit Access Control App (YO-ACC)
   *
   * New Com Device:
   * QRCode-Q300, NFC-Q300, SK100, QRCode-Q300-USB, OctopusAccess, MailBox
   * SerialPort, SerialPort-Urmet-VC, SerialPort-RS485, SerialPort-Mailbox, SerialPort-SerialToMQTT, SerialPort-Comelit
   *
   * SerialPort are generally only responsible for writing
   *
   * @param {Record<string, any>} settings
   */
  ACSManager.prototype.convertAndMigrateDeviceSettings = function (settings) {
    return Object.keys(settings)
      .map((key) => {
        if (key.startsWith('com')) {
          const setting = settings[key];

          if (setting === 'OCTOPUS-ACCESS-01') {
            settings[key] = 'OctopusAccess';
          } else if (setting === 'QR-Q300-01') {
            settings[key] = 'QRCode-Q300';
          } else if (setting === 'YO-RS485-01') {
            settings[key] = 'SerialPort-RS485';
          } else if (setting === 'URMET-VC-01') {
            settings[key] = 'SerialPort-Urmet-VC';
          } else if (setting === 'SERIAL-TO-MQTT-01') {
            settings[key] = 'SerialPort-SerialToMQTT';
          } else if (setting === 'YO-MAIL-01-READ' || setting === 'YO-MAIL-01') {
            settings[key] = 'Mailbox';
          } else if (setting === 'YO-MAIL-01-WRITE') {
            settings[key] = 'SerialPort-Mailbox';
          }
        }

        return key;
      })
      .map((key) => {
        return {
          setting_type: key,
          setting: settings[key] || 'null',
        };
      });
  };

  ACSManager.prototype.replaceDevice = async function (door, oldDevice) {
    if (!door || !oldDevice) return;

    await http2.request({
      url: encodeURI('/api/resource/Device Replacement'),
      method: 'POST',
      data: {
        docstatus: 1,
        door: door,
        existing_device: oldDevice,
        new_device: this.uuid,
      },
    });

    // wait for 5s and redownload device settings
    await this.sleep(5000);

    // redownload device settings
    await this.rebuildDeviceSettings();
  };

  /**
   * @param {string} access_type
   * @param {string | number} access_info
   * @param {any} ref
   * @param {boolean} withoutTrigger
   */
  ACSManager.prototype.checkDeviceAccess = async function (access_type, access_info, ref = null, withoutTrigger = false) {
    try {
      const now = dayjs();
      console.log('checkDeviceAccess');

      if (access_type === 'QR Code' && access_info.length >= 82) {
        // md5_email: md5(md5(email) + email + "yoswit")
        // datetime: YYYYMMDDHHmmss
        // signature: md5_email + datetime
        // checksum: md5(md5(signature) + signature + "yoswit")
        // qr_code: {{ md5_email + checksum + datetime }}
        // valid seconds, default 20s
        const dynamic_qr_code_valid_time = parseInt(this.getSetting('dynamic_qr_code_valid_time') || 20);
        const md5_email = access_info.substring(2, 2 + 32);
        const checksum = access_info.substring(2 + 32, 2 + 32 + 32);
        const time = access_info.substring(2 + 32 + 32, 2 + 32 + 32 + 14);
        const signature = md5_email + time;
        const checksum_check = md5(md5(signature) + signature + 'yoswit');

        // comparing checksum
        if (checksum_check !== checksum) {
          console.log(1);
          throw this.createDeviceAccessError('2000', null, access_info);
        }

        const date = dayjs(time, 'YYYYMMDDHHmmss');
        if (!date.isValid()) {
          console.log(2);

          throw this.createDeviceAccessError('2000', null, access_info);
        }

        if (now.diff(date, 'second') > dynamic_qr_code_valid_time) {
          console.log(3);

          throw this.createDeviceAccessError('2003', null, access_info);
        }

        access_info = md5_email;
        access_type = 'Dynamic QR Code';
      } else if (access_type === 'Octopus Card') {
        access_info = this.parseOctopusCardIDFromHex(access_info);
      }

      // record type map fieldname
      const map = {
        'QR Code': 'qr_code',
        'Key Card': 'key_card_id',
        'Secure Key Card': 'key_card_id',
        'AssaAbloy Hospitality': 'key_card_id',
        'Dynamic QR Code': 'qr_code', // md5 guest email
        'PIN': 'pin',
        'Octopus Card': 'octopus_card_id',
        'Car Plate': 'car_plate_id',
        'Avatar': 'name',
      };

      // accept access types
      const query_access_types = [access_type];
      if (access_type === 'Key Card') {
        query_access_types.push('Secure Key Card');
      }

      // accept query values
      const query_access_vals = query_access_types.filter((x) => map[x]).map((x) => `${map[x]} = '${access_info}'`);

      // sql query
      const sql = `
      SELECT 
        * 
      FROM 
        tab_device_access
      WHERE 
        access_type IN (${query_access_types.map((x) => `'${x}'`).join(',')}) AND
        valid_from <= '${now.format('YYYY-MM-DD HH:mm:ss')}' AND
        valid_to > '${now.format('YYYY-MM-DD HH:mm:ss')}' AND
        disabled != 1 AND
        (${query_access_vals.join(' OR ')})
      LIMIT 1;
      `;

      const sqlRs = await this.executeSql(sql);
      console.log('sqlRs', sqlRs);

      if (sqlRs.rows.length <= 0) {
        console.log(4);
        throw this.createDeviceAccessError('2001', null, access_info);
      }

      const access = sqlRs.rows.item(0);
      // check door blocking schedule permissions
      const checkRs = await this.checkDoorBlockingSchedulePermissions(access);
      console.log('checkDoorBlockingSchedulePermissions checkRs', checkRs);
      if (!checkRs) {
        throw this.createDeviceAccessError('No Permissions', null, access_info);
      }

      console.log(`[Check Access Item] - ${access.name}`, access);

      if (access.access_type === 'Dynamic QR Code') {
        // Dynamic QR Code real access info
        if (access.guest_email) {
          access_info = access.guest_email;
        }
      } else if (access.access_type === 'Secure Key Card') {
        // secure key card read access pass, ref is device type name
        try {
          await this.readSecureKeyCard(access.key_card_id, access.key_card_secret, ref);
        } catch (error) {
          console.log(5);

          throw this.createDeviceAccessError('2001', null, access_info);
        }
      }

      // blocking_schedule parse
      try {
        access.blocking_schedule = JSON.parse(access.blocking_schedule);
        if (!Array.isArray(access.blocking_schedule)) {
          access.blocking_schedule = [];
        }
      } catch (error) {
        access.blocking_schedule = [];
      }

      // check blocking schedule
      if (access.blocking_schedule && Array.isArray(access.blocking_schedule) && access.blocking_schedule.length > 0) {
        const weekly = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const isBlock = access.blocking_schedule.find((item) => {
          const schedule = item.schedule;

          if (weekly.indexOf(schedule) !== -1 && now.day() === weekly.indexOf(schedule)) {
            if (item.whole_day === 1) return true;

            if (!item.from_time || !item.to_time) return false;

            const start = dayjs(`${now.format('YYYY-MM-DD')} ${item.from_time}`);
            const end = dayjs(`${now.format('YYYY-MM-DD')} ${item.to_time}`);

            return now.isAfter(start) && now.isBefore(end);
          }

          // check table
          const iot_schedule = this.getStore('iot_schedule')[schedule];
          if (iot_schedule && iot_schedule.time_slot && iot_schedule.time_slot.length > 0) {
            const slot = iot_schedule.time_slot.find((x) => {
              const start = dayjs(`${x.date} ${x.from_time}`);
              const end = dayjs(`${x.date} ${x.to_time}`);
              return now.isAfter(start) && now.isBefore(end);
            });

            if (slot) return true;
          }

          return false;
        });

        if (isBlock) {
          console.log(6);

          throw this.createDeviceAccessError('2004', access, access_info);
        }
      }

      if (!withoutTrigger) {
        try {
          this.triggerButtonGroup(access.device_button_group).catch((error) => {
            console.error('Trigger Button Group Error: ', error);
          });
        } catch (err) {
          console.log(7);

          throw this.createDeviceAccessError('2005', access, access_info);
        }
      }

      // one time access
      if (access.one_time_access === 1) {
        access.disabled = 1;
        access.status = 'Used';

        this.updateDeviceAccessRecord(access, true, ['disabled', 'status']).catch(() => {});
      }

      // create log
      this.createDeviceAccessLog(access.access_type, access_info, access);
      // emit event
      acsManager.emitter.emit('app:access-control:access-checked', {
        type: access_type,
        value: access_info,
        ref: ref,
        access: access,
      });
      return access;
    } catch (err) {
      console.error('Check Device Access Error: ', err);

      // create log
      this.createDeviceAccessLog(access_type, access_info, err);
      // emit event
      acsManager.emitter.emit('app:access-control:access-checked', {
        type: access_type,
        value: access_info,
        ref: ref,
        error: err,
      });

      // wrap device access error
      if (err.isAccessError) {
        throw err;
      } else {
        console.log(8);

        throw this.createDeviceAccessError('2000', null, access_info);
      }
    }
  };

  /**
   * 查询device的door blocking schedule，并判断权限登记
   *
   * @param {object} access
   * @returns {boolean}
   */
  ACSManager.prototype.checkDoorBlockingSchedulePermissions = async function (access) {
    console.log('access', access);
    if (!access || !access.device) {
      return false;
    }
    const now = dayjs();
    // sql query
    const sql = `
      SELECT access_level
      FROM tab_device_access
      WHERE device = '${access.device}'
      AND access_type = 'Door Blocking Schedule'
      AND device_button_group = '${access.device_button_group}'
      AND valid_from <= '${now.format('YYYY-MM-DD HH:mm:ss')}' 
      AND valid_to > '${now.format('YYYY-MM-DD HH:mm:ss')}' 
      AND disabled = 0;
      `;
    const sqlRs = await this.executeSql(sql);
    const doorBlockingScheduleAccess = sqlRs.rows.item(sqlRs.rows.length - 1);
    console.log('checkDoorBlockingSchedulePermissions sqlRs', doorBlockingScheduleAccess);
    if (sqlRs.rows.length > 0) {
      if (!doorBlockingScheduleAccess.access_level) {
        return true;
      }
      const doorBlockingScheduleAccessLevel = Number(doorBlockingScheduleAccess.access_level);
      console.log('doorBlockingScheduleAccessLevel', doorBlockingScheduleAccessLevel);
      if (!access.access_level || Number(access.access_level) < doorBlockingScheduleAccessLevel) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };

  /**
   * 给 device access 表添加字段
   *
   */
  ACSManager.prototype.addAccessLevelColumn = async function () {
    // 检查字段是否已存在
    const { rows } = await this.executeSql(`
      PRAGMA table_info(tab_device_access);
    `);
    console.log('rows', rows);
    console.log('item', rows.item);
    console.log('item(0)', rows.item(0));

    let hasAccessLevel = false;
    for (let i = 0; i < rows.length; i++) {
      if (rows.item(i).name === 'access_level') {
        hasAccessLevel = true;
        break;
      }
    }

    if (!hasAccessLevel) {
      // 字段不存在时才执行添加操作
      const sql2 = await this.executeSql(`
        ALTER TABLE tab_device_access
        ADD COLUMN access_level VARCHAR(140);
      `);
      console.log('addAccessLevelColumn sqlRes', sql2);
    }
  };

  /**
   * sendRS485有特殊处理，格控存在开 - 隔时间 - 关的情况，连续触发时，需要特殊处理
   *
   * @param {string} button_group
   * @param {null | undefined | string} button_type
   * @returns
   */
  ACSManager.prototype.triggerButtonGroup = function (button_group, button_type) {
    // find command list
    const command_list = Object.values(this.getStore('device_button_group_list'))
      .filter((x) => {
        const isParent = x.parent === button_group;
        let allowType = true;

        if (button_type) {
          allowType = x.button_type === button_type;
        }

        return isParent && allowType;
      })
      .map((bg) => {
        return this.getStore('device_command')[bg.device_command];
      })
      .filter((c) => {
        return !!c && c.function;
      });

    console.log(`[Trigger Button Group] ${button_group}`);
    console.log(`[Trigger Button Group] Command List: `, command_list);

    /**
     * @param {string | string[]} device_name
     * @returns
     */
    const getDefaultDevice = (device_name) => {
      if (!Array.isArray(device_name)) {
        device_name = [device_name];
      }

      const device = device_name.map((e) => this.getSerialPortDevice(e)).filter((e) => !!e);
      if (device.length <= 0) {
        return this.getSetting('com1_device_name');
      } else {
        return device[0].device_name;
      }
    };

    // find has sendRS485, and clear previous queue
    if (command_list.findIndex((cmd) => cmd.function.includes('sendRS485')) !== -1) {
      // clear queue
      this._serialportQueue.cancel();
    }

    // 立即循环执行所有的Command
    command_list.forEach(async (cmd, idx) => {
      const promises = [];

      try {
        const func = cmd.function;
        const funcArgs = JSON.parse(func);

        if (funcArgs.func === 'sendRS485' && funcArgs.parameter) {
          const hex = funcArgs.parameter.split(',').map((x) => x.trim());
          if (hex.length <= 0) {
            return;
          }

          const device_name = getDefaultDevice(['SerialPort-RS485', 'SerialPort']);
          if (!device_name) {
            throw new Error('Device name not found');
          }

          let duration = 6000;
          if (funcArgs.delay) {
            duration = funcArgs.delay;
          } else if (this.getSetting('duration_close_door')) {
            try {
              duration = parseInt(this.getSetting('duration_close_door')) * 1000;
            } catch (error) {
              // ignore
            }
          }

          // hex set
          const setId = `${device_name}:${funcArgs.parameter}`;
          const triggerId = Date.now();
          const setKey = setId + '||' + triggerId;
          this._serialportLockSet.add(setKey);

          const rs485Queue = ACSManager.createQueue(setId);

          const canRun = () => {
            const locks = Array.from(this._serialportLockSet)
              .filter((x) => x.startsWith(setId) && !x.endsWith('||' + triggerId))
              .map((x) => {
                const [pid, tid] = x.split('||');
                return {
                  pid: pid,
                  tid: parseInt(tid),
                };
              })
              .sort((a, b) => {
                return a.tid - b.tid;
              });

            if (locks.length <= 0) {
              return true;
            } else {
              return locks[0].tid < triggerId;
            }
          };

          for (let i = 0; i < hex.length; i++) {
            rs485Queue.addTask(async () => {
              if (!canRun()) {
                return;
              }

              await this.writeDataToSerialPort({
                deviceName: device_name,
                message: hex[i],
              });
            });

            // if not last, add delay
            if (i !== hex.length - 1) {
              rs485Queue.addTask(async () => {
                await this.sleep(duration);
              });
            }
          }

          rs485Queue.addTask(async () => {
            this._serialportLockSet.delete(setKey);
          });
        } else if (funcArgs.func === 'openMailBox' && funcArgs.parameter) {
          const device_name = getDefaultDevice(['SerialPort-Mailbox', 'Mailbox']);
          if (!device_name) {
            throw new Error('Device name not found');
          }

          promises.push(() => {
            return new Promise(async (resolve, reject) => {
              try {
                console.log(`[Command:openMailBox] ${device_name} ${funcArgs.parameter}`);

                await this.writeDataToSerialPort({
                  deviceName: device_name,
                  message: funcArgs.parameter,
                });

                // 临时处理，锁板更新后应根据开锁反馈（2025-02-25）
                // try {
                //   // create device mail log
                //   this.collectMailboxSerialSigal(funcArgs.parameter);
                // } catch (error) {
                //   // ignore
                // }

                resolve(true);
              } catch (err) {
                reject(err);
              }
            });
          });
        } else if ((funcArgs.func === 'openLock' || funcArgs.func === 'closeLock') && funcArgs.value) {
          promises.push(() => {
            return new Promise(async (resolve, reject) => {
              try {
                console.log(`[Command:${funcArgs.func}] ${funcArgs.value}`);
                await Capacitor.Plugins.YoswitGPIO.writeGpioByPin({
                  selectedBoard: this.getSetting('device_board'),
                  pin: this.getSetting('io1'),
                  value: `${funcArgs.value}`.trim(),
                });
                resolve(true);
              } catch (err) {
                reject(err);
              }
            });
          });
          promises.push(() => {
            return new Promise(async (resolve) => {
              const duration = parseInt(this.getSetting('duration_close_door')) * 1000;
              console.log(`[Command:${funcArgs.func}] Duration: ${duration}`);
              await this.sleep(duration);
              resolve(true);
            });
          });
          promises.push(() => {
            return new Promise(async (resolve, reject) => {
              try {
                console.log(`[Command:${funcArgs.func}] ${funcArgs.value}`);
                await Capacitor.Plugins.YoswitGPIO.writeGpioByPin({
                  selectedBoard: this.getSetting('device_board'),
                  pin: this.getSetting('io1'),
                  value: '0',
                });
                resolve(true);
              } catch (err) {
                reject(err);
              }
            });
          });
        } else if (funcArgs.func === 'sendSocketKoneLiftCommand' && Array.isArray(funcArgs.cmd) && funcArgs.cmd.length > 0) {
          // All command need big endian 80
          funcArgs.cmd.forEach((cmd) => {
            if (cmd.type === 'Open_Access_For_DOP' && cmd.parameter) {
              this._koneSocketIps.forEach((ip) => {
                promises.push(() => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      const now = new Date();
                      const timestamp = this.dateToWindowsFiletimeHex(now, false);
                      const dop_id = this.getSetting('kone_lift_terminal_id');
                      const floor_id = this.getSetting('kone_lift_floor_id');
                      const open_timeout = this.getSetting('kone_lift_open_timeout') * 1;

                      const dop_id_hex = this.numToHex(dop_id, 1, false);
                      const open_timeout_hex = this.numToHex(open_timeout * 1000, 2, false);
                      const floor_id_hex = this.numToHex(floor_id, 2, false);
                      const writeHex = cmd.parameter
                        .replace('{{timestamp}}', timestamp)
                        .replace('{{dop_id}}', dop_id_hex)
                        .replace('{{floor_id}}', floor_id_hex)
                        .replace('{{open_timeout}}', open_timeout_hex);

                      Capacitor.Plugins.YoswitSocket.writeHex({
                        hostname: ip,
                        port: 2005,
                        hex: writeHex,
                      });
                      resolve();
                    } catch (err) {
                      reject(err);
                    }
                  });
                });
              });
            } else if (cmd.type === 'Destination_Call' && cmd.parameter) {
              this._koneSocketIps.forEach((ip) => {
                promises.push(() => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      const now = new Date();
                      const timestamp = this.dateToWindowsFiletimeHex(now, false);
                      const terminal_id = this.getSetting('kone_lift_terminal_id');
                      const floor_id = this.getSetting('kone_lift_floor_id');

                      const terminal_id_hex = this.numToHex(terminal_id, 2, false);
                      const floor_id_hex = this.numToHex(floor_id, 1, false);
                      const writeHex = cmd.parameter
                        .replace('{{timestamp}}', timestamp)
                        .replace('{{terminal_id}}', terminal_id_hex)
                        .replace('{{floor_id}}', floor_id_hex);

                      Capacitor.Plugins.YoswitSocket.writeHex({
                        hostname: ip,
                        port: 2004,
                        hex: writeHex,
                      });
                      resolve();
                    } catch (err) {
                      reject(err);
                    }
                  });
                });
              });
            } else if (cmd.type === 'DOP_Global_Default_Access_Mask' && cmd.parameter) {
              this._koneSocketIps.forEach((ip) => {
                promises.push(() => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      const now = new Date();
                      if (cmd.time_ranges && Array.isArray(cmd.time_ranges) && cmd.time_ranges.length > 0) {
                        const currentTime = dayjs(now).format('HH:mm:ss');
                        if (!this.isTimeWithinRanges(currentTime, cmd.time_ranges)) {
                          resolve();
                          return;
                        }
                      }

                      const timestamp = this.dateToWindowsFiletimeHex(now, false);
                      const writeHex = cmd.parameter.replace('{{timestamp}}', timestamp);

                      Capacitor.Plugins.YoswitSocket.writeHex({
                        hostname: ip,
                        port: 2005,
                        hex: writeHex,
                      });
                      resolve();
                    } catch (err) {
                      reject(err);
                    }
                  });
                });
              });
            }
          });
        } else if (funcArgs.func === 'setGpio' && funcArgs.value) {
          promises.push(() => {
            return new Promise(async (resolve, reject) => {
              try {
                const [pin, value] = funcArgs.value.split(',').map((x) => x.trim());

                await Capacitor.Plugins.YoswitGPIO.writeGpioByPin({
                  selectedBoard: this.getSetting('device_board'),
                  pin: pin,
                  value: value,
                });
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          });
        } else if (funcArgs.func === 'mqtt_command' && funcArgs.value) {
          // TODO: MQTT Command
        }
      } catch (err) {
        console.error(`[Command:Parse:${cmd.name}]`, err);
      }

      // execute all promises
      try {
        for (let i = 0; i < promises.length; i++) {
          try {
            await promises[i]();
          } catch (err) {
            // ignore
          }
        }
      } catch (err) {
        console.error(`[Command:Running:${cmd.name}]`, err);
      }
    });

    // compitable
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  };

  /**
   * MQTT下发Device Access注册
   */
  ACSManager.prototype.registerDeviceAccess = async function (record, forceUpload = false) {
    // as need to upload
    const upload = forceUpload ? true : record.status === 'Pending';

    try {
      // update status
      if (record.disabled === 1) {
        record.status = 'Disabled';
      } else {
        record.status = 'Registered';
      }

      if (record.access_type === 'Door Blocking Schedule') {
        await this.createDoorBlockingScheduleFromDeviceAccess(record);
      } else if (record.access_type === 'Door Access Schedule') {
        // TODO
      } else if (record.access_type === 'Auto Open') {
        await this.createAutoOpenScheduleFromDeviceAccess(record);
      } else if (record.access_type === 'Avatar') {
        await this.createFaceRecognitionFromDeviceAccess(record);
      }
    } catch (err) {
      console.log('Register Device Access Error: ', err);
      console.error('Register Device Access Error: ', err);
      record.status = 'Registration Failed';
    }

    // upload
    try {
      await this.updateDeviceAccessRecord(record, upload, ['status']);
    } catch (error) {
      if (!http2.isHttpError(error)) {
        throw error;
      }
    }
  };

  /**
   * Create Face Recognition
   *
   * @param {Record<string, any>} record
   */
  ACSManager.prototype.createFaceRecognitionFromDeviceAccess = async function (record) {
    if (this.getSignal('Face-Recognition') !== 0) {
      throw new Error('Face Recognition is not ready');
    }

    if (!record || !record.name || !record.device_button_group || !record.valid_from || !record.valid_to || !record.avatar) {
      return;
    }

    if (record.disabled === 1) {
      await Capacitor.Plugins.FaceRecognition.clearFace({ name: record.name });
      return;
    }

    const create_dir = () => {
      return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(
          cordova.file.externalCacheDirectory,
          (dirEntry) => {
            dirEntry.getDirectory('face_recognition', { create: true }, resolve, reject);
          },
          reject
        );
      });
    };

    // create face_recognition directory
    await create_dir();

    // download avatar
    const resp = await http2.request({
      url: record.avatar,
      method: 'DOWNLOAD',
      timeout: 30,
      file: {
        path: cordova.file.externalCacheDirectory + 'face_recognition/' + record.name + '.jpg',
        name: `${record.name}.jpg`,
      },
    });

    return new Promise((resolve, reject) => {
      const on = (event) => {
        if (!event.data || event.data.name !== record.name) {
          return;
        }

        this.emitter.off('cap:face-recognition:register-state', on);

        if (event.code === 115010) {
          resolve(true);
        } else {
          reject(new Error('Face Recognition Error'));
        }
      };

      this.emitter.on('cap:face-recognition:register-state', on);

      // start register
      Capacitor.Plugins.FaceRecognition.register({
        uri: resp.data.nativeURL,
        name: record.name,
      });
    });
  };

  /**
   * Auto Open Schedule Job
   *
   * Schedule Job Name Rule:
   * Auto Open - {record.name}
   * Auto Open - {record.name}
   *
   * @param {Record<string, any>} record
   * @returns
   */
  ACSManager.prototype.createAutoOpenScheduleFromDeviceAccess = async function (record) {
    if (!record || !record.name || !record.device_button_group || !record.valid_from || !record.valid_to) {
      return;
    }

    const job_name = `Auto Open - ${record.name}`;

    await Capacitor.Plugins.YoswitDeviceInfo.addScheduleJob({
      'name': job_name,
      'trigger_at': dayjs(record.valid_from).format('YYYY-MM-DDTHH:mm'),
      'interval': record.one_time_access === 1 ? 0 : 24 * 60, // minutes
      'button_group': record.device_button_group,
      'redo_in_minutes': 0,
      'is_disabled': record.disabled === 1 ? 1 : 0,
    });
  };

  /**
   * Door Blocking Schedule Schedule Job
   *
   * Schedule Job Name Rule:
   * Door Blocking - {record.name} - {time} - Open
   * Door Blocking - {record.name} - {time} - Close
   *
   * @param {Record<string, any>} record
   * @returns
   */
  ACSManager.prototype.createDoorBlockingScheduleFromDeviceAccess = async function (record) {
    if (!record || !record.name || !record.device_button_group || !record.valid_from || !record.valid_to) {
      return;
    }

    const valid_from_date = dayjs(record.valid_from);
    const valid_to_date = dayjs(record.valid_to);
    const now = dayjs();

    const queryResult = await Capacitor.Plugins.YoswitDeviceInfo.getAllScheduleJobs();
    const jobs = queryResult.value || [];

    // maybe need remove old job
    const oldJobNameArr = [];
    const newJobNameArr = [];
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].name.startsWith(`Door Blocking - ${record.name} - `)) {
        oldJobNameArr.push(jobs[i].name);
      }
    }

    // invalid schedule, immediately remove old job
    if (valid_to_date.isBefore(now) || record.disabled === 1) {
      for (let i = 0; i < oldJobNameArr.length; i++) {
        await Capacitor.Plugins.YoswitDeviceInfo.removeScheduleJob({ name: oldJobNameArr[i] });
      }
      return;
    }

    const openTimeSet = new Set();
    const closeTimeSet = new Set();

    // loop blocking_schedule
    if (record.blocking_schedule && Array.isArray(record.blocking_schedule) && record.blocking_schedule.length > 0) {
      record.blocking_schedule.forEach((schedule) => {
        if (schedule.from_time && schedule.to_time) {
          const open = dayjs(schedule.from_time, ['H:mm:ss', 'HH:mm:ss']).format('HH:mm');
          const close = dayjs(schedule.to_time, ['H:mm:ss', 'HH:mm:ss']).format('HH:mm');

          openTimeSet.add(open);
          closeTimeSet.add(close);
        }
      });
    }

    const openTimeArr = Array.from(openTimeSet);
    for (let i = 0; i < openTimeArr.length; i++) {
      const jobName = `Door Blocking - ${record.name} - ${openTimeArr[i]} - Open`;
      await Capacitor.Plugins.YoswitDeviceInfo.addScheduleJob({
        'name': jobName,
        'trigger_at': valid_from_date.format('YYYY-MM-DD') + 'T' + openTimeArr[i],
        'interval': 24 * 60, // minutes
        'button_group': record.device_button_group,
        'redo_in_minutes': 0,
        'is_disabled': record.disabled === 1 ? 1 : 0,
      });

      newJobNameArr.push(jobName);
    }

    const closeTimeArr = Array.from(closeTimeSet);
    for (let i = 0; i < closeTimeArr.length; i++) {
      const jobName = `Door Blocking - ${record.name} - ${closeTimeArr[i]} - Close`;
      await Capacitor.Plugins.YoswitDeviceInfo.addScheduleJob({
        'name': jobName,
        'trigger_at': valid_from_date.format('YYYY-MM-DD') + 'T' + closeTimeArr[i],
        'interval': 24 * 60, // minutes
        'button_group': record.device_button_group,
        'redo_in_minutes': 0,
        'is_disabled': record.disabled === 1 ? 1 : 0,
      });

      newJobNameArr.push(jobName);
    }

    // compare and remove old job
    for (let i = 0; i < oldJobNameArr.length; i++) {
      if (newJobNameArr.indexOf(oldJobNameArr[i]) === -1) {
        await Capacitor.Plugins.YoswitDeviceInfo.removeScheduleJob({ name: oldJobNameArr[i] });
      }
    }
  };

  /**
   * Trigger Door Blocking Schedule From Capactor Plugin, excute will check schedule and valid time
   *
   * @param {string} schedule_name
   * @returns
   */
  ACSManager.prototype.triggerDoorBlockingSchedule = async function (schedule_name) {
    if (!schedule_name) return;

    const [_, name, time, type] = schedule_name.split(' - ');

    // query device access
    const sql = `SELECT * FROM tab_device_access WHERE name = '${name}' AND access_type = 'Door Blocking Schedule' LIMIT 1;`;
    const sqlRs = await this.executeSql(sql);
    if (sqlRs.rows.length <= 0) {
      return;
    }

    const record = sqlRs.rows.item(0);
    const now = dayjs();

    // schedule is not start
    if (now.isBefore(dayjs(record.valid_from))) {
      throw new Error('Schedule is not start');
    }

    // schedule is end, try recreate to remove
    if (now.isAfter(dayjs(record.valid_to))) {
      setTimeout(async () => {
        try {
          await this.createDoorBlockingScheduleFromDeviceAccess(record);
        } catch (error) {
          // ignore
        }
      }, 0);

      // Open type immediately return
      if (type === 'Open') {
        throw new Error('Schedule is end');
      }
    }

    const blocking_schedule = JSON.parse(record.blocking_schedule);
    const weekly = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const match_schedules = blocking_schedule.filter((x) => {
      const actionTime = type === 'Open' ? x.from_time : x.to_time;
      const formatActionTime = dayjs(actionTime, ['H:mm:ss', 'HH:mm:ss']).format('HH:mm');

      if (formatActionTime !== time) {
        return false;
      }

      // check every day
      if (x.schedule === 'Every Day') {
        return true;
      }

      // check weekly
      if (weekly.indexOf(x.schedule) !== -1 && now.day() === weekly.indexOf(x.schedule)) {
        return true;
      }

      // check iot_schedule
      const iot_schedule = this.getStore('iot_schedule')[x.schedule];
      if (iot_schedule && iot_schedule.time_slot && Array.isArray(iot_schedule.time_slot) && iot_schedule.time_slot.length > 0) {
        const slot = iot_schedule.time_slot.find((s) => {
          return now.format('YYYY-MM-DD') === s.date;
        });

        return !!slot;
      }

      return false;
    });

    if (match_schedules.length <= 0) {
      throw new Error('No match schedule');
    }

    // has match schedule, trigger button group
    await this.triggerButtonGroup(record.device_button_group, type);
  };

  /**
   * Collect Mailbox Serial Signal
   * @param {string} hex
   */
  ACSManager.prototype.collectMailboxSerialSigal = async function (hex) {
    const door = Object.values(this.getStore('door')).find((door) => {
      if (door.type !== 'Mailbox') {
        return false;
      }

      return door.mail_open_lock === hex || door.mail_sensor_block === hex || door.mail_sensor_release === hex;
    });

    if (!door) {
      return;
    }

    const door_name = door.name;
    if (door.mail_open_lock === hex) {
      if (this._mailboxOpenLockMap[door_name]) {
        clearTimeout(this._mailboxOpenLockMap[door_name]);
      } else {
        this.createDeviceMailLog({
          door: door.name,
          device: this.uuid,
          timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          status: 'Door Open',
          details: '',
          device_button_group: door.device_button_group,
          reference_local: '',
        });
      }

      // ignore open lock signal in 20s
      this._mailboxOpenLockMap[door_name] = setTimeout(() => {
        delete this._mailboxOpenLockMap[door_name];
      }, 1000 * 20);
    } else if (door.mail_sensor_block === hex) {
      if (this._mailboxOpenLockMap[door_name] !== undefined) {
        return;
      }

      if (this._mailboxSensorBlockMap[door_name] !== undefined) {
        clearTimeout(this._mailboxSensorBlockMap[door_name]);
      }

      this._mailboxSensorBlockMap[door_name] = setTimeout(() => {
        this.createDeviceMailLog({
          door: door.name,
          device: this.uuid,
          timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          status: 'Full',
          details: '',
          device_button_group: door.device_button_group,
          reference_local: '',
        });
      }, 1000 * 20);
    } else if (door.mail_sensor_release === hex) {
      if (this._mailboxOpenLockMap[door_name] !== undefined) {
        return;
      }

      if (this._mailboxSensorBlockMap[door_name] === undefined) {
        return;
      }

      clearTimeout(this._mailboxSensorBlockMap[door_name]);
      delete this._mailboxSensorBlockMap[door_name];
      this.createDeviceMailLog({
        door: door.name,
        device: this.uuid,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 'New Mail',
        details: '',
        device_button_group: door.device_button_group,
        reference_local: '',
      });
    }
  };

  // ------------------------------ utils ------------------------------

  ACSManager.prototype.getStore = function (key, copy = false, defaultValue = {}) {
    const v = this.store[key] || defaultValue;
    if (copy) {
      return JSON.parse(JSON.stringify(v));
    }
    return v;
  };

  ACSManager.prototype.getSetting = function (setting_type) {
    if (!setting_type) return '';
    if (!this.device || this.device.settings.length <= 0) return '';

    const item = this.device.settings.find((x) => x.setting_type === setting_type);
    if (!item) return '';

    let setting = item.setting.trim() || '';
    if (setting.toLowerCase() === 'null' || setting.toLowerCase() === 'undefined' || setting.toLowerCase() === 'none') return '';

    return setting;
  };

  ACSManager.prototype.setSetting = async function (setting_type, setting) {
    if (!setting_type) return;
    if (!this.device || this.device.settings.length <= 0) return;

    const item = this.device.settings.find((x) => x.setting_type === setting_type);
    if (!item) return;

    item.setting = (setting || 'null').trim();
    await db.set(KEY_ACCESS_CONTROL_DEVICE, JSON.stringify(this.device));

    // try to update server
    try {
      await http2.request({
        method: 'PUT',
        url: encodeURI('/api/resource/Device/' + this.uuid),
        data: {
          settings: this.device.settings.map((e) => ({ setting_type: e.setting_type, setting: e.setting })),
        },
      });
    } catch (error) {
      // ignore
    }
  };

  ACSManager.prototype.getAuthUser = function () {
    return this._user;
  };

  ACSManager.prototype.getTypeEnumByType = function (type) {
    return this.typeEnum[type];
  };

  ACSManager.prototype.getTypeEnums = function () {
    return Object.keys(this.typeEnum).map((key) => {
      return {
        value: key,
        label: this.typeEnum[key],
      };
    });
  };

  ACSManager.prototype.getUUIDByType = async function (type) {
    const isAvailable = Capacitor.isPluginAvailable('YoswitDeviceInfo');
    if (!isAvailable) {
      return deviceInfo.deviceId;
    }

    let uuid = '';
    if (type === '0') {
      uuid = (await Capacitor.Plugins.YoswitDeviceInfo.getWifiMacAddress()).value;
      uuid = uuid.toUpperCase();
    } else if (type === '1') {
      uuid = (await Capacitor.Plugins.YoswitDeviceInfo.getLanMacAddress()).value;
      uuid = uuid.toUpperCase();
    } else if (type === '2') {
      uuid = (await Capacitor.Plugins.YoswitDeviceInfo.getSN()).value;
      uuid = uuid.toLowerCase();
    }

    return uuid;
  };

  ACSManager.prototype.createDefaultSettings = function () {
    const DEFAULT_SETTINGS = {
      'device_settings': '----------',
      'access_app_version': 'YO-ACS-vX.X.X',
      'device_name': 'YosLock',
      'user_password': '12345678',
      'admin_password': '12345678',
      'root_password': '11223344',
      'online_mode': 'true',
      'debug_mode': 'false',
      'web_debug': 'false',
      'devtool_ip': 'null',
      'bluetooth_gateway': 'false',
      'clear_device_access_log_after': '90',
      'clear_device_mail_log_after': '90',
      'clear_octopus_transaction_log_after': '180',
      'key_card_secret': '832227680083',
      'board_settings': '----------',
      'device_board': 'null',
      'gpio_write': 'ph12',
      'gpio_read': 'pb04',
      'io1': '1',
      'io2': '2',
      'io3': '3',
      'io4': '4',
      'io5': '24',
      'com1_device_name': 'null',
      'com1_path': 'null',
      'com1_device_baudrate': 'null',
      'com2_device_name': 'null',
      'com2_path': 'null',
      'com2_device_baudrate': 'null',
      'com3_device_name': 'null',
      'com3_path': 'null',
      'com3_device_baudrate': 'null',
      'com4_device_name': 'null',
      'com4_path': 'null',
      'com4_device_baudrate': 'null',
      'com5_device_name': 'null',
      'com5_path': 'null',
      'com5_device_baudrate': 'null',
      'mqtt_settings': '----------',
      'mqtt_open_lock_button_group': 'OPEN_GPIO_4_ON',
      'mqtt_close_lock_button_group': 'OPEN_GPIO_4_OFF',
      'tcpic_integration_settings': '----------',
      'mqtt_target_mac': 'null',
      'tcp_modbus_url': 'null',
      'access_controll_settings': '----------',
      'duration_close_door': '7',
      'input_1': '3',
      'pin_length': '4',
      'open_door_sound_id': 'octopus_dood_01',
      'error_sound_id': 'error_beep_1s',
      'mailbox_max_count': '20',
      'dynamic_qr_code_valid_time': '60',
      'video_call_settings': '----------',
      'video_confrence_url': 'https://iotavh1.tgt.hk/',
      'video_call_dialing_timeout': '20',
      'video_call_dialing_dialog_timeout': '10',
      'video_call_connection_timeout': '60',
      'video_call_connection_dialog_timeout': '10',
      'video_call_width': '512',
      'video_call_height': '600',
      'video_call_device_name': 'Yoswit',
      'video_call_x_direction': '0',
      'video_call_y_direction': '0',
      'video_call_accept_button_group': 'OPEN_LOCK_RS485',
      'g_printer_settings': '----------',
      'g_printer_title_x': '20',
      'g_printer_title_y': '50',
      'g_printer_qr_code_x': '20',
      'g_printer_qr_code_y': '90',
      'g_printer_name_x': '130',
      'g_printer_name_y': '290',
      'g_printer_from_time_x': '90',
      'g_printer_from_time_y': '290',
      'g_printer_to_time_x': '50',
      'g_printer_to_time_y': '290',
      'myq480_printer_settings': '----------',
      'myq804_printer_width': '10', // (毫米）
      'myq804_printer_density': '10', // (0-16)
      'myq804_printer_padding': '0', // (毫米）
      'myq804_printer_ecc': 'M', // (L,M,Q,H)
      'kone_lift_settings': '----------',
      'kone_lift_ip_address': 'null',
      'kone_lift_terminal_id': 'null', // DOP ID / COP ID
      'kone_lift_floor_id': 'null',
      'kone_lift_heartbeat_interval': '5',
      'kone_lift_open_timeout': '15', // 1s - 30s
      'face_recognition_settings': '----------',
      'face_recognition_enabled': 'false',
      'face_recognition_type': 'usb', // usb, rtsp
      'face_recognition_x_direction': '0',
      'face_recognition_y_direction': '0',
      'face_recognition_width': '0',
      'face_recognition_height': '0',
      'face_recognition_detect_orientation': '0', // 0，90，180，270，ALL
      'face_recognition_connection_config': 'null',
      'undefined_settings': '----------',
      // unknown command define settings here
    };

    return DEFAULT_SETTINGS;
  };

  ACSManager.prototype.createDeviceAccessLog = function (access_type, access_info, accessOrError, details = {}) {
    let status = 'Success';
    let error_code = '0';
    let access = null;

    if (accessOrError instanceof Error) {
      status = 'Fail';
      error_code = '2000';

      if (accessOrError.isAccessError) {
        access_info = accessOrError.access_info;
        error_code = accessOrError.code;
        access = accessOrError.access || null;
      }
    } else if (typeof accessOrError === 'object' && accessOrError !== null && accessOrError.name) {
      access = accessOrError;
    }

    let extra = {};
    if (access) {
      extra.door = access.door || null;
      extra.flat = access.flat || null;
    }

    const log = {
      ...extra,
      access_type: access ? access.access_type : access_type,
      reference_device_access: access && access.name && !access.name.startsWith('#') ? access.name : null,
      details: JSON.stringify({ error_code: error_code, ...details }),
      status: status,
      device: this.uuid,
      access_info: access_info,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    // timezone issue, need to set, overwrite default value
    this.executeSql(`INSERT INTO tab_device_access_log (description, creation) VALUES (?, ?);`, [
      JSON.stringify(log),
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ]).catch(() => {
      // ignore
    });

    // upload to server
    if (this.getSetting('online_mode') === 'true') {
      http2
        .request({
          method: 'POST',
          url: encodeURI('/api/resource/Device Access Log'),
          data: log,
        })
        .catch(() => {
          // ignore
        });
    }

    return log;
  };

  ACSManager.prototype.createDeviceMailLog = async function (log) {
    if (!log) {
      return;
    }

    const data = [];
    ['door', 'device', 'timestamp', 'reference_local', 'status', 'details', 'device_button_group'].forEach((key) => {
      data.push(log[key] || null);
    });

    this.executeSql(
      `INSERT INTO tab_device_mail_log (door, device, timestamp, reference_local, status, details, device_button_group) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      data
    ).catch(() => {
      // ignore
    });

    http2
      .request({
        method: 'POST',
        url: encodeURI('/api/resource/Device Mail Log'),
        data: log,
      })
      .catch((error) => {
        // ignore
      });

    if (log.status === 'New Mail' && log.door) {
      try {
        const count = parseInt((await db.get('ACS:Door:Mailbox:Count:' + log.door)) || '0');

        const newCount = count + 1;
        await db.set('ACS:Door:Mailbox:Count:' + log.door, `${newCount}`);
        http2.request({
          method: 'PUT',
          url: encodeURI('/api/resource/Door/' + log.door),
          data: {
            mail_count: newCount,
          },
        });
      } catch (error) {
        await db.set('ACS:Door:Mailbox:Count:' + log.door, '0');
      }
    } else if (log.status === 'Door Open' && log.door) {
      await db.set('ACS:Door:Mailbox:Count:' + log.door, '0');
      http2.request({
        method: 'PUT',
        url: encodeURI('/api/resource/Door/' + log.door),
        data: {
          mail_count: 0,
        },
      });
    }
  };

  ACSManager.prototype.createDeviceAccessError = function (error_code, access, info = null) {
    function AccessError() {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error().stack;
      }

      this.message = error_code;
      this.code = error_code;
      this.name = 'AccessError';
      // this.status = 'Failed';
      this.access = access;
      this.access_info = info;
    }

    AccessError.prototype = Object.create(Error.prototype);
    AccessError.prototype.isAccessError = true;

    return new AccessError();
  };

  ACSManager.prototype.uploadGatewayOnlineLog = async function () {
    try {
      const deviceInfo = await this.getDeviceInfo();

      await http2.request({
        url: encodeURI(`/api/resource/Device Gateway/${erp.info.device_gateway.guid}`),
        method: 'PUT',
        data: {
          device_info: JSON.stringify(deviceInfo),
        },
      });
    } catch (err) {
      // ignore
    }
  };

  /**
   * 校验表字段是否存在
   * @param {string} tableName - 表名
   * @param {string[]} fields - 待校验的字段列表
   * @returns {boolean} - 所有字段是否都存在
   */
  ACSManager.prototype.checkTableFieldsExist = async function (tableName, fields) {
    try {
      // 查询表结构元数据
      const result = await this.executeSql(`
      PRAGMA table_info(${tableName});
    `);

      // 提取表中实际存在的字段名
      const existingFields = [];
      const rows = result.rows;
      for (let i = 0; i < rows.length; i++) {
        existingFields.push(rows.item(i).name);
      }

      // 过滤掉不存在的字段，保留有效字段
      const validFields = fields.filter((field) => existingFields.includes(field));

      // 记录被过滤掉的字段（可选，用于调试）
      const filteredFields = fields.filter((field) => !existingFields.includes(field));
      if (filteredFields.length > 0) {
        console.warn(`表 ${tableName} 不存在以下字段，已自动过滤: ${filteredFields.join(', ')}`);
      }

      return validFields;
    } catch (error) {
      console.error('字段校验失败:', error);
      throw new Error('表结构查询失败');
    }
  };

  /**
   * 处理字段值（转换JSON字段、处理空值）
   * @param {Object} deviceAccess - 原始数据对象
   * @param {string[]} fields - 字段列表
   * @returns {Array} - 处理后的字段值数组
   */
  ACSManager.prototype.processFieldValues = async function (deviceAccess, fields) {
    return fields.map((field) => {
      if (field === 'blocking_schedule') {
        try {
          return JSON.stringify(deviceAccess[field] || []);
        } catch (error) {
          console.warn(`字段 ${field} 转换JSON失败, 使用空数组`, error);
          return '[]';
        }
      }

      // 明确区分 undefined 和 null（数据库中null为真实空值，undefined可能被视为默认值）
      return deviceAccess[field] === undefined ? null : deviceAccess[field];
    });
  };

  /**
   * 执行插入或替换操作
   * @param {Object} tableName - 表名
   * @param {Object} deviceAccess - 设备访问数据
   * @param {string[]} fields - 插入表字段
   * @returns {Object} - 数据库执行结果
   */
  ACSManager.prototype.insertOrReplaceDeviceAccess = async function (tableName, deviceAccess, fields) {
    // 1. 校验字段是否存在
    const validFields = await this.checkTableFieldsExist(tableName, fields);

    // 2. 处理字段值
    const sqlValues = await this.processFieldValues(deviceAccess, validFields);
    console.log('sqlValues', sqlValues);

    // 3. 构建参数化SQL（字段名固定，避免动态拼接风险）
    const placeholders = validFields.map(() => '?').join(', ');
    const sql = `INSERT OR REPLACE INTO ${tableName} (${validFields.join(', ')}) VALUES (${placeholders});`;

    // 4. 执行SQL
    try {
      const sqlRs = await this.executeSql(sql, sqlValues);
      return sqlRs;
    } catch (error) {
      console.error('插入数据失败:', error);
      throw new Error('数据插入失败');
    }
  };

  ACSManager.prototype.updateDeviceAccessRecord = async function (device_access, upload, fields = []) {
    if (!device_access || !device_access.name) {
      throw new Error('Device Access is required');
    }

    // Device Access Table Fields
    const tableName = 'tab_device_access';
    const tableFields = [
      'name',
      'device',
      'device_button_group',
      'status',
      'access_type',
      'access_level',
      'guest_email',
      'avatar',
      'qr_code',
      'pin',
      'pin_remark',
      'key_card_id',
      'key_card_secret',
      'serial_port_code',
      'octopus_card_id',
      'octopus_check_digit',
      'octopus_old_card_id',
      'car_plate_id',
      'one_time_access',
      'disabled',
      'valid_from',
      'valid_to',
      'blocking_schedule',
      'door',
      'flat',
      'reference',
      'modified',
      'creation',
    ];
    console.log('tableName', tableName);
    console.log('device_access', device_access);
    console.log('tableFields', tableFields);

    await this.insertOrReplaceDeviceAccess(tableName, device_access, tableFields);

    // const sqlValues = tableFields.map((field) => {
    //   if (field === 'blocking_schedule') {
    //     try {
    //       return JSON.stringify(device_access[field] || []);
    //     } catch (error) {
    //       return '[]';
    //     }
    //   }

    //   return device_access[field] === undefined ? null : device_access[field];
    // });

    // const sqlRs = await this.executeSql(
    //   `INSERT OR REPLACE INTO tab_device_access VALUES (${tableFields.map(() => '?').join(', ')});`,
    //   sqlValues
    // );

    if (!upload) {
      return;
    }

    // device access upload to server
    // if name start with #, it means it's a new record
    if (device_access.name.startsWith('#')) {
      const copyAccess = lodash.merge({}, device_access);
      delete copyAccess.name;
      delete copyAccess.blocking_schedule;
      if (!copyAccess.status || copyAccess.status === 'Pending') {
        copyAccess.status = 'Registered';
      }

      const resp = await http2.request({
        url: encodeURI('/api/resource/Device Access'),
        method: 'POST',
        data: copyAccess,
      });

      // use server device access name to update local
      if (resp.data.data.name) {
        await this.executeSql(`UPDATE tab_device_access SET name = ? WHERE name = ?;`, [resp.data.data.name, device_access.name]);
      }
    } else {
      if (fields.length <= 0) {
        return;
      }

      const data = {};
      fields.forEach((field) => {
        data[field] = device_access[field];
      });

      await http2.request({
        url: encodeURI('/api/resource/Device Access/' + device_access.name),
        method: 'PUT',
        data: data,
        debug: true,
      });
    }
  };

  ACSManager.prototype.updateFlatRecord = async function (flat) {
    if (!flat || !flat.name) {
      throw new Error('Flat is required');
    }

    app.utils.extend(this.getStore('flat'), { [flat.name]: flat });
    await db.set(KEY_ACCESS_CONTROL_MASTER_DATA_MAIN, JSON.stringify(this.store));
  };

  ACSManager.prototype.startAuth = function () {
    const user_types = ['user', 'admin', 'root'];
    if (this._user && user_types.includes(this._user)) {
      return;
    }

    let timeoutId = null;
    let count = 120;
    try {
      if (this._rootLoginScreen) {
        this._rootLoginScreen.close(false);
        this._rootLoginScreen.destroy();
        this._rootLoginScreen = null;
      }
    } catch (err) {
      // ignore
    }

    const formSetting = {
      web_form_fields: [
        {
          'fieldname': 'username',
          'fieldtype': 'Data',
          'label': 'Username',
          'allow_read_on_all_link_options': 0,
          'reqd': 1,
          'read_only': 0,
          'show_in_filter': 0,
          'hidden': 0,
          'options': '',
          'max_length': 0,
          'max_value': 0,
          'precision': '',
          'default': '',
        },
        {
          'fieldname': 'password',
          'fieldtype': 'Password',
          'label': 'Password',
          'allow_read_on_all_link_options': 0,
          'reqd': 1,
          'read_only': 0,
          'show_in_filter': 0,
          'hidden': 0,
          'options': '',
          'max_length': 0,
          'max_value': 0,
          'precision': '',
          'default': '',
        },
        {
          'fieldname': 'submit',
          'fieldtype': 'HTML',
          'label': 'Submit',
          'allow_read_on_all_link_options': 0,
          'reqd': 1,
          'read_only': 0,
          'show_in_filter': 0,
          'hidden': 0,
          'options': '',
          'max_length': 0,
          'max_value': 0,
          'precision': '',
          'default': '',
        },
      ],
      custom_css: `
      .basic-form.\{\{ id \}\} {
        width: 60vw;
        box-sizing: content-box;
        padding: 14px;
      }

      .basic-form.\{\{ id \}\} .form-content .list {
        width: 100%;
        max-width: 100%;
      }

      .basic-form.\{\{ id \}\} .form-container {
        box-shadow: none !important;
        margin: 0;
      }
      `,
      button_label: 'Login',
    };

    let formVueApp = null;
    let that = this;

    this._rootLoginScreen = app.loginScreen.create({
      content: `
      <div class="login-screen">
        <div class="view">
          <div class="page">
            <div 
              class="page-content login-screen-content" 
              style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;"
            >
              <div style="margin-top: 40px;">
                <svg style="width: 200px; max-width: 50vw;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 724.17 171.19"><defs><style>.cls-1{fill:#3bb33b;}</style></defs><path class="cls-1" d="M716.42,71.1c0,17.09-13.42,30.51-30.88,30.51-17.27,0-31-13.42-31-30.51,0-16.72,13.78-30.14,31-30.14C703,41,716.42,54.38,716.42,71.1Zm-54,0c0,13,10.23,22.46,23.36,22.46,12.24,0,22.72-9.91,22.72-22.28,0-12.68-10.37-22.38-22.91-22.38C672.6,48.9,662.37,58.49,662.37,71.1Zm18.39,15.81H673V56.76a72.12,72.12,0,0,1,12.38-.92c5.7,0,8.27.91,10.47,2.21s3.34,3.68,3.34,6.62c0,3.31-2.1,5.87-6.64,7V72c2.93,1.1,4.59,3.31,5.51,7.35.92,4.59,1.47,6.43,2.2,7.54h-8c-.92-1.11-1-3.86-1.95-7.36-.55-3.3-3-4.78-6.84-4.78h-2.72ZM681,69.82h3.3c3.86,0,7-1.3,7-4.42,0-2.75-2-4.59-6.43-4.59a17,17,0,0,0-3.86.36Z"/><path class="cls-1" d="M570.87,81.44l-2.62,15.35h30.34l-12.7,65.43H600l12.7-65.43h30.46l2.61-15.35ZM316,81.44H268.53c-9.83,0-19.39,8.63-21.34,18.93L238.93,144c-2,10.3,4.44,18.27,14.28,18.27h47.42c9.84,0,19.39-8,21.35-18.27l8.26-43.58C332.19,90.07,325.79,81.44,316,81.44Zm2.28,22.11-7.06,36.22a8.25,8.25,0,0,1-7.62,6.65H258.34c-3.51,0-5.79-3-5.1-6.65l7.06-36.22a8.25,8.25,0,0,1,7.62-6.65h45.22C316.65,96.9,318.93,99.88,318.24,103.55ZM229.47,81.44l-35.55,27.29L169.68,81.44H147.56l33.87,43.65-7.05,37.13H191l7-37,55.13-43.74Zm105.3,24h0c-2.52,13.29,3.88,24.06,14.28,24.06h53.47s4.84,1.54,3.5,8.63-6.68,8.14-6.68,8.14H327.41l-3.08,15.91h70.21c10.61,0,21.3-10.62,23.87-24.17h0l.09-.49c2.57-13.56-3.95-24-14.56-24H353.23s-5.15-1.42-3.74-8.87,6.78-7.7,6.78-7.7h69.92l3-15.53h-71C347.83,81.44,337.29,92.19,334.77,105.48Zm202,56.74h14L566.1,81.44h-14Zm-3-80.78-22.6,57.78L498.73,81.44H482.92l-35.37,57.78,1.24-57.78h-15l-2,80.78h17.33l38.19-64.79,12.8,64.79h15.93L547,81.44Z"/><polygon class="cls-1" points="107.2 73.62 96.52 62.9 96.44 41.26 128.71 73.61 107.2 73.62"/><path class="cls-1" d="M83.72,132.48V70.88l-30.85.19v61.41Zm-23-23.06H75.93v15.23H60.71ZM107,81.47v47.35c0,5.8-6,11.47-11.74,11.47h-54c-5.79,0-11.53-5.66-11.53-11.45V74.43c0-5.61,5.74-11.35,11.35-11.35H88.75v-22h-56a25.09,25.09,0,0,0-25,25v69.79a26.4,26.4,0,0,0,26.33,26.33h67.77c14.09,0,27.05-14.06,27.05-27.45V81.47Z"/><polygon class="cls-1" points="139.79 73.62 96.52 30.39 96.52 8.94 161.36 73.62 139.79 73.62"/></svg>
              </div>
              <div id="login-form" style="width: 100%;"></div>
              <div class="list m-0" style="padding-bottom: 40px; font-size: 12px;">
                <div class="block-footer remaining-time text-truncate"></div>
                <div class="block-footer text-truncate">Ver. ${this.device.firmware}</div>
                <div class="block-footer text-truncate">${this.typeEnum[this.uuidType]}: ${this.device.mac_address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `,
      on: {
        opened: function (screen) {
          formVueApp = erp.script.core_app_basic_form_render(
            {
              web_form: formSetting,
            },
            screen.$el.find('#login-form')[0],
            {},
            {
              'web_form.after_load': function () {
                this.web_form.set_show_next_button(false);
              },
              'web_form.submit': function () {
                const form = this.web_form.get_values();
                if (user_types.indexOf(form.username) === -1) {
                  app.toast.show({
                    text: _('Authentication failed'),
                    position: 'bottom',
                    closeTimeout: 2000,
                  });
                  return;
                }

                const pass = that.getSetting(`${form.username}_password`);
                if (pass !== form.password) {
                  app.toast.show({
                    text: _('Authentication failed'),
                    position: 'bottom',
                    closeTimeout: 2000,
                  });
                  return;
                }

                that._user = form.username;
                that.emitter.emit('app:access-control:auth', { username: form.username, password: form.password });
                mainView.router.navigate('/mobile-app/acs-access-control-assembly', { reloadCurrent: true, clearPreviousHistory: true });
                screen.close();
              },
              '$ui.submit.$vnode': {
                template: `
                <div class="field-container" style="width: 100%; display: flex; flex-direction: row;">
                  <button class="button button-fill" style="flex: 1; font-weight: bold;" @click="onCancel()">${_('Cancel')}</button>
                  <div style="width: 14px;"></div>
                  <button class="button button-fill" style="flex: 1; font-weight: bold;" @click="onSubmit()">${_('Login')}</button>
                </div>
                `,
                inject: ['getFrappe', 'validateStepForm'],
                methods: {
                  onCancel() {
                    screen.close();
                  },
                  onSubmit() {
                    if (!this.validateStepForm()) {
                      return;
                    }

                    this.getFrappe().web_form.submit.call(this.getFrappe());
                  },
                },
              },
            }
          );

          // count down
          const countdown = () => {
            count--;

            if (count <= 0) {
              screen.close();
              clearTimeout(timeoutId);
              return;
            } else {
              const minutes = Math.floor(count / 60);
              const seconds = count % 60;
              screen.$el
                .find('.block-footer.remaining-time')
                .html(`Remain Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

              timeoutId = setTimeout(() => {
                countdown();
              }, 1000);
            }
          };

          countdown();
        },
        closed: function (screen) {
          clearTimeout(timeoutId);

          if (formVueApp) {
            try {
              formVueApp.$destroy();
            } catch (err) {
              // ignore
            }
          }
        },
      },
    });

    this._rootLoginScreen.open();
  };

  ACSManager.prototype.createMockBackInvisibleBlock = function () {
    const id = 'mock-back-invisible-block';
    if ($('#' + id).length > 0) return;

    const block = document.createElement('div');
    block.style.position = 'fixed';
    block.style.top = '0';
    block.style.left = '0';
    block.style.width = '30px';
    block.style.height = '30px';
    if (Capacitor.getPlatform() === 'ios') {
      block.style.marginTop = 'var(--f7-safe-area-top, 0px)';
    }
    // block.style.backgroundColor = '#ccc';
    // block.style.pointerEvents = 'none';
    block.style.opacity = '0';
    block.style.zIndex = '99999999';
    block.id = id;
    document.body.appendChild(block);

    let clickCount = 0;
    let timeoutId;
    block.addEventListener('click', () => {
      clickCount++;

      // 清除之前的计时器 (如果有)
      clearTimeout(timeoutId);

      // 设置新的计时器
      timeoutId = setTimeout(function () {
        // 超时后重置计数器
        clickCount = 0;
      }, 500); // 1000 毫秒 (1 秒) 后重置

      if (clickCount > 10) {
        // 重置计数器
        clickCount = 0;
        // 清除计时器
        clearTimeout(timeoutId);

        // 执行响应函数
        this.startAuth();
      }
    });
  };

  ACSManager.prototype.destroyMockBackInvisibleBlock = function () {
    const id = 'mock-back-invisible-block';
    $('#' + id).remove();
  };

  ACSManager.prototype.updateSignal = function (device, status) {
    if (this.signals[device] === status) return;

    this.signals[device] = status;
    this.emitter.emit('app:access-control:signal', { device: device, status: status });
  };

  ACSManager.prototype.showSignal = function () {
    this._signalAction = app.actions
      .create({
        grid: true,
        buttons: [
          {
            text: _('Device Status'),
            label: true,
          },
          ...Object.keys(this.signals).map((key) => {
            return {
              text: key,
              icon: `
              <div style="text-align: center; width: 100%;">
              ${this.signals[key] === 0 ? '<span class="badge color-green"></span>' : '<span class="badge color-red"></span>'}
              </div>
              `,
            };
          }),
        ],
        on: {
          closed: () => {
            try {
              this._signalAction.destroy();
            } catch (err) {
              // ignore
            }
            this._signalAction = null;
          },
        },
      })
      .open();
  };

  ACSManager.prototype.getSignalLights = function () {
    let green = 0;
    let red = 0;
    const signal = Object.keys(this.signals).map((e) => {
      const status = this.signals[e];

      if (status === 0) {
        green++;
      } else {
        red++;
      }

      return status;
    });

    if (green === signal.length) {
      return 'green';
    } else if (red > 0 && red === signal.length) {
      return 'red';
    } else {
      return 'orange';
    }
  };

  ACSManager.prototype.getSignal = function (device) {
    return this.signals[device] === null || this.signals[device] === undefined ? 1 : this.signals[device];
  };

  ACSManager.prototype.loadModel = async function () {
    const response = await http2.request({
      method: 'GET',
      url: encodeURI('/api/resource/Device Model'),
      timeout: 15,
      cacheStrategy: false,
      params: {
        fields: '["name"]',
        filters: `[["mode","=","Access Controller"]]`,
        limit_start: 0,
        limit_page_length: 2000000,
      },
    });

    return response.data.data;
  };

  ACSManager.prototype.loadBatch = async function () {
    const response = await http2.request({
      method: 'GET',
      url: encodeURI('/api/resource/Device Batch'),
      timeout: 15,
      cacheStrategy: false,
      params: {
        fields: '["name"]',
        filters: `[["disabled","!=","1"]]`,
        limit_start: 0,
        limit_page_length: 2000000,
      },
    });

    return response.data.data;
  };

  ACSManager.prototype.hexToWindowsFiletimeDate = function (hex, littleEndian = false) {
    // 将十六进制字符串转换为带符号的 64 位整数
    const timestamp = this.hexToNum(hex, littleEndian);

    // 定义 100 纳秒和毫秒之间的转换因子
    const nanosecondsPerMillisecond = 10000;

    // 将 100 纳秒转换为毫秒
    const timestampMilliseconds = timestamp / nanosecondsPerMillisecond;

    // 定义 1601 年 1 月 1 日到 1970 年 1 月 1 日的毫秒数差值
    const FILETIME_epochDiff = 11644473600000;

    // 将 FILETIME 时间戳转换为 Unix 时间戳（自 1970 年 1 月 1 日起的毫秒数）
    const unixTimestamp = timestampMilliseconds - FILETIME_epochDiff;

    // 使用 JavaScript 的 Date 对象将 Unix 时间戳转换为正常的日期时间
    const date = new Date(Number(unixTimestamp));

    return date;
  };

  ACSManager.prototype.dateToWindowsFiletimeHex = function (date, littleEndian = false) {
    // 定义 1601 年 1 月 1 日的时间戳（毫秒）
    const FILETIME_epoch = Date.UTC(1601, 0, 1);

    // 获取日期对象的毫秒表示
    const milliseconds = date.getTime();

    // 计算日期对象与 1601 年 1 月 1 日的时间差（100 纳秒为单位）
    const nanoseconds = (milliseconds - FILETIME_epoch) * 10000;

    // 将时间戳转换为十六进制字符串
    const hexTimestamp = this.numToHex(nanoseconds, 8, littleEndian);

    return hexTimestamp;
  };

  ACSManager.prototype.startDevtool = async function () {
    // local debug
    try {
      if (this.getSetting('devtool_ip') && this.getSetting('debug_mode') === 'true') {
        await db.set('dev:hotmodulereload:ip', this.getSetting('devtool_ip'));
        erp.script.init_hot_module_reload();
      }
    } catch (err) {
      // ignore
    }

    // web debug
    try {
      if (this.getSetting('web_debug') === 'true') {
        if (this.getSetting('online_mode') === 'true') {
          erp.script.init_page_spy();
        } else {
          erp.script.init_eruda();
        }
      }
    } catch (err) {
      // ignore
    }
  };

  ACSManager.prototype.restartApp = async function () {
    try {
      await Capacitor.Plugins.YoswitDeviceInfo.restartApp();
    } catch (error) {
      this.alert(_('Failed to restart app, please manually restart.'));
    }
  };

  ACSManager.prototype.sleep = function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  ACSManager.prototype.numToHex = function (num, byteLength, littleEndian = false) {
    let hex = (num * 1).toString(16);
    hex = hex.padStart(byteLength * 2, '0');

    if (littleEndian) {
      hex = hex
        .match(/.{1,2}/g)
        .reverse()
        .join('');
    }
    return hex;
  };

  ACSManager.prototype.hexToNum = function (hex, littleEndian = false) {
    if (littleEndian) {
      hex = hex
        .match(/.{1,2}/g)
        .reverse()
        .join('');
    }

    let num = 0;
    for (let i = 0; i < hex.length; i++) {
      num = num * 16 + parseInt(hex.charAt(i), 16);
    }
    return num;
  };

  ACSManager.prototype.getDeviceInfo = async function () {
    try {
      let info = {};

      try {
        const { value } = await Capacitor.Plugins.YoswitDeviceInfo.getDeviceInfo();
        Object.assign(info, value);
      } catch (error) {
        // ignore
      }

      try {
        const capInfo = await Capacitor.Plugins.Device.getInfo();
        // info.diskFreeSize = this.formatSizeUnits(info.diskFree);
        // info.diskTotalSize = this.formatSizeUnits(info.diskTotal);
        // info.realDiskFreeSize = this.formatSizeUnits(info.realDiskFree);
        // info.realDiskTotalSize = this.formatSizeUnits(info.realDiskTotal);
        Object.assign(info, capInfo);
      } catch (error) {
        // ignore
      }

      try {
        const { value } = await Capacitor.Plugins.YoswitDeviceInfo.getStorageInfo();
        Object.assign(info, value);
      } catch (error) {
        // ignore
      }

      return info;
    } catch (error) {
      return {};
    }
  };

  ACSManager.prototype.reverseHexEndian = function (hex) {
    return hex
      .match(/.{1,2}/g)
      .reverse()
      .join('');
  };

  ACSManager.prototype.isTimeWithinRanges = function (currentTime, timeRanges) {
    const [hour, minute, second] = currentTime.split(':').map(Number);
    const totalSeconds = hour * 3600 + minute * 60 + second;

    for (const [startTime, endTime] of timeRanges) {
      const [startHour, startMinute, startSecond] = startTime.split(':').map(Number);
      const [endHour, endMinute, endSecond] = endTime.split(':').map(Number);

      const startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
      const endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;

      // 处理跨越午夜的情况
      if (startTotalSeconds > endTotalSeconds) {
        if (totalSeconds >= startTotalSeconds || totalSeconds <= endTotalSeconds) {
          return true;
        }
      } else {
        if (totalSeconds >= startTotalSeconds && totalSeconds <= endTotalSeconds) {
          return true;
        }
      }
    }

    return false;
  };

  ACSManager.prototype.getPageContextScript = function () {
    const route = mainView.router.currentRoute.path.substring(1);
    const wp = erp.doctype.web_page[route];
    let context = {};
    if (wp && wp.context_script) {
      try {
        context = new Function(`
        const context = {};
        ${wp.context_script}
        return context;
        `)();
      } catch (err) {
        console.error('Page Context Script Error: ', err);
      }
    }
    return context;
  };

  ACSManager.prototype.addTask = function (func) {
    this._globalQueue.addTask(func);
  };

  ACSManager.prototype.$destroy = function () {
    try {
      this.destroyMockBackInvisibleBlock();
    } catch (err) {
      console.error('Destroy Invisible Block: ', err);
    }

    // 销毁函数集合
    this._releaseFuncs.forEach((func) => {
      try {
        lodash.isFunction(func) && func();
      } catch (err) {
        console.error('Release Error: ', err);
      }
    });
  };

  ACSManager.prototype.deinit = function () {
    window.acsManager = null;
  };

  ACSManager.prototype.on = function (event, listener) {
    this.emitter.on(event, listener);
  };

  ACSManager.prototype.off = function (event, listener) {
    this.emitter.off(event, listener);
  };

  ACSManager.prototype.backHome = async function () {
    try {
      await Capacitor.Plugins.YoswitDeviceInfo.pressHomeKey();
    } catch (error) {
      app.dialog.alert('Failed to back home, please update the app to the latest version.');
    }
  };

  ACSManager.prototype.showScanNFCModal = function (title, on) {
    this.hideScanNFCModal();

    const sheet = app.sheet.create({
      content: `
      <div class="sheet-modal" style="height: auto;">
        <div class="sheet-modal-inner" style="height: 320px;">
          <style>
          .loader {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #000;
            box-shadow: 0 0 0 0 #0004;
            animation: l2 2.5s infinite linear;
            position: relative;
          }
          .loader:before,
          .loader:after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: inherit;
            box-shadow: 0 0 0 0 #0004;
            animation: inherit;
            animation-delay: -0.5s;
          }
          .loader:after {
            animation-delay: -2s;
          }
          @keyframes l2 {
            100% {box-shadow: 0 0 0 80px #0000}
          }
          </style>
          <div class="page-content display-flex flex-direction-column align-items-center justify-content-center">
            <div class="block-title">${_(title)}</div>
            <div class="block text-muted">${_('Please put and hold the card on card reader')}</div>
            <div class="display-flex flex-direction-column align-items-center justify-content-center position-relative" style="flex: 1;">
              <div class="loader"></div>
              <svg t="1718114317892" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="23084" width="100" height="100" style="z-index: 10; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                <path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#ED6B17" p-id="23085"></path><path d="M469.835294 330.691765s18.070588-7.830588 29.515294 4.818823c11.444706 13.251765 40.357647 63.247059 40.357647 113.242353s-12.649412 103.604706-25.901176 121.072941c-12.649412 18.070588-25.901176 18.070588-35.538824 11.444706-9.637647-6.023529-160.225882-121.072941-168.05647-124.687059-8.432941-3.011765-11.444706 4.818824-3.011765 48.188236 7.830588 44.574118-4.818824 57.223529-16.263529 59.030588-10.842353 0.602353-45.176471-7.830588-46.98353-98.785882-1.204706-90.352941 22.889412-105.411765 34.334118-105.411765 21.082353 0 183.115294 145.167059 193.957647 143.962353 9.637647-1.204706 14.456471-63.247059-4.216471-112.037647-22.287059-51.802353 1.807059-60.837647 1.807059-60.837647m260.216471-90.352941c54.211765 107.821176 50.597647 210.221176 50.597647 220.461176 0 10.24 3.614118 112.64-50.597647 220.461176 0 0-13.854118 16.263529-35.538824 6.625883-21.082353-9.637647-13.854118-35.538824-13.854117-35.538824s43.971765-84.931765 42.767058-189.741176v-1.204706c1.204706-104.809412-42.767059-190.945882-42.767058-190.945882s-7.228235-25.901176 13.854117-35.538824c21.684706-10.842353 35.538824 5.421176 35.538824 5.421177m-105.411765 48.188235c44.574118 80.715294 41.562353 161.430588 40.96 171.670588 0.602353 10.24 3.614118 87.341176-40.96 174.682353 0 0-13.854118 16.263529-35.538824 6.625882-21.082353-9.637647-13.854118-35.538824-13.854117-35.538823s28.912941-40.96 33.129412-144.564706v-1.204706c-3.011765-103.604706-33.129412-142.757647-33.129412-142.757647s-7.228235-25.901176 13.854117-35.538824c21.684706-9.035294 35.538824 6.625882 35.538824 6.625883z m0 0" fill="#FFFFFF" p-id="23086"></path><path d="M367.435294 781.251765h13.251765l62.042353 89.148235h0.602353v-89.148235h12.649411v109.628235h-12.649411l-62.644706-90.352941h-0.602353v90.352941H367.435294v-109.628235zM478.268235 781.251765h73.487059v10.842353H490.917647v36.743529H548.141176v10.842353h-57.825882v51.2h-12.649412v-109.628235zM644.517647 788.48c8.432941 6.625882 13.251765 15.058824 14.456471 25.901176h-12.047059c-1.807059-7.830588-5.421176-13.854118-11.444706-18.672941-6.023529-4.216471-13.251765-6.023529-21.684706-6.023529-12.649412 0-22.287059 4.216471-29.515294 13.251765-6.625882 8.432941-9.637647 19.275294-9.637647 33.129411s3.011765 24.696471 9.637647 32.527059c6.625882 8.432941 16.263529 12.649412 29.515294 12.649412 8.432941 0 16.263529-2.409412 22.287059-6.625882 6.625882-4.818824 10.842353-12.047059 13.251765-21.684706h12.047058c-2.409412 12.649412-8.432941 22.889412-17.468235 29.515294-8.432941 6.625882-18.672941 10.24-30.117647 10.24-16.865882 0-30.117647-5.421176-39.152941-16.865883-8.432941-10.24-12.047059-23.491765-12.047059-39.755294s4.216471-29.515294 12.649412-40.357647c9.035294-11.444706 22.287059-17.468235 39.152941-17.468235 12.047059 0.602353 22.287059 4.216471 30.117647 10.24z" fill="#FFFFFF" p-id="23087"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      `,
      on: on,
    });

    this._scanNFCModal = sheet;

    return sheet;
  };

  ACSManager.prototype.hideScanNFCModal = function () {
    if (this._scanNFCModal) {
      try {
        this._scanNFCModal.close();
        this._scanNFCModal = null;
      } catch (error) {
        // ignore
      }
    }
  };

  ACSManager.prototype.readSecureKeyCard = function (key_card_id, key_card_secret, device) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!device) {
          throw new Error('Device is required');
        }

        let timeoutId = null;
        let resolveFlag = false;

        const onCommand = async (event) => {
          if (event.data.key_card_id !== key_card_id) return;
          if (event.data.command !== 'read_secure_key_card') return;
          if (event.device !== device) return;

          resolveFlag = true;
          clearTimeout(timeoutId);
          this.emitter.off('cap:serial-port:command-receive', onCommand);

          if (event.code === 0) {
            resolve(true);
          } else {
            reject(new Error('Failed to read secure key card'));
          }
        };

        this.emitter.on('cap:serial-port:command-receive', onCommand);

        await Capacitor.Plugins.YoswitSerialPort.sendCommand({
          deviceName: device,
          command: 'read_secure_key_card',
          opt: {
            key_card_id: key_card_id,
            key_card_secret: key_card_secret || this.getSetting('key_card_secret'),
          },
        });

        // timeout
        timeoutId = setTimeout(() => {
          if (resolveFlag) return;

          this.emitter.off('cap:serial-port:command-receive', onCommand);
          reject(new Error('Timeout'));
        }, 3000);
      } catch (error) {
        reject(error);
      }
    });
  };

  ACSManager.prototype.alert = function (text, cb, timeout = 5000) {
    let timeoutId = null;
    const dialog = app.dialog.alert(text, () => {
      clearTimeout(timeoutId);

      if (cb) {
        try {
          cb();
        } catch (error) {
          // ignore
        }
      }
    });

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        try {
          dialog.close();
        } catch (error) {
          // ignore
        }

        if (cb) {
          try {
            cb();
          } catch (error) {
            // ignore
          }
        }
      }, timeout);
    }
  };

  ACSManager.prototype.closeAllDialog = function () {
    while (true) {
      try {
        const dialog = app.dialog.close();
        if (!dialog) {
          break;
        }
      } catch (e) {
        break;
      }
    }
  };

  /**
   * @param {string} sql
   * @param {any} params
   * @returns
   */
  ACSManager.prototype.executeSql = function (sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Access Control Database is not initialized'));
        return;
      }

      if (!sql) {
        reject(new Error('SQL is required'));
        return;
      }

      this.db.executeSql(
        sql,
        params,
        (resultSet) => {
          resolve(resultSet);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  ACSManager.prototype.showToast = function (text, timeout = 2000) {
    app.toast
      .create({
        text: text,
        position: 'bottom',
        closeTimeout: timeout,
      })
      .open();
  };

  ACSManager.prototype.requestInDeededPermission = function () {
    return new Promise((resolve, reject) => {
      cordova.plugins.permissions.requestPermissions(
        [
          cordova.plugins.permissions.READ_PHONE_STATE,
          cordova.plugins.permissions.WAKE_LOCK,
          cordova.plugins.permissions.READ_EXTERNAL_STORAGE,
          cordova.plugins.permissions.WRITE_EXTERNAL_STORAGE,
          cordova.plugins.permissions.CAMERA,
        ],
        () => {
          resolve(true);
        },
        () => {
          reject(new Error('Permission denied'));
        }
      );
    });
  };

  ACSManager.prototype.subscribeMqttTopic = function (topic, autoReconnect = true) {
    if (!topic) {
      return;
    }

    if (autoReconnect) {
      this._topics.add(topic);
    }

    mqtt
      .subscribe(topic)
      .then(() => {
        // ignore
      })
      .catch((err) => {
        if (autoReconnect) {
          setTimeout(() => {
            this.subscribeMqttTopic(topic, autoReconnect);
          }, 2000);
        }
      });
  };

  /**
   * @param {string} code
   */
  ACSManager.prototype.urmetCall = async function (code) {
    // urmet baudrate 115200
    const callCode = {};
    callCode['0'] = 'B030'; // 0
    callCode['1'] = 'B131'; // 1
    callCode['2'] = 'B232'; // 2
    callCode['3'] = 'B333'; // 3
    callCode['4'] = 'B434'; // 4
    callCode['5'] = 'B535'; // 5
    callCode['6'] = 'B636'; // 6
    callCode['7'] = 'B737'; // 7
    callCode['8'] = 'B838'; // 8
    callCode['9'] = 'B939'; // 9
    callCode['B'] = 'E262'; // BELL
    callCode['K'] = 'EB6B'; // OK
    callCode['X'] = 'F878'; // CANCEL
    callCode['U'] = 'F575'; // UP
    callCode['D'] = 'E464'; // DOWN
    callCode['N'] = 'EE6E'; // UNKNOWN
    callCode['Q'] = 'F171'; // F1
    callCode['W'] = 'F777'; // F2
    callCode['E'] = 'E565'; // F3

    if (!callCode[code]) {
      throw new Error('Invalid call code');
    }

    await Capacitor.Plugins.YoswitSerialPort.sendData({
      deviceName: 'SerialPort-Urmet-VC',
      message: callCode[code],
    });
  };

  /**
   * @param {string} vip_address
   */
  ACSManager.prototype.buildComelitCallFrame = function (vip_address) {
    // comelit baudrate 1200
    const calculateFCS = (bytes) => {
      let fcs = 0xff;
      bytes.forEach((byte) => {
        fcs ^= byte;
      });
      return fcs;
    };

    const vipAddressBytes = this.encoder.encode(vip_address);
    const ctrlByte = 0x89;
    const infobyte = 0x80;
    const frameBytes = new Uint8Array([
      this.comelitConstant.FRAME_FLAG.SOT,
      ctrlByte,
      infobyte,
      ...vipAddressBytes,
      calculateFCS(new Uint8Array([ctrlByte, infobyte, ...vipAddressBytes])),
      this.comelitConstant.FRAME_FLAG.EOT,
    ]);

    const hex = Array.from(frameBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex;
  };

  /**
   * @param {object} cfg
   * @param {number} delay
   */
  ACSManager.prototype.writeDataToSerialPort = async function (cfg, delay = 400) {
    this._serialportQueue.addTask(async () => {
      await Capacitor.Plugins.YoswitSerialPort.sendData(cfg);
    });
    this._serialportQueue.addTask(async () => {
      await this.sleep(delay);
    });
  };

  ACSManager.prototype.formatSizeUnits = function (bytes, decimals = 4) {
    try {
      if (bytes === 0) return '0 B';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    } catch (error) {
      return '0 B';
    }
  };

  /**
   * Octopus Card Hex:
   * 0000FF22DE710030303030303030303030303030303030303030303030303030413139353734375D00
   *
   * Run Parse Result:
   * Old Card:   0
   * New Card:   169432903
   *
   * 0000FF12EE130030303030303030303036313946433739A400
   *
   * Run Parse Result:
   * Old Card:   102366329
   * New Card:   0
   *
   * @param {string} hexstr
   * @returns
   */
  ACSManager.prototype.parseOctopusCardIDFromHex = function (hexstr) {
    if (!hex) return '';

    const regexFindTheString = (input) => {
      try {
        const pattern1 = /[0-9aA-Z]+/;
        const ans = pattern1.exec(input);
        return ans ? ans[0] : '';
      } catch (error) {
        return '';
      }
    };

    const getNewCard = (hex) => {
      try {
        // copy string
        const cpHex = hex.slice(0);
        const len = parseInt(cpHex.substring(6, 8), 16);
        const newCardIDEndIndex = (len - 2 - 17) * 2;
        const newHex = hex.substring(48, 48 + newCardIDEndIndex);
        const newAscii = newHex.convertToAscii();
        const actualAscii = regexFindTheString(newAscii);
        if (!actualAscii) {
          throw new Error('Invalid actual ascii');
        }

        return (parseInt(actualAscii, 16) || '').toString();
      } catch (error) {
        return '';
      }
    };

    const newCard = getNewCard(hexstr);
    if (newCard) {
      return newCard;
    }

    const getOldCard = (hex) => {
      try {
        const cpHex = hex.slice(0);
        const oldHex = cpHex.substring(16, 46);
        const oldAscii = oldHex.convertToAscii();
        const actualAscii = regexFindTheString(oldAscii);
        return parseInt(actualAscii, 16).toString();
      } catch (error) {
        return '';
      }
    };

    return getOldCard(hexstr);
  };

  ACSManager.prototype.getSerialPortDevice = function (deviceName) {
    try {
      let device = null;
      for (let i = 1; i < 5; i++) {
        if (deviceName === this.getSetting(`com${i}_device_name`)) {
          device = {
            device_name: deviceName,
            path: this.getSetting(`com${i}_path`),
            device_baudrate: this.getSetting(`com${i}_device_baudrate`) ? parseInt(this.getSetting(`com${i}_device_baudrate`)) : null,
          };
          break;
        }
      }

      return device;
    } catch (error) {
      return null;
    }
  };

  ACSManager.prototype.healthCheck = function () {
    setTimeout(async () => {
      console.log('ACS Health Checking...');

      if (this._isCreated) {
        this.inspectEnv().catch(() => {
          this.restartApp();
        });
      }

      // MQTT Connection Check
      if (this.getSignal('mqtt') !== 0 || !mqtt.connected) {
        try {
          await mqtt.connect();
        } catch (error) {
          // loop again
          this.healthCheck();
        }
      }
    }, 2000);
  };

  ACSManager.prototype.forbiddenNetworkChangeBanner = function () {
    http2.setAllowEmitNetworkChange(false);

    // remove offline css
    $('#offline-css').remove();
    $('.offline-message').remove();
  };

  // mounted
  window.acsManager = new ACSManager();
  return window.acsManager;
};
