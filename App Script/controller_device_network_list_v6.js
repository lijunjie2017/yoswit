window.device_network_list_component = {
  template: /*html*/ `
    <div class="container">
      <div class="list ha-guide-list no-margin">
          <ul>
            <li class="swipeout scene swipeout-delete-manual" :class="item.isdisabled?'disabled':''" v-for="(item,index) in networkList" :key="index">
              <div class="card swipeout-content no-shadow no-border bg-color-gray margin-bottom overflow-hidden text-color-white h-110">
                <div class="overlay"></div>
                <div
                  class="coverimg width-100 position-absolute lazy lazy-fade-in"
                  :style="{'height': '100%','background-size': 'cover','background-image': 'url('+frappe_get_url(item.image)+')'}"
                ></div>
                <div class="card-content card-content-padding">
                  <div
                    class="template-info"
                    style="
                      text-shadow:
                        1px 1px 2px grey,
                        0 0 2px black,
                        0 0 2px grey;
                    "
                  >
                    
                  </div>
                  <div class="item-content">
                    <div class="item-inner justify-content-start">
                    <div v-if="type != 1 && !item.isdisabled" class="check-box display-flex justify-content-center align-items-center">
                    <i
                      class="material-icons text-color-white"
                      style="font-size: 30px"
                      v-if="!item.ischeck"
                      v-on:click="changeNetworkStatus(item)"
                      >check_box_outline_blank</i
                    >
                    <i
                      class="material-icons text-color-white"
                      style="font-size: 30px"
                      v-else="item.ischeck"
                      v-on:click="changeNetworkStatus(item)"
                      >check_box</i
                      >
                    </div>
                      <div
                        class="h5 d-block text-color-white"
                        :class="!item.isdisabled?'margin-left':''"
                        style="
                          text-shadow:
                            1px 1px 2px grey,
                            0 0 2px black,
                            0 0 2px grey;
                          width:100%;
                        "
                      >
                        {{_(item.title)}}
                        <div class="item-subtitle" v-if="item.isdisabled" mobmob="1">
                          <div class="mobmob"></div>
                          <div>{{tran(getGatewayInfo(item.relaxGateway).room_name)}} - {{getGatewayInfo(item.relaxGateway).name}}</div>
                        </div>
                      </div>
                    </div>
                    <div class="item-after">
                      <a
                        class="button button-small button-round button-fill icon-button"
                        v-on:click="toDetail(item)"
                        style="width: 40px; height: 40px; border-radius: 50%"
                      >
                        <i class="f7-icons" style="font-size: 18px">doc_text_search</i>
                      </a>
                      <a
                        class="button button-small button-round button-fill icon-button"
                        style="background-color: red; margin-left: 10px; width: 40px; height: 40px; border-radius: 50%"
                        v-on:click="onDeleted(index)"
                        v-if="type == 1"
                      >
                        <i class="icon material-icons"  style="font-size: 20px">delete</i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="device-null" v-if="networkList.length == 0">
          <div class="block" style="text-align: center">
            <span class="material-icons" style="font-size: 100px; color: #ddd">meeting_room</span>
            <p style="display:none;">${_('You don not have any network batch, create one')}</p>
          </div>
          <div class="block block-strong">
            <p class="row">
              <a class="col button button-large" v-on:click="createNetwork()">{{ _('Create Network') }}</a>
            </p>
          </div>
        </div>
        <div class="fab fab-right-bottom" v-if="type != 1" style="position: fixed;bottom: 10px;right: 10px;">
          <a style="text-align: center" v-on:click="createNetwork()">
            <i class="icon material-icons">add</i>
          </a>
        </div>
    </div>
      `,
  props: ['guid', 'subdevice_name', 'type', 'config','gateway'],
  data: () => {
    return {
      sceneList: [],
      networkList: [],
      otherGatewayMapDeviceList: [],
      localTrigerSceneList: [],
      localActionSceneList: [],
      sheetMap: {},
    };
  },
  mounted: function () {
    console.log('comming');
    Vue.prototype.$init = this.initNetwork;
    Vue.prototype.$download = this.download;
    this.initGatewayConfig();
    this.initNetwork();
    this.scan();
    emitter.on('refresh', (data) => {
      this.initNetwork();
    });
    //debugger
    if (this.$addNetwork) {
      emitter.off('devic/network/add', this.$addNetwork);
    }
    if (this.$networkFun) {
      emitter.off('devic/network/next', this.$networkFun);
    }
    this.$networkFun = (data) => {
      let guid = data.guid;
      console.log(data);
      if (this.networkList.length == 0) {
        //to add networl
        let index = 0;
        mainView.router.navigate(`/mobile-app/device-network-detail?network_index=${index + 1}&edit=0`);
        emitter.emit('devic/network/index', {
          code: 0,
        });
      } else {
        emitter.emit('devic/network/index', {
          code: 1,
        });
      }
    };
    this.$addNetwork = (data) => {
      console.log('createNetwork');
      this.createNetwork();
    };
    emitter.on('devic/network/add', this.$addNetwork);
    emitter.on('devic/network/next', this.$networkFun);
    setTimeout(() => {
      emitter.on('device_network_update', (data) => {
        this.initNetwork(true);
      });
    }, 500);
  },
  beforeDestroy() {
    console.log('beforeDestroy');
    emitter.off('refresh');
    emitter.off('device_network_update');
    emitter.off('devic/network/next', this.$networkFun);
    emitter.off('devic/network/add', this.$addNetwork);
    //emitter.off('set_timmer');
  },
  computed: {},
  watch: {},
  methods: {
    async onDeleted(index) {
      //check if have mutiway devices,can not del
      let devices = cloneDeep(erp.info.profile.profile_device);
      let networkMap = this.networkList[index];
      let network_id = networkMap.index;
      let delStatus = true;
      devices.forEach((item) => {
        if (isset(item.network_1)) {
          let mapList = JSON.parse(item.network_1);
          if (mapList.length) {
            let idList = mapList.map((zitem) => parseInt(zitem.network_id));
            let checkIndex = idList.indexOf(parseInt(network_id));
            if (checkIndex != -1) {
              delStatus = false;
            }
          }
        }
      });
      if (!delStatus) {
        app.dialog.alert(`${_('The network includes gateway devices and cannot be deleted in bulk')}`);
        return;
      }
      app.dialog.confirm(
        `${_('Confirm Deletion?')}`,
        async () => {
          app.dialog.preloader();
          console.log(index);
          devices.forEach((item) => {
            if (parseInt(item.network_id) == parseInt(network_id)) {
              item.network_id = 0;
            }
          });
          try {
            await http2.request(encodeURI('/api/resource/Profile/' + erp.info.profile.name), {
              method: 'PUT',
              responseType: 'json',
              dataType: 'json',
              responseType: 'json',
              serializer: 'json',
              timeout: 60,
              data: {
                profile_device: devices,
              },
            });
            app.dialog.close();
            erp.info.profile.profile_device = devices;
            //save the ble command
            if (this.type == 1) {
              mainView.router.refreshPage();
            } else {
              this.initNetwork();
            }
            //this.initNetwork();
          } catch (error) {
            app.dialog.close();
            app.dialog.alert(error);
          }
          this.networkList.splice(index, 1);
        },
        () => {}
      );
    },
    getGatewayInfo(gateway){
      if(!gateway){
        return {};
      }
      let name = '';
      let room_name = '';
      let profileDevices = cloneDeep(erp.info.profile.profile_device);
      let device_name = '';
      profileDevices.forEach((item)=>{
        if(item.gateway == gateway && item.device_mode == 'Gateway'){
          device_name = item.name;
        }
      })
      let subdevices = erp.info.profile.profile_subdevice;
      subdevices.forEach((item)=>{
        if(item.profile_device == device_name){
          name = tran(item.title);
          room_name = tran(item.room_name);
        }
      })
      console.log("name",name,"room_name",room_name);
      return {name,room_name};
    },
    initGatewayConfig() {
      //find other gateway config
      if (this.type == 1) {
        return;
      }
      let subdevices = erp.info.profile.profile_subdevice;
      subdevices.forEach((item) => {
        if (item.device_button_group == 'Yoswit Gateway' && this.guid != item.device) {
          if (item.config) {
            this.otherGatewayMapDeviceList = this.otherGatewayMapDeviceList.concat(item.config.split(','));
          }
        }
      });
      console.log('otherGatewayMapDeviceList', this.otherGatewayMapDeviceList);
    },
    async initNetwork(checkStatus) {
      this.networkList = [];
      let profileDevices = cloneDeep(erp.info.profile.profile_device);
      let networkMap = {};
      profileDevices.forEach((item) => {
        if (isset(networkMap[`${item.network_id}`])) {
          networkMap[`${item.network_id}`]++;
        } else {
          networkMap[`${item.network_id}`] = 1;
        }
      });
      for (let i in networkMap) {
        if (i != 0) {
          this.networkList.push({
            title: _('Network') + ` ${i}`,
            index: i,
            count: networkMap[i],
            image: `https://dev.mob-mob.com/files/network.jpeg`,
            ischeck: this.config.split(',').indexOf(i.toString()) != -1 || checkStatus ? true : false,
            isdisabled: this.otherGatewayMapDeviceList.indexOf(i.toString()) != -1 ? true : false,
            relaxGateway:this.findRelaxGateway(i)
          });
        }
      }
    },
    findRelaxGateway(network_id){
      let devices = cloneDeep(erp.info.profile.profile_device);
      let relaxGateway = '';
      devices.forEach((item)=>{
        if(parseInt(item.network_id) == parseInt(network_id)){
          relaxGateway = item.gateway;
        }
      })
      return relaxGateway;
    },
    async createNetwork() {
      //get the profile network
      let index = this.networkList.length ? 1 : 0;
      this.networkList.forEach((item) => {
        if (parseInt(item.index) > 1) {
          index = parseInt(item.index);
        }
      });
      mainView.router.navigate(`/mobile-app/device-network-detail?network_index=${index + 1}&edit=0`);
      // this.networkList.push({
      //   title : _('Network')+` ${index+1}`,
      //   index : index+1,
      //   count : 0,
      //   image : `https://dev.mob-mob.com/files/scene.jpg`
      // })
    },
    checkNetwork() {
      let networkList = this.networkList.filter((item) => {
        return item.ischeck;
      });
      console.log('networkList', networkList);
      let url = encodeURI(`/api/resource/Profile/${erp.info.profile.name}`);
      http2.request(url, {
        method: 'PUT',
        serializer: 'json',
        responseType: 'json',
        debug:true,
        data : {
          profile_device : erp.info.profile.profile_device
        }
      }).then((resData)=>{
        emitter.emit('network/post', {
          code: 1,
          networkList: networkList,
        });
      })
    },
    changeNetworkStatus(item) {
      item.ischeck = !item.ischeck;
      console.log('item',item);
      //should del the network device gateway
      let profileDevices = cloneDeep(erp.info.profile.profile_device);
      if (!item.ischeck) {
        profileDevices.forEach((kitem) => {
          if (parseInt(kitem.network_id)  === parseInt(item.index) ) {
            kitem.gateway = '';
          }
        });
      }else{
        profileDevices.forEach((kitem) => {
          if (parseInt(kitem.network_id)  === parseInt(item.index) ) {
            kitem.gateway = this.gateway;
          }
        });
      }
      erp.info.profile.profile_device = profileDevices;
    },
    toDetail(item) {
      mainView.router.navigate(`/mobile-app/device-network-detail?network_index=${item.index}&edit=1`);
    },
    async scan() {
      await bleManager.stopScan();
      await bleManager.wait(200);
      bleManager.scan(this.onDiscovery, async () => {
        await bleManager.wait(5000);
        this.scan();
      });
    },
    async onDiscovery(p) {
      if (!isset(p)) {
        return;
      }
      setTimeout(() => {
        if (!isset(peripheral[p.guid])) {
          peripheral[p.guid] = new Peripheral(p);
        }
        emitter.emit('ha_network_update_status', { p: p });
      }, 10);
    },
  },
};
