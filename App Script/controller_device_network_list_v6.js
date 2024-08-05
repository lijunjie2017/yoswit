window.device_network_list_component = {
  template: /*html*/ `
    <div class="container">
      <div class="list ha-guide-list">
          <ul>
            <li class="swipeout scene swipeout-delete-manual" v-for="(item,index) in networkList" :key="index">
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
                    <div class="item-inner">
                      <div
                        class="h5 d-block text-color-white margin-bottom-half"
                        style="
                          text-shadow:
                            1px 1px 2px grey,
                            0 0 2px black,
                            0 0 2px grey;
                        "
                      >
                        {{_(item.title)}}
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
                      >
                        <i class="icon material-icons" style="font-size: 20px">delete</i>
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
            <p>${_("You don't have any network batch, create one")}</p>
          </div>
          <div class="block block-strong">
            <p class="row">
              <a class="col button button-large" v-on:click="createNetwork()">{{ _('Create Network') }}</a>
            </p>
          </div>
        </div>
        <div class="fab fab-right-bottom" v-if="type != 1">
          <a style="text-align: center" v-on:click="createNetwork()">
            <i class="icon material-icons">add</i>
          </a>
        </div>
    </div>
      `,
  props: ['guid', 'subdevice_name', 'type'],
  data: () => {
    return {
      sceneList: [],
      networkList: [],
      localTrigerSceneList: [],
      localActionSceneList: [],
      sheetMap: {},
    };
  },
  mounted: function () {
    console.log('comming');
    Vue.prototype.$init = this.initNetwork;
    Vue.prototype.$download = this.download;
    this.initNetwork();
    this.scan();
    emitter.on('refresh', (data) => {
      this.initNetwork();
    });
    if(this.$addNetwork){
      emitter.off('devic/network/add',this.$addNetwork);
    }
    if(this.$networkFun){
      emitter.off('devic/network/next',this.$networkFun);
    }
    this.$networkFun = (data)=>{
      let guid = data.guid;
      console.log(data);
      if (this.networkList.length == 0) {
        //to add networl
        let index = 0;
        mainView.router.navigate(`/mobile-app/device-network-detail?network_index=${index + 1}&edit=0`);
        emitter.emit('devic/network/index',{
          code : 0
        })
      }else{
        emitter.emit('devic/network/index',{
          code : 1
        })
      }
    }
    this.$addNetwork = (data)=>{
      this.createNetwork();
    }
    emitter.on('devic/network/add',this.$addNetwork);
    emitter.on('devic/network/next',this.$networkFun);
    setTimeout(() => {
      emitter.on('device_network_update', (data) => {
        this.initNetwork();
      });
    }, 500);
  },
  beforeDestroy() {
    console.log('beforeDestroy');
    emitter.off('refresh');
    emitter.off('device_network_update');
    emitter.off('devic/network/next',this.$networkFun);
    emitter.off('devic/network/add',this.$addNetwork);
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
            mainView.router.refreshPage();

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
    async initNetwork() {
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
          });
        }
      }
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
