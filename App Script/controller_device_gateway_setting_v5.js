window.device_gateway_setting_vm = null;
window.device_gateway_setting_component = {
  template: /*html*/`
  <div class="container" v-cloak>
    <div style="overflow:hidden;margin:15px;margin-top:0px;">
      <div style="float:left;width:55px;height:80px;text-align:left;background-image:url('${
        runtime.appConfig.app_api_url + '/files/gateway.png'
      }');background-size:40px auto;background-position:left center;background-repeat:no-repeat;"></div>
      <div style="margin-left:55px;margin-top: 10px;">
        <div style="font-size:25px;font-weight:bold;height:37px;overflow:hidden;">{{ device.device_model }}-{{ device.mac_address }}</div>
        <div style="-ms-word-break: break-all;word-break: break-all;word-break: break-word;font-size:12px;">GUID: {{ gateway }}</div>
      </div>
    </div>

    <div class="block" style="margin-bottom:15px;margin-top:15px;">
      <p class="row">
        <div class="col button button-large button-raised button-fill" @click="syncGateways" style="margin:0px 10px;">Sync Gateways</div>
      </p>
    </div>

    <div class="list media-list no-margin list-group no-more-class">
      <ul>
          <template v-for="item in profileDevice" :key="item.isGroup ? item.groupName : item.name">
              <li class="list-group-title swipeout display-flex justify-content-space-between" v-if="item.isGroup">
                <div class="swipeout-content">{{ item.groupName }}</div>
                <label class="checkbox p-2 mx-1" v-if="item.groupName === _('Mob-Mob Devices')">
                  <!-- checkbox input -->
                  <input type="checkbox" v-model="allchecked" @click.stop="handleChangeAllGateway"/>
                  <!-- checkbox icon -->
                  <i class="icon-checkbox" style="opacity: 1;"></i>
                </label>
              </li>

              <li class="swipeout" :guid="item.device" v-if="!item.isGroup && item.device_model != 'YO105'">
                  <div class="item-content swipeout-content">
                      <label class="checkbox p-2 mx-1" >
                        <!-- checkbox input -->
                        <input type="checkbox" v-model="item.checked" @click.stop="handleChangeGateway(item)"/>
                        <!-- checkbox icon -->
                        <i class="icon-checkbox" style="opacity: 1;"></i>
                      </label>

                      <div class="item-media">
                          <img :src="parseImage(item.device)" width="60" />
                      </div>
                      <div class="item-inner">
                          <div class="item-title-row">
                              <div class="item-title display-flex justify-content-flex-start align-content-center" :signal="item.signal" >
                              <div class="signal"></div>
                              <span>{{ item.device_model }} (v{{item.firmware}})</span>
                              <i class="material-icons" style="color:red;" v-if="item.checked && !item.link">link_off</i>
                              <i class="material-icons" style="color:green;" v-if="item.checked && item.link">link</i>
                              </div>
                          </div>
                          <div class="item-subtitle text-muted">{{ item.subdeviceNameList }}-{{ item.device_name.substring(0, 12) }}</div>

                          <div class="item-subtitle text-muted" v-if="item.gateway">{{ item.gateway }}</div>
                          <div class="item-subtitle" style="color:red;font-weight:bold;" v-else>No Gateway</div>
                      </div>
                  </div>
                  <div class="swipeout-actions-right">
                    <a href="#" class="link" :class="[item.default_connect === 1 ? 'color-orange' : 'color-cust-grey']" @click="handleChangeDefaultConnect(item)"><i class="icon material-icons">check</i></a>
                  </div>
              </li>
          </template>
      </ul>
    </div>
  </div>
  `,
  props: ['gateway', 'guid'],
  data: () => {
    return {
      profileDevice: [],
      device: {
        mac_address: '',
        device_model: '',
      },
      allchecked : false,
    }
  },
  mounted() {
    this.getProfile();
  },
  beforeDestroy() {},
  methods: {
    getProfile: function () {
      app.preloader.show();
      http
        .request(encodeURI('/api/resource/Profile/' + frappe.user.data.app_profile_id), {
          method: 'GET',
          responseType: 'json',
        })
        .then((rs) => {
          if (rs.data && rs.data.data.profile_device) {
            let profile_device = rs.data.data.profile_device;
            let profile_subdevice = rs.data.data.profile_subdevice;
            //in order to get the firmware on gateways list
            profile_device.forEach(item=>{
                for(let i in window.profile_subdevice){
                    if(item.name === window.profile_subdevice[i].profile_device){
                        item.firmware = window.profile_subdevice[i].firmware;
                    }
                }
            })
            console.log(profile_device);
            this.profileDevice = this.groupNetworkDevice(profile_device, profile_subdevice);
          }
        })
        .then(() => {
          return http.request(encodeURI('/api/resource/Device/' + this.guid), {
            responseType: 'json',
            method: 'GET',
          });
        })
        .then((res) => {
          this.device = res.data.data;
        })
        .then(() => {
          this.checkMqttStatus();
          this.startScanDeviceForGateway();
          app.preloader.hide();
        })
        .catch((err) => {
          app.preloader.hide();
        });
    },
    groupNetworkDevice: function (profileDevice, profileSubdevice) {
      const map = {};
      profileDevice.forEach((device) => {
        device.link = false;
        device.signal = 0;
        device.network_id = device.network_id || '0';
        const groupName = device.network_id || '0';
        if (!map[groupName]) {
          map[groupName] = [];
        }

        map[groupName].push(device);
      });

      const keys = Object.keys(map).sort((a, b) => {
        a = parseInt(a);
        b = parseInt(b);
        if (a === 0) {
          return 1;
        } else if (b === 0) {
          return -1;
        } else {
          return a - b;
        }
      });

      // sort position
      keys.forEach((e) => {
        const devices = map[e];

        devices.sort((a, b) => {
          return a.network_position - b.network_position;
        });
      });

      const arr = [];
      // New Network
      arr.push({
        network_id: '---',
        isGroup: true,
        groupName: _('Mob-Mob Devices'),
      });

      // New Network
      keys.forEach((e) => {
        arr.push({
          network_id: e,
          isGroup: true,
          groupName: e === '0' ? _('Unassigned') : _('Network') + ' ' + e,
        });

        const devices = map[e];
        devices.forEach((e) => {
          const subdevices = profileSubdevice.filter((e2) => e2.profile_device === e.name).map((e2) => `${tran(e2.room_name)}-${e2.title}`);

          arr.push({
            ...e,
            subdeviceNameList: subdevices.join(','),
            isGroup: false,
            checked: e.gateway && e.gateway === this.gateway?true:false,
          });
        });
      });

      // No Unassigned, must create
      if (arr.findIndex((e) => e.network_id === '0') === -1) {
        arr.push({
          network_id: '0',
          isGroup: true,
          groupName: _('Unassigned'),
        });
      }
      console.log('arr',arr)
      return arr;
    },
    parseImage: function (guid) {
      const hexid = guid.substring(guid.length - 6, guid.length - 2);
      const model = ble_model[hexid];

      if (!model || !model.image) {
        return '';
      }

      if (model.image && model.image.startsWith('http')) {
        return model.image;
      } else {
        return runtime.appConfig.app_api_url + model.image;
      }
    },
    async handleChangeGateway(item) {
      // const profileId = frappe.user.data.app_profile_id;
      console.log('itemobj',item)
      console.log('item',item.checked);
      const action = item.checked;
      //const action = item.checked;
      if(action){
        app.dialog.confirm('Do you confirm to remove the device from the gateway '+this.gateway+'?', ()=>{
            this.postDataToErp(item,action);
        }, function(){
            item.checked = true;
        });
      }else{
        this.postDataToErp(item,action);
      }
    },
    async handleChangeAllGateway(){
      console.log(this.allchecked);
      this.profileDevice.forEach(item=>{
        item.checked = !this.allchecked;
        item.gateway = !this.allchecked?this.gateway:false;
        /*
        handle defalut connect,choose the max value
        1.get the network list
        2.compare the network list and create a obj
        3.create new list save default connect obj
        4.change the profileDevice list
        */
      })
      if(!this.allchecked){
        console.log(this.profileDevice)
        this.profileDevice.forEach(item=>{
          if(!item.isGroup && item.network_id){
            item.default_connect = 0;
            this.profileDevice.forEach(kitem=>{
              if(item.network_id === kitem.network_id && item.device_name !== kitem.device_name){
                if(item.signal > kitem.signal){
                  item.default_connect = 1;
                  //kitem.default_connect = 0;
                }
              }
            })
          }
        })
      }
      this.allchecked = !this.allchecked;
    },
    async postDataToErp(item,status){
        const action = item.checked;
        const gateway = !status ? this.gateway : '';
        try {
            app.preloader.show();
            await http.request(encodeURI('/api/resource/Profile Device/' + item.name), {
              method: 'PUT',
              serializer: 'json',
              data: {
                gateway: gateway,
              },
            });
    
            item.gateway = gateway;
            item.checked = !status;
    
            app.preloader.hide();
          } catch (err) {
            app.preloader.hide();
          }
    },
    handleChangeDefaultConnect(item) {
        //only set one defalut connect
        let list = this.profileDevice.filter((ele)=>{return ele.network_id == item.network_id});
        let default_connect_count = 0;
        list.forEach((kitem,kindex)=>{
            if(kitem.name != item.name && kitem.default_connect == 1){
                default_connect_count++;
                app.dialog.alert(`${kitem.subdeviceNameList} has set default connect.`)
            }
        })
        if(default_connect_count){
            return
        }
        let url = "/api/resource/Profile%20Device/" + encodeURI(item.name);
        http.request(url, {
            method: 'PUT',
            serializer: 'json',
            data: {
                default_connect: item.default_connect === 0 ? 1 : 0
            },
        }).then(()=>{
            item.default_connect = item.default_connect === 0 ? 1 : 0;
        }).catch((err)=>{
            alert(err);
        })
      
    },
    //sync gateways to erp
    syncGateways(){
        //check network group only have defalut connect
        let list = [];
        let default_connect_count = 0;
        let checklist = [];
        let group_list = this.profileDevice.filter((ele)=>{return (ele.isGroup && parseInt(ele.network_id )> 0 )});
        this.profileDevice.forEach((kitem,kindex)=>{
            if(kitem.default_connect == 1 && parseInt(kitem.network_id )> 0){
                default_connect_count++;
            }
            if(kitem.checked){
                checklist.push(kitem)
                if(kitem.default_connect == 1){
                    list.push({
                        "mac_address" : kitem.device_name.substring(0, 12).match(/.{1,2}/g).join(":"),
                        "guid" : kitem.device,
                        "default_connect" : kitem.default_connect,
                        "model" : kitem.device_model,
                        "firmware" : kitem.firmware,
                        "password" : kitem.password
                    })
                }else if(kitem.device_model != 'YO105'){
                    let parent_mac = '';
                    this.profileDevice.forEach(zitem=>{
                        if(zitem.default_connect == 1 && zitem.network_id == kitem.network_id){
                            parent_mac = zitem.device_name.substring(0, 12).match(/.{1,2}/g).join(":");
                        }
                    })
                    list.push({
                        "mac_address" : kitem.device_name.substring(0, 12).match(/.{1,2}/g).join(":"),
                        "parent_mac" : parent_mac,
                        "guid" : kitem.device,
                        "default_connect" : kitem.default_connect,
                        "model" : kitem.device_model,
                        "firmware" : kitem.firmware,
                        "password" : kitem.password
                    })
                }
            }
        })
        if(default_connect_count>5){
            app.dialog.alert(tran(`Exceeds the default connection limit.`));
            return
        }
        group_list.forEach(zitem=>{
            zitem.list = []
            this.profileDevice.forEach((kitem,kindex)=>{
                if(kitem.checked && zitem.network_id == kitem.network_id){
                    zitem.list.push(kitem);
                }
            })
        })
        console.log(group_list)
        let check_status = true;
        group_list.forEach(zitem=>{
            if(zitem.list.length > 0){
                let list = zitem.list.filter((ele)=>{return (ele.default_connect == 1)})
                if(list.length != 1){
                    check_status = false
                }
            }
        })
        app.dialog.confirm('Do you confirm to sync the device list to the gateway '+this.gateway+'?', ()=>{
            app.preloader.show();
            core_mqtt_publish("cmd/"+md5(md5(this.gateway.toLowerCase())), {
                command:"Control",
                function:"bleHelper.setList",
                params:list,
                callback:"",
                raw:""
            }, 0, false, false, false);
            
            setTimeout(function(){
                app.dialog.alert(_("Devices List with <b>"+list.length+"</b> is synced, please have a try or you may click sync again."));
                app.preloader.hide();
            }, 1000)
        }, function(){
        });
    },
    checkMqttStatus(){
        let topic_self = this.gateway;
        window.topic_self = topic_self;
        //core_mqtt_publish("status/"+md5(md5(topic_self.toLowerCase())), json, 0, true, false);
        core_mqtt_subscribe("status/"+md5(md5(topic_self.toLowerCase())), 0, false).then(()=>{
            core_mqtt_publish("cmd/"+md5(md5(topic_self.toLowerCase())), {
                "command":"Pubmsg",
                "function":"bleHelper.pubmsg",
                "params":"",
                "callback":"",
                "raw":""
            }, 0, false, false, false).then(() => {
                
            })
            _emitter.on("status/"+md5(md5(topic_self.toLowerCase())),(res)=>{
                let message = JSON.parse(res.message)
                if(isset(message.Device)){
                    let deviceobj = message.Device
                    console.log(deviceobj)
                    for(let i in deviceobj){
                        this.profileDevice.forEach((item,index)=>{
                            if(item.device == i ){
                                if(deviceobj[i].manufacturing_data || deviceobj[i].rssi){
                                    item.link = true;
                                }
                            }
                        })
                    }
                    this.$forceUpdate();
                }
            })
        })
    },
    startScanDeviceForGateway(){
      let that = this;
      let cmd = [{"action":'connect'},{"action":"write",data:'9390'}];
      cmd.push({"action":"startNotification",post:(id,s,rs)=>{
        //console.log('data',rs);
        let target_mackey = rs.substring(10,22).match(/.{1,2}/g).reverse().join('');
        let singal_str = rs.substring(22,24);
        let decimalValue = parseInt(singal_str, 16);
        let signal = 0;
        if (decimalValue & 0x80) {
            decimalValue -= 0x100;
        }
        if(decimalValue<0){
            if(decimalValue > -60) signal = 5;
            else if(decimalValue > -70) signal = 3;
            else signal = 1;
        }
        that.profileDevice.forEach(item=>{
          if(item.device_name){
            let this_macaddress = item.device_name.substring(0, 12);
            if(this_macaddress == target_mackey){
              item.signal = signal;
            }
          }
        })
        //console.log(target_mackey,decimalValue);
      }})
      let uuid = Object.values(scanned_periperals).find(item=>item.guid == this.guid).id;
      ha_process_periperal_cmd(uuid, cmd);
    }
  },
};

window.controller_device_gateway_setting = (gateway, guid) => {
  try {
    if (window.device_gateway_setting_vm) {
      window.device_gateway_setting_vm.$destroy();
      window.device_gateway_setting_vm = null;
      _emitter.off(`status/${md5(md5(window.topic_self.toLowerCase()))}`)
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

  window.device_gateway_setting_vm = new Vue({
    el: '#device-gateway-setting',
    template: `
    <device-gateway-setting-component :gateway="gateway" :guid="guid"></device-gateway-setting-component>
    `,
    data: {
      gateway: gateway,
      guid: guid
    },
    components: {
      DeviceGatewaySettingComponent: window.device_gateway_setting_component,
    },
  });
};
