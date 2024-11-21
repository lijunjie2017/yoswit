window.device_wifi_setting_vm = null;
window.device_wifi_setting_component = {
  template: /*html*/ `
  <div class="container" v-cloak>
  <div>
    <div class="card">
      <div class="card-header" style="text-align: center;">
        <div class="wifi-img">
          <i class="icon material-icons text-color-primary text-color-green" v-if="wifiStatus == 1" style="font-size: 50px;">wifi</i>
          <i class="icon material-icons text-color-primary text-color-red" v-if="wifiStatus == 2" style="font-size: 50px;">wifi_off</i>
        </div>
        <div class="wifi-title text-color-green" v-if="wifiStatus == 1">{{_("Connected")}}</div>
        <div class="wifi-title text-color-red" v-if="wifiStatus == 2">{{_("Not Connected")}}</div>
      </div>
      <div class="card-content card-content-padding" style="padding-top: 0">
        <div>
          <div class="list">
            <ul>
              <li class="item-content item-input no-padding-left">
                <div class="item-inner no-padding-right">
                  <div class="item-title item-label" lang="en" style="font-size: 16px;">{{_("Ssid")}} <span class="text-color-red" style="font-size: 16px;">({{wifi_tip}})</span></div>
                  <div class="item-input-wrap">
                    <input type="text" name="ssid" v-model="setting.ssid" :placeholder="ssid" required validate v-on:focus="showWifiInfo"/>
                    <div class="wifi-box" v-if="wifiShowStatus">
                      <div class="list">
                        <ul style="padding-left: 0px;">
                          <li v-for="(kitem,kindex) in localWifiList" :key="kindex" v-on:click="clickWifiBox(kitem.ssid)">
                            <a class="item-content" style="padding-left: 0px">
                              <div class="item-inner" style="padding-right: 0px">
                                <div class="item-title">{{kitem.ssid}}</div>
                              </div>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li class="item-content item-input no-padding-left">
                <div class="item-inner no-padding-right">
                  <div class="item-title item-label" lang="en" style="font-size: 16px;">{{_("Password")}}</div>
                  <div class="item-input-wrap">
                    <input
                      type="password"
                      name="password"
                      v-model="setting.ssid_password"
                      v-on:focus="hideWifiInfo"
                      :placeholder="password_name"
                      required
                      validate
                    />
                    <i class="material-icons" style="position:absolute;right:0px;top:0px;padding:10px 0px 10px 10px;font-size:20px;z-index:999999" func="show_hide_password_field">visibility_off</i>
                  </div>
                </div>
              </li>
              <li class="item-content item-input no-padding-left" style="display: none">
                <div class="item-inner no-padding-right">
                  <div class="item-title item-label">{{_("email")}}</div>
                  <div class="item-input-wrap">
                    <input type="email" name="email" v-model="setting.email" :placeholder="email" required validate />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="card margin-bottom-half my-3" v-if="type != 2">
      <div class="card-content card-content-padding">
        <div class="row">
          <div class="col-auto">
            <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
              <i class="material-icons">info</i>
            </div>
          </div>
          <div class="col align-self-center no-padding-left">
            <h5 class="no-margin-bottom">{{_('WiFi Infomation')}}</h5>
          </div>
          <div class="col-auto"></div>
        </div>
        <div style="margin-top: 10px">
          <div class="list">
            <ul>
              <li>
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">{{_('IPv4 address')}}</div>
                    <div class="item-after" name="ipaddress">{{wifiInfo.ipaddress}}</div>
                  </div>
                </a>
              </li>
              <li>
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">{{_('Wifi Mac Address')}}</div>
                    <div class="item-after" name="wifimacaddress">{{wifiInfo.wifimacaddress}}</div>
                  </div>
                </a>
              </li>
              <li>
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">{{_('Ipv6')}}</div>
                    <div class="item-after" name="ipv6">{{wifiInfo.ipv6}}</div>
                  </div>
                </a>
              </li>
              <li>
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">{{_('Bssid')}}</div>
                    <div class="item-after" name="bssid">{{wifiInfo.bssid}}</div>
                  </div>
                </a>
              </li>
              <li>
                <a class="item-content" style="padding-left: 0px">
                  <div class="item-inner" style="padding-right: 0px">
                    <div class="item-title">{{_('Rssi')}}</div>
                    <div class="item-after" name="rssi">{{wifiInfo.rssi}}</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  `,
  props: ['gateway', 'guid', 'type', 'device_name','slot_index'],
  data: () => {
    return {
      // data
      localWifiList: [],
      settingStatus: false,
      wifiStatus: 2,
      wifiShowStatus: false,
      wifi_tip: _('2.4 GHz Wi-Fi Only'),
      ssid: _('SSID'),
      password_name: _('Password'),
      email: _('Email'),
      mqttTimer:null,
      connectTemp : 0,
      setting: {
        ssid: '',
        ssid_password: '',
        email: users[users.current].usr,
        server_url: 'mqtt://' + erp.settings[erp.appId].mqtt_server,
        port: erp.settings[erp.appId].mqtt_port,
        username: '',
        server_password: '',
      },
      originalSsid: '',
      originalSsidPassword: '',
      originalEmail: '',
      wifiInfo: {
        ipaddress: '',
        wifimacaddress: '',
        ipv6: '',
        bssid: '',
        rssi: '',
      },
    };
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    console.log("beforeDestroy");
    clearTimeout(this.$preloaderHide);
    clearTimeout(this.$subscribeTimer);
    emitter.off(this.$wifiTopic,this.$wifiTopicFun);
  },
  methods: {
    // methods
    async init() {
      console.log("commings")
      this.settingStatus = false; //this is for wifi setting status
      try {
        console.log(this.guid);
        let guid = this.guid;
        let device = cloneDeep(erp.info.device[guid]);
        console.log(device);
        let settingList = device.settings;
        settingList.forEach((item) => {
          if (item.setting_type === 'Wifi SSID') {
            this.setting.ssid = item.setting;
            this.originalSsid = item.setting;
          }
          if (item.setting_type === 'Wifi Password') {
            this.setting.ssid_password = item.setting;
            this.originalSsidPassword = item.setting;
          }
          if(item.setting_type === 'Email Address'){
            this.originalEmail = item.setting;
          }
        });
        if (this.setting.ssid && this.setting.ssid_password) {
          this.getJsonData();
        } else {
          this.wifiStatus = 2;
          let thisJson = await db.get('wifiList');
          if (thisJson) {
            this.localWifiList = JSON.parse(thisJson);
            console.log('this.localWifiList', this.localWifiList);
          }
          WifiWizard2.getConnectedSSID()
            .then((res) => {
              this.setting.ssid = res;
            })
            .catch((err) => {
              console.log(TAG, err);
            });
        }
        this.checkIfOnline();
      } catch (err) {
        console.log(err);
      }
    },
    checkIfOnline() {
      let guid = this.guid;
      let mac = core_utils_get_mac_address_from_guid(guid, false);
      let topic_self = '';
      let devices = cloneDeep(erp.info.profile.profile_device);
      devices.forEach((item) => {
        if (item.device == guid && item.gateway) {
          topic_self = item.gateway;
        }
      });
      //this should depend on the setting username

      if (!topic_self) {
        if(this.originalEmail){
          topic_self = `${mac.toLowerCase()}-${this.originalEmail.toLowerCase()}`;
        }else{
          topic_self = `${mac.toLowerCase()}-${users[users.current].usr.toLowerCase()}`;
        }
      }
      window.topic_self = topic_self;
      //check if online
      let will_topic = `will/${md5(md5(topic_self.toLowerCase()))}`;
      mqtt.subscribe(will_topic);
      this.$subscribeTimer =  setTimeout(()=>{
        mqtt.subscribe(will_topic);
      },10*1000)
      this.$preloaderHide = setTimeout(() => {
        if(this.$preloaderHide){
          clearTimeout(this.$preloaderHide);
        }
        app.preloader.hide();
        if(this.slot_index && this.slot_index == 1){
          app.dialog.alert(_('Connection timeout. Please check the SSID and password.'));
        }
      }, 1000 * 60);
      //emitter.off(will_topic);
      if(this.$wifiTopicFun){
        emitter.off(will_topic,this.$wifiTopicFun);
      }
      this.$wifiTopicFun = async(res)=>{
        console.log('component res', res);
        let message = res.message;
        //debugger
        if (message == 'Online') {
          clearTimeout(this.$subscribeTimer);
          clearTimeout(this.$preloaderHide);
          this.connectTemp = 3;//control the mqtt connect count;
          //check the state of the connect status
          app.preloader.hide();
          this.wifiStatus = 1;
          console.log('component', this.settingStatus);
          if (this.settingStatus) {
            emitter.emit('wifi/set', { code: 1 });
          }
        } else {
          //this.checkIfOnline();
          this.connectTemp++;
          if(this.connectTemp<3){
            // this.mqttTimer = setTimeout(()=>{
            //   this.checkIfOnline();
            // },10*1000);
          }
          this.wifiStatus = 2;
          emitter.emit('wifi/set', { code: 0 });
        }
      }
      this.$wifiTopic = will_topic;
      emitter.on(will_topic,this.$wifiTopicFun);
    },
    showWifiInfo() {
      if (this.localWifiList.length !== 0) {
        this.wifiShowStatus = true;
      }
    },
    hideWifiInfo() {
      this.wifiShowStatus = false;
    },
    clickWifiBox(ssid) {
      this.wifiShowStatus = false;
      this.localWifiList.forEach((item) => {
        if (ssid === item.ssid) {
          this.setting.ssid = item.ssid;
          this.setting.ssid_password = item.ssid_password;
        }
      });
    },
    async saveLocalWifi() {
      let wifiList = [];
      //get the local wifi setting
      let json = await db.get('wifiList');
      let list = [];
      let addStatus = true;
      if (json) {
        list = JSON.parse(json);
        list.forEach((item) => {
          if (item.ssid === this.setting.ssid) {
            item.ssid_password = this.setting.ssid_password;
            addStatus = false;
          }
        });
        if (addStatus) {
          list.push({
            ssid: this.setting.ssid,
            ssid_password: this.setting.ssid_password,
          });
        }
        db.set('wifiList', JSON.stringify(list));
      } else {
        list.push({
          ssid: this.setting.ssid,
          ssid_password: this.setting.ssid_password,
        });
        db.set('wifiList', JSON.stringify(list));
      }
    },
    async iot_device_wifi_form_save() {
      //save the wifi data
      let guid = this.guid;
      console.log('guid', guid);

      app.preloader.show();
      this.$this_timer = setTimeout(()=>{
        if(this.$this_timer){
          clearTimeout(this.$this_timer);
        }
        app.preloader.hide();
        app.dialog.alert(_('Connection timeout.Please check the SSID and password.'));
      },40*1000)
      this.saveLocalWifi();
      //check the input data
      if (this.setting.ssid === '' || this.setting.ssid_password === '') {
        app.preloader.hide();
        app.dialog.alert('Please fill in the SSID and Password.');
        emitter.emit('wifi/set', { code: 0 });
        return;
      }
      //check if the ssid and the password and the topic have no save,break this step and next step
      if(this.setting.ssid === this.originalSsid && this.setting.ssid_password === this.originalSsidPassword && this.setting.email === this.originalEmail && this.wifiStatus == 1){  
        clearTimeout(this.$this_timer);
          window.globalUpdate = true;
          if (this.type == 2) {
            app.preloader.show();
            this.checkIfOnline();
          } else {
            mainView.router.back();
          }
          //app.preloader.hide();
          this.settingStatus = true;
          return
      }
      // if (!this.setting.email) {
      //   this.setting.email = users[users.current].usr;
      // }
      console.log('!!!', this.setting.email);
      const saveSsid = ()=>{
        const data = '932000' + this.setting.ssid.length.toString(16).pad('0000') + this.setting.ssid.convertToHex();
        return window.peripheral[guid].write([{
          service: 'ff80',
          characteristic: 'ff81',
          data: data,
        }]);
      }
      const saveSsidPassword = ()=>{
        const data = '932100' + this.setting.ssid_password.length.toString(16).pad('0000') + this.setting.ssid_password.convertToHex();

          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          }]);
      }
      const saveEmail = ()=>{
        const data = '932200' + this.setting.email.length.toString(16).pad('0000') + this.setting.email.convertToHex();

          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          }]);
      }
      const savePort = ()=>{
        const data = '9301000002' + (this.setting.port * 1).toString(16).pad('0000');

        return window.peripheral[guid].write([{
          service: 'ff80',
          characteristic: 'ff81',
          data: data,
        }]);
      }
      const resetDevice = ()=>{
        const data = '8110';
        return window.peripheral[guid].write([{
          service: 'ff80',
          characteristic: 'ff81',
          data: data,
        }]);
      }
      const saveServerUrl = ()=>{
        const data = '930000' + this.setting.server_url.length.toString(16).pad('0000') + this.setting.server_url.convertToHex();

        return window.peripheral[guid].write([{
          service: 'ff80',
          characteristic: 'ff81',
          data: data,
        }]);
      }
      const restartDevice = ()=>{
        return window.peripheral[guid].write([{
          service: 'ff80',
          characteristic: 'ff81',
          data: '810E',
        }]);
      }
      const sleep = (ms)=>{
        return new Promise((resolve, reject)=>{
          setTimeout(() => {
            resolve();
          }, ms);
        })
      }
      const updateSetting = ()=>{
        return iot_device_setting_sync_server(guid, null, null, true, {
          'Wifi SSID': this.setting.ssid,
          'Wifi Password': this.setting.ssid_password,
          'Email Address': this.setting.email || 'null',
          'Server Port': this.setting.port || 'null',
          'Server URI': this.setting.server_url || 'null',
        });
      }
      const updateDeviceGateway = ()=>{
        let mac = core_utils_get_mac_address_from_guid(guid, false);
          return http.request(`/api/method/appv6.checkDeviceGateways`, {
            method: 'POST',
            dataType: 'json',
            serializer: 'json',
            data: {
              guid: guid,
              platform: 'YO105',
              title: mac.toUpperCase(),
            },
            contentType: 'application/json',
          });
      }
      const updateErp = ()=>{
        let mac = core_utils_get_mac_address_from_guid(guid, false);
        let devices = erp.info.profile.profile_device;
        devices.forEach(item=>{
          if(item.name == this.device_name){
            item.gateway = `${mac.toLowerCase()}-${this.setting.email.toLowerCase()}`;
          }
        })
        let url = `/api/resource/Profile/${erp.info.profile.name}`;
        let method = 'PUT';
        let data = {
          profile_device : devices
        };
        return http.request(url, {
          method: method,
          dataType: 'json',
          serializer: 'json',
          data: data,
          contentType: 'application/json',
        });
      }
      try{
        await window.peripheral[guid].connect();
        // await resetDevice();
        // await sleep(10*1000);
        await window.peripheral[guid].connect();
        await saveSsid();
        await saveSsidPassword();
        await saveEmail();
        await savePort();
        await saveServerUrl();
        //debugger
        await updateErp();
        await updateSetting();
        await updateDeviceGateway();
        await restartDevice();
        await sleep(10*1000);
        clearTimeout(this.$this_timer);
        window.globalUpdate = true;
        this.settingStatus = true;
        if (this.type == 2) {
          app.preloader.show();
          this.checkIfOnline();
        } else {
          mainView.router.back();
        }
      }catch(error){
        app.preloader.hide();
        if (this.type == 2) {
          emitter.emit('wifi/set', { code: 0 });
        }
        //clearTimeout(this_timer);
        clearTimeout(this.$this_timer);
        app.dialog.alert(_(erp.get_log_description(error)));
      }
      return
      iot_ble_check_enable()
        .then(() => {
          return window.peripheral[guid].connect();
        })
        .catch((error) => {
          //debugger
          console.log(error);
          app.preloader.hide();
          app.dialog.alert(`Connect Failed`);
          if (this.type == 2) {
            emitter.emit('wifi/set', { code: 0 });
          }
        })
        .then(() => {
          // ssid
          const data = '932000' + this.setting.ssid.length.toString(16).pad('0000') + this.setting.ssid.convertToHex();

          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          }]);
        })
        .then(() => {
          const data = '932100' + this.setting.ssid_password.length.toString(16).pad('0000') + this.setting.ssid_password.convertToHex();

          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          }]);
        })
        .then(() => {
          const data = '932200' + this.setting.email.length.toString(16).pad('0000') + this.setting.email.convertToHex();

          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          }]);
        })
        .then(() => {
          let mac = core_utils_get_mac_address_from_guid(guid, false);
          let devices = cloneDeep(erp.info.profile.profile_device);
          devices.forEach(item=>{
            if(item.name == this.device_name){
              item.gateway = `${mac.toLowerCase()}-${this.setting.email.toLowerCase()}`;
            }
          })
          let url = `/api/resource/Profile/${erp.info.profile.name}`;
          let method = 'PUT';
          let data = {
            profile_device : devices
          };
          return http.request(url, {
            method: method,
            dataType: 'json',
            serializer: 'json',
            data: data,
            contentType: 'application/json',
          });
        })
        .then(() => {
          //update the erp data
          let profile_device = erp.info.profile.profile_device;
          let mac = core_utils_get_mac_address_from_guid(guid, false);
          profile_device.forEach((item) => {
            if (item.name == this.device_name) {
              item.gateway = `${mac.toLowerCase()}-${this.setting.email}`;
            }
          });
          const data = '9301000002' + (this.setting.port * 1).toString(16).pad('0000');

          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          }]);
        })
        .then(() => {
          const data = '930000' + this.setting.server_url.length.toString(16).pad('0000') + this.setting.server_url.convertToHex();

          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          }]);
        })
        .then(() => {
          return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: '810E',
          }]);
          // return iot_ble_write(guid, 'ff80', 'ff81', '810E');
        })
        .then(() => {
          //this.iot_device_ipv4_address_get(2);
          return iot_device_setting_sync_server(guid, null, null, true, {
            'Wifi SSID': this.setting.ssid,
            'Wifi Password': this.setting.ssid_password,
            'Email Address': this.setting.email || 'null',
            'Server Port': this.setting.port || 'null',
            'Server URI': this.setting.server_url || 'null',
          });
        })
        .catch((err) => {
          //debugger
          app.preloader.hide();
          console.log(err);
          clearTimeout(this_timer);
          if (this.type == 2) {
            emitter.emit('wifi/set', { code: 0 });
          }
          app.dialog.alert(err);

        })
        .then(() => {
          let mac = core_utils_get_mac_address_from_guid(guid, false);
          return http.request(`/api/method/appv6.checkDeviceGateways`, {
            method: 'POST',
            dataType: 'json',
            serializer: 'json',
            data: {
              guid: guid,
              platform: 'YO105',
              title: mac.toUpperCase(),
            },
            contentType: 'application/json',
          });
        })
        .catch((err) => {
          //debugger
          console.log(err);
          clearTimeout(this_timer);
          //app.preloader.hide();
          return new Promise((resolve, reject) => {
            resolve();
          });
        })
        .then(()=>{
          //debugger
          return new Promise((resolve, reject)=>{
            setTimeout(() => {
              resolve();
            }, 10*1000);
          })
        })
        .then(() => {
          clearTimeout(this_timer);
          emitter.emit('refresh', {});
          if (this.type == 2) {
            app.preloader.show();
            this.checkIfOnline();
          } else {
            mainView.router.back();
          }
          //app.preloader.hide();
          this.settingStatus = true;
        })
        .catch((err) => {
          //debugger
          console.error(err);
          clearTimeout(this_timer);
          app.preloader.hide();
          if (this.type == 2) {
            emitter.emit('wifi/set', { code: 0 });
          }
          if (!iot_ble_exception_message(err, false) && !core_server_exception_message(err)) {
            app.dialog.alert(err);
          }
        });
    },
    async iot_device_ipv4_address_get(type) {
      let guid = this.guid;
      const p = Object.values(window.scanned_periperals).find((item) => item.guid == guid && item.advertising);
      //console.log(p);
      //get ip address
      ble.startNotification(
        p.id,
        'ff80',
        'ff82',
        (rs) => {
          if (rs.startsWith('9325')) {
            console.log('>>>> iot_mode_setup_iaq_ip' + rs);
            //check is nor wifi setting
            let wifi_length = rs.substring(8, 10);
            if (wifi_length == '00') {
              app.preloader.hide();
              if (type == 2) {
                //app.dialog.alert('Wifi is not set or connection error.', runtime.appInfo.name);
              }
              return;
            }
            const byteStrings = rs.match(/.{1,2}/g);

            // const length = parseInt(byteStrings[4], 16);

            const ipHex = byteStrings.slice(5).join('');
            $(`input[name="ipaddress"]`).val(this.hexToPlainText(ipHex));
            //return(hexToPlainText(ipHex));
          }
        },
        (err) => {
          //reject(err);
        }
      );
      iot_ble_write(guid, 'ff80', 'ff81', '9325', false).catch();
    },
    hexToPlainText(hexString) {
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
    },
    async getJsonData() {
      let guid = this.guid;
      const p = Object.values(scanned_periperals).find((item) => item.guid == guid && item.advertising);
      // let cmd = [{ 'action': 'connect' }];
      await peripheral[guid].connect();
      // await ha_process_periperal_cmd(p.id, cmd, true);
      ble.startNotification(
        p.id,
        'ff80',
        'ff82',
        (rs) => {
          if (rs.startsWith('9329')) {
            let data = rs.substring(10, rs.length);
            console.log('>>>> iot_mode_setup_iaq_ip' + this.hexToPlainText(data));
            //check is nor wifi setting
            let wifi_length = rs.substring(8, 10);
            if (wifi_length == '00') {
              //app.preloader.hide();
              if (type == 2) {
                app.dialog.alert('Wifi is not set or connection error.');
              }
              return;
            }
            console.log(JSON.parse(this.hexToPlainText(data)));
            let jsonData = JSON.parse(this.hexToPlainText(data));
            if (isset(jsonData.ipv4)) {
              this.wifiInfo.ipaddress = jsonData.ipv4;
              this.wifiInfo.wifimacaddress = jsonData.macAddress;
              this.wifiInfo.ipv6 = jsonData.ipv6;
              this.wifiInfo.bssid = jsonData.bssid;
              this.wifiInfo.rssi = jsonData.rssi;
              // $(`.item-after[name="ipaddress"]`).text(jsonData.ipv4);
              // $(`.item-after[name="wifimacaddress"]`).text(jsonData.macAddress);
              // $(`.item-after[name="ipv6"]`).text(jsonData.ipv6);
              // $(`.item-after[name="bssid"]`).text(jsonData.bssid);
              // $(`.item-after[name="rssi"]`).text(jsonData.rssi);
            }
          }
        },
        (err) => {
          //reject(err);
        }
      );
      iot_ble_write(guid, 'ff80', 'ff81', '9329', false).catch(() => {});
    },
  },
};

window.controller_device_gateway_setting = (gateway, guid) => {
  try {
    if (window.device_gateway_setting_vm) {
      window.device_gateway_setting_vm.$destroy();
      window.device_gateway_setting_vm = null;
      emitter.off(`status/${md5(md5(window.topic_self.toLowerCase()))}`);
    }
  } catch (err) {
    // ignore
  }

  mainView.router.once('routeChanged', () => {
    try {
      if (window.device_gateway_setting_vm) {
        window.device_gateway_setting_vm.$destroy();
        window.device_gateway_setting_vm = null;
      }
    } catch (err) {
      // ignore
    }
  });

  window.device_wifi_setting_vm = new Vue({
    el: '#device-wifi-setting',
    template: `
    <device-wifi-setting-component :gateway="gateway" :guid="guid"></device-wifi-setting-component>
    `,
    data: {
      gateway: gateway,
      guid: guid,
    },
    components: {
      DeviceWifiSettingComponent: window.device_wifi_setting_component,
    },
  });
};
