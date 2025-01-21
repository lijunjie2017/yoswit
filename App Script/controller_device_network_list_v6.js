window.device_network_list_component = {
  template: /*html*/ `
    <div class="container">
      <div class="list ha-guide-list no-margin">
          <ul v-if="networkList.filter(item=>!item.isdisabled).length > 0">
            <li class="diy-title">
              <span>{{_('Unallocated')}}</span>
              <i class="icon material-icons help-icon popover-open" data-popover=".popover-menu">help</i>
            </li>
            <li class="swipeout scene swipeout-delete-manual" :class="item.isdisabled?'disabled':''" v-for="(item,index) in networkList" :key="index" v-if="!item.isdisabled">
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
          <ul v-if="networkList.filter(item=>item.isdisabled).length > 0">
            <li class="diy-title">
              <span>{{_('Allocated')}}</span>
              <i class="icon material-icons help-icon popover-open" data-popover=".popover-menu">help</i>
            </li>
            <li class="swipeout scene swipeout-delete-manual" v-for="(item,index) in networkList" :key="index" v-if="item.isdisabled">
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
                    <div v-if="type != 1" class="check-box display-flex justify-content-center align-items-center">
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
                        class="h5 d-block text-color-white margin-left"
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
        <div class="popover popover-menu">
          <div class="popover-angle"></div>
          <div class="popover-inner">
            <div class="page-content">
              <p style="font-size: 14px;padding:15px;">{{_('Your current operation involves Gateway configuration and network deployment. Assigned networks can be deleted along with the associated Gateway networking data. However, once deleted, if you need to use the removed Gateway device again, you will need to reconfigure it for networking.')}}</p>
            </div>
          </div>
        </div>
    </div>
      `,
  props: ['guid', 'subdevice_name', 'type', 'config', 'gateway'],
  data: () => {
    return {
      sceneList: [],
      networkList: [],
      otherGatewayMapDeviceList: [],
      localTrigerSceneList: [],
      localActionSceneList: [],
      sheetMap: {},
      updateGatewayStatus : false,
      profileDeviceList: [],
      replaceList : []
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
  watch: {
    //listen updateGatewayStatus
    updateGatewayStatus(newVal){
      console.log('updateGatewayStatus',newVal);
      if(newVal){
        if(this.$actionSheetMap){
          this.$actionSheetMap.close();
        }
        this.updateErp();
      }
    }
  },
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
    getGatewayInfo(gateway) {
      if (!gateway) {
        return {};
      }
      let name = '';
      let room_name = '';
      let profileDevices = cloneDeep(erp.info.profile.profile_device);
      let device_name = '';
      profileDevices.forEach((item) => {
        if (item.gateway == gateway && item.device_mode == 'Gateway') {
          device_name = item.name;
        }
      });
      let subdevices = erp.info.profile.profile_subdevice;
      subdevices.forEach((item) => {
        if (item.profile_device == device_name) {
          name = tran(item.title);
          room_name = tran(item.room_name);
        }
      });
      console.log('name', name, 'room_name', room_name);
      return { name, room_name };
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
            relaxGateway: this.findRelaxGateway(i),
          });
        }
      }
      console.log('networkList', this.networkList);
    },
    findRelaxGateway(network_id) {
      let devices = cloneDeep(erp.info.profile.profile_device);
      let relaxGateway = '';
      devices.forEach((item) => {
        if (parseInt(item.network_id) == parseInt(network_id)) {
          relaxGateway = item.gateway;
        }
      });
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
    initSheet(list){
      if(this.$actionSheetMap){
        this.$actionSheetMap = null;
      }
      let sheetItem = ``;
      list.forEach(item=>{
        sheetItem += 
        `<li class="manufacturing-steps scenes-item-step-${item.index}">
          <div class="item-content" style="padding-right:15px;">
            <div class="item-inner">
              <div class="item-title">${_('Network')} ${item.index}</div>
            </div>
            <div class="item-after">
              <i class="icon material-icons">watch_later</i>
            </div>
          </div>
          <div class="item-content text-color-red error-text device-hidden" style="padding-right:15px;font-size:14px;">
            
          </div>
        </li>
        `
      })
      let sheetContent = /*html*/ `
      <div class="sheet-modal" style="height:auto">
        <div class="sheet-modal-inner">
          <div class="swipe-handler"></div>
          <div class="page-content">
            <div class="list list-strong list-outline list-dividers-ios">
              <ul>
                ${sheetItem}
              </ul>
            </div>
            <div class="block scene-retry device-hidden" style="text-align:center;padding-left:15px;padding-right:15px;">
              <div class="button button-fill button-save" style="padding:15px;" v-on:click="nextStep(1)">${_('Retry')}</div>
            </div>
          </div>
        </div>
      </div>
      `;
      if (isset(this.$actionSheetMap)) {
        this.$actionSheetMap.open();
        return;
      }
      this.$actionSheetMap = app.sheet.create({
        content: `${sheetContent}`,
        on: {
          closed: function () {},
        },
      });
      this.$actionSheetMap.open();
    },
    listenSingalList(gateway,network_list){
      setTimeout(()=>{
        core_mqtt_subscribe("status/"+md5(md5(gateway.toLowerCase())), 0, false).then(()=>{
          core_mqtt_publish("cmd/"+md5(md5(gateway.toLowerCase())), {
              "command":"Pubmsg",
              "function":"bleHelper.pubmsg",
              "params":"",
              "callback":"",
              "raw":""
          }, 0, false, false, false).then(() => {
              
          }).catch(error=>{
            for(let i in network_list){
              $(`.scenes-item-step-${network_list[i]}`).find('.error-text').removeClass('device-hidden');
              $(`.scenes-item-step-${network_list[i]}`).find('.error-text').html(_(erp.get_log_description(error)));
              $(`.scenes-item-step-${network_list[i]}`).find('.item-after i').addClass('text-color-red');
              $(`.scenes-item-step-${network_list[i]}`).find('.item-after i').html('close');
            }
            // if(this.$actionSheetMap){
            //   this.$actionSheetMap.close();
            // }
            //app.dialog.alert(_(erp.get_log_description(error)));
            return
          })
          
          emitter.on("status/"+md5(md5(gateway.toLowerCase())),(res)=>{
              let message = JSON.parse(res.message)
              debugger
              if(isset(message.Device)){
                  let deviceobj = message.Device
                  console.log("deviceobj",deviceobj);
                  let clearStatus = false;
                  let list_1 = [];
                  for(let j in deviceobj){
                    list_1.push(i);
                  }
                  if(list_1.length == 0){
                    for(let i in network_list){
                      $(`.scenes-item-step-${network_list[i]}`).find('.item-after i').addClass('text-color-green');
                      $(`.scenes-item-step-${network_list[i]}`).find('.item-after i').html('check_circle');
                    }
                  }
                  this.$forceUpdate();
              }
          })
      }).catch(error=>{
        for(let i in network_list){
          $(`.scenes-item-step-${network_list[i]}`).find('.error-text').removeClass('device-hidden');
          $(`.scenes-item-step-${network_list[i]}`).find('.error-text').html(_(erp.get_log_description(error)));
          $(`.scenes-item-step-${network_list[i]}`).find('.item-after i').addClass('text-color-red');
          $(`.scenes-item-step-${network_list[i]}`).find('.item-after i').html('close');
        } 
        //app.dialog.alert(_(erp.get_log_description(error)));
        return
        })
        
      },1000*3);
      //check if update the network list
      this.$checkUpdateSingalNetworkListTimer = setInterval(()=>{
        let checkStatus = true;
        $(`.manufacturing-steps`).each(function(){
          console.log($(this).find('.item-after i').hasClass('text-color-green'));
          if(!$(this).find('.item-after i').hasClass('text-color-green')){
            checkStatus = false;
          }
        })
        if(checkStatus){
          clearInterval(this.$checkUpdateSingalNetworkListTimer);
          this.updateGatewayStatus = true;
        }
        
      },1000*3)
    },
    listenNetworkList(obj,oldObj,list){
      debugger
      for(let i in obj){
        let network_id = '';
        list.forEach(item=>{
          if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
            network_id = item.index;
          }
        })
        debugger
        setTimeout(()=>{
          core_mqtt_subscribe("status/"+md5(md5(i.toLowerCase())), 0, false).then(()=>{
            core_mqtt_publish("cmd/"+md5(md5(i.toLowerCase())), {
                "command":"Pubmsg",
                "function":"bleHelper.pubmsg",
                "params":"",
                "callback":"",
                "raw":""
            }, 0, false, false, false).then(() => {
                
            }).catch(error=>{
              list.forEach(item=>{
                if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
                  $(`.scenes-item-step-${item.index}`).find('.error-text').removeClass('device-hidden');
                  $(`.scenes-item-step-${item.index}`).find('.error-text').html(_(erp.get_log_description(error)));
                  $(`.scenes-item-step-${item.index}`).find('.item-after i').addClass('text-color-red');
                  $(`.scenes-item-step-${item.index}`).find('.item-after i').html('close');
                }
              })
              //app.dialog.alert(_(erp.get_log_description(error)));
              return
            })
            
            emitter.on("status/"+md5(md5(i.toLowerCase())),(res)=>{
                let message = JSON.parse(res.message)
                debugger
                if(isset(message.Device)){
                    let deviceobj = message.Device
                    console.log("deviceobj",deviceobj);
                    let clearStatus = false;
                    let list_1 = [];
                    for(let j in deviceobj){
                      list_1.push(i);
                    }
                    let list_2 = [];
                    for(let j in oldObj){
                      if(j.toLowerCase() == i.toLowerCase()){
                        list_2.push(oldObj[j].device);
                      }
                    }
                    const set_1 = new Set(list_1);
                    let status = list_2.every(item => !set_1.has(item));
                    console.log(status);
                    if(status){
                      list.forEach(item=>{
                        if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
                          $(`.scenes-item-step-${item.index}`).find('.item-after i').addClass('text-color-green');
                          $(`.scenes-item-step-${item.index}`).find('.item-after i').html('check_circle');
                        }
                      })
                      clearTimeout(this.$clearStatusTimer);
                    }
                    this.$forceUpdate();
                }
            })
        }).catch(error=>{
          list.forEach(item=>{
            if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
              $(`.scenes-item-step-${item.index}`).find('.error-text').removeClass('device-hidden');
              $(`.scenes-item-step-${item.index}`).find('.error-text').html(_(erp.get_log_description(error)));
              $(`.scenes-item-step-${item.index}`).find('.item-after i').addClass('text-color-red');
              $(`.scenes-item-step-${item.index}`).find('.item-after i').html('close');
            }
          })
          // if(this.$actionSheetMap){
          //   this.$actionSheetMap.close();
          // }
          //app.dialog.alert(_(erp.get_log_description(error)));
          return
          })
          
        },1000*3)
        
      }
      //check if update the network list
      this.$checkUpdateNetworkListTimer = setInterval(()=>{
        let checkStatus = true;
        $(`.manufacturing-steps`).each(function(){
          console.log($(this).find('.item-after i').hasClass('text-color-green'));
          if(!$(this).find('.item-after i').hasClass('text-color-green')){
            checkStatus = false;
          }
        })
        if(checkStatus){
          clearInterval(this.$checkUpdateNetworkListTimer);
          this.updateGatewayStatus = true;
        }
        //send the pubmsg
        for(let i in obj){
          let network_id = '';
          list.forEach(item=>{
            if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
              network_id = item.index;
            }
          })
          setTimeout(()=>{
            core_mqtt_subscribe("status/"+md5(md5(i.toLowerCase())), 0, false).then(()=>{
              core_mqtt_publish("cmd/"+md5(md5(i.toLowerCase())), {
                  "command":"Pubmsg",
                  "function":"bleHelper.pubmsg",
                  "params":"",
                  "callback":"",
                  "raw":""
              }, 0, false, false, false).then(() => {
                  
              })
          })
            
          },1000*3)
        }
      },1000*3);
      this.$clearStatusTimer = setTimeout(()=>{
        if(this.$checkUpdateNetworkListTimer){
          clearInterval(this.$checkUpdateNetworkListTimer);
        }
      },10*1000)
    },
    async syncOldGateway(list){
      //list is disabled list
      let params_list = list;
      console.log('list',list);
      console.log("this.otherGatewayMapDeviceList",this.otherGatewayMapDeviceList)
      this.replaceList = list;
      let profileDevices = cloneDeep(erp.info.profile.profile_device);
      let oldDevicesList = [];
      let newDevicesList = [];
      let syncNoneGatewayList = [];
      let syncOldGatewayMap = {};
      let checkGatewayMap = {};
      let noneGatewayMap = {};
      //should check if only one network
      list.forEach(item=>{
        profileDevices.forEach(kitem=>{
          if(parseInt(kitem.network_id) == parseInt(item.index)){
            if(syncNoneGatewayList.indexOf(kitem.gateway) == -1){
              noneGatewayMap[kitem.gateway] = [];
              syncOldGatewayMap[kitem.gateway] = [];
              checkGatewayMap[kitem.gateway] = {};
              checkGatewayMap[kitem.gateway]['list'] = [];
              checkGatewayMap[kitem.gateway]['isEmpty'] = false;
              syncNoneGatewayList.push(kitem.gateway);
            }
          }
        })
      })
      syncNoneGatewayList.forEach(item=>{
        profileDevices.forEach(kitem=>{
          if(kitem.gateway == item){
            if(syncOldGatewayMap[item].indexOf(kitem.network_id) == -1 && kitem.network_id != 0){
              syncOldGatewayMap[item].push(kitem.network_id);
            }
          }
        })
      })
      list.forEach(item=>{
        profileDevices.forEach(kitem=>{
          if(parseInt(kitem.network_id) == parseInt(item.index)){
            if(isset(checkGatewayMap[kitem.gateway])){
              if(checkGatewayMap[kitem.gateway]['list'].indexOf(kitem.network_id) == -1 && kitem.network_id != 0){
                checkGatewayMap[kitem.gateway]['list'].push(kitem.network_id);
              }
            }
          }
        })
      });
      for(let i in checkGatewayMap){
        let list_1 = checkGatewayMap[i]['list'];
        let list_2 = syncOldGatewayMap[i];
        let newList = window.lodash.difference(list_2,list_1);
        console.log("newList",newList);
        if(newList.length == 0){
          checkGatewayMap[i]['isEmpty'] = true;
        }
      }
      console.log("checkGatewayMap",checkGatewayMap);
      console.log("syncOldGatewayMap",syncOldGatewayMap);
      console.log('syncNoneGatewayList',syncNoneGatewayList);
      console.log('noneGatewayMap',noneGatewayMap);
      //let newList = window.lodash.difference()
      //return;
      //find the old devices list
      this.otherGatewayMapDeviceList.forEach(item=>{
        profileDevices.forEach(kitem=>{
          if(parseInt(kitem.network_id) == parseInt(item)){
            oldDevicesList.push(kitem);
          }
        })
      })
      console.log('oldDevicesList',oldDevicesList);
      let oldGatewayMap = {};
      //find the new devices list
      oldDevicesList.forEach(item=>{
        if(!isset(oldGatewayMap[item.gateway])){
          oldGatewayMap[item.gateway] = [];
        }
        let listIndex = list.map(item=>{
          return parseInt(item.index)
        })
        if(listIndex.indexOf(parseInt(item.network_id)) == -1){
          newDevicesList.push(item);
        }
      })
      for(let i in oldGatewayMap){
        oldDevicesList.forEach(item=>{
          if(item.gateway == i){
            oldGatewayMap[i].push(item);
          }
        })
      }
      console.log('oldGatewayMap',oldGatewayMap);
      console.log('newDevicesList',newDevicesList);
      let gatewayMap = {};
      newDevicesList.forEach(item=>{
        if(!isset(gatewayMap[item.gateway])){
          gatewayMap[item.gateway] = [];
        }
      })
      for(let i in gatewayMap){
        newDevicesList.forEach(item=>{
          if(item.gateway == i){
            gatewayMap[i].push(item);
          }
        })
      }
      console.log('gatewayMap',gatewayMap);
      this.initSheet(list);
      //change to {"gateway":[]}
      for(let i in gatewayMap){
        let list = gatewayMap[i];
        let syncDevices = [];
        for(let j in list){
          if(list[j].default_connect == 1){
            syncDevices.push({
              "mac_address": list[j].device_name.substring(0, 12).match(/.{1,2}/g).join(":").toLowerCase(),
              "guid" : list[j].device,
              "default_connect": list[j].default_connect,
              "model": list[j].device_model,
              "firmware": peripheral[list[j].device].prop.firmware?peripheral[list[j].device].prop.firmware:0,
              "password": list[j].password
            })
          }else if(list[j].device_model != 'YO105'){
            let parent_mac = '';
            profileDevices.forEach(zitem=>{
              if(zitem.default_connect == 1 && zitem.network_id == list[j].network_id){
                  parent_mac = zitem.device_name.substring(0, 12).match(/.{1,2}/g).join(":");
              }
            })
            syncDevices.push({
              "mac_address": list[j].device_name.substring(0, 12).match(/.{1,2}/g).join(":").toLowerCase(),
              "guid" : list[j].device,
              "default_connect": list[j].default_connect,
              "model": list[j].device_model,
              "firmware": peripheral[list[j].device].prop.firmware?peripheral[list[j].device].prop.firmware:0,
              "password": list[j].password,
              "parent_mac": parent_mac
            })
          }
        }
        console.log('syncDevices',syncDevices);
        
        try{
          //should check if online
          let this_guid = '';
          profileDevices.forEach(item=>{
            if(item.gateway == i && item.device_mode == 'Gateway'){
              this_guid = item.device;
            }
          })
          let onlineStatus = peripheral[this_guid].prop.is_mobmob;
          if(onlineStatus != 1){
            setTimeout(()=>{
              params_list.forEach(item=>{
                if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
                  $(`.scenes-item-step-${item.index}`).find('.error-text').removeClass('device-hidden');
                  $(`.scenes-item-step-${item.index}`).find('.error-text').html(_('The gateway is offline.'));
                  $(`.scenes-item-step-${item.index}`).find('.item-after i').addClass('text-color-red');
                  $(`.scenes-item-step-${item.index}`).find('.item-after i').html('close');
                }
              })
            },500)
            return;
          }
          debugger
          await core_mqtt_publish("cmd/"+md5(md5(i.toLowerCase())), {
            command:"Control",
            function:"bleHelper.setList",
            params:syncDevices,
            callback:"",
            raw:""
          }, 0, false, false, false);
          
        }catch(err){
          setTimeout(()=>{
            list.forEach(item=>{
              if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
                $(`.scenes-item-step-${item.index}`).find('.error-text').removeClass('device-hidden');
                $(`.scenes-item-step-${item.index}`).find('.error-text').html(_(erp.get_log_description(err)));
                $(`.scenes-item-step-${item.index}`).find('.item-after i').addClass('text-color-red');
                $(`.scenes-item-step-${item.index}`).find('.item-after i').html('close');
              }
            })
          },1000)
          
          //app.dialog.alert(_(erp.get_log_description(err)));
          return;
        }
      }
      
      for(let i in checkGatewayMap){
        if(checkGatewayMap[i].isEmpty){
          try{
            //should check if online
            let this_guid = '';
            profileDevices.forEach(item=>{
              if(item.gateway == i && item.device_mode == 'Gateway'){
                this_guid = item.device;
              }
            })
            let onlineStatus = peripheral[this_guid].prop.is_mobmob;
            if(onlineStatus != 1){
              setTimeout(()=>{
                list.forEach(item=>{
                  if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
                    $(`.scenes-item-step-${item.index}`).find('.error-text').removeClass('device-hidden');
                    $(`.scenes-item-step-${item.index}`).find('.error-text').html(_('The gateway is offline.'));
                    $(`.scenes-item-step-${item.index}`).find('.item-after i').addClass('text-color-red');
                    $(`.scenes-item-step-${item.index}`).find('.item-after i').html('close');
                  }
                })
              },500)
              return;
            }
            await core_mqtt_publish("cmd/"+md5(md5(i.toLowerCase())), {
              command:"Control",
              function:"bleHelper.setList",
              params:[],
              callback:"",
              raw:""
            }, 0, false, false, false);
            this.listenSingalList(i,checkGatewayMap[i].list);

          }catch(err){
            setTimeout(()=>{
              list.forEach(item=>{
                if(item.relaxGateway.toLowerCase() == i.toLowerCase()){
                  $(`.scenes-item-step-${item.index}`).find('.error-text').removeClass('device-hidden');
                  $(`.scenes-item-step-${item.index}`).find('.error-text').html(_(erp.get_log_description(err)));
                  $(`.scenes-item-step-${item.index}`).find('.item-after i').addClass('text-color-red');
                  $(`.scenes-item-step-${item.index}`).find('.item-after i').html('close');
                }
              })
            },500)
            
            //app.dialog.alert(_(erp.get_log_description(err)));
            return
          }
        }else{
          this.listenNetworkList(gatewayMap,oldGatewayMap,list);
        }
      }
      
      
      // try{
      //   await http2.request(encodeURI(`/api/resource/Profile/${erp.info.profile.name}`),{
      //     method: 'PUT',
      //     serializer: 'json',
      //   })
      // }catch(err){
      //   console.log(err);
      // }
    },
    checkNetwork() {
      let networkList = this.networkList.filter((item) => {
        return item.ischeck;
      });
      console.log('networkList', networkList);
      let checkOtherGateway = false;
      networkList.forEach(item=>{
        if(item.isdisabled){
          checkOtherGateway = true;
        }
      })
      if(checkOtherGateway){
        app.dialog.confirm(`${_('You have selected the allocated network. Do you confirm that you want to remove the group of devices from the gateway?')}`,()=>{
          let list = networkList.filter(item=>{
            return item.isdisabled
          })
          console.log('list',list);
          this.profileDeviceList = cloneDeep(erp.info.profile.profile_device);
          list.forEach(item=>{
            this.profileDeviceList.forEach(kitem=>{
              if(parseInt(kitem.network_id) == parseInt(item.index)){
                kitem.gateway = '';
              }
            })
          })
          this.syncOldGateway(list);
        })
        return
      }
      
      let url = encodeURI(`/api/resource/Profile/${erp.info.profile.name}`);
      http2
        .request(url, {
          method: 'PUT',
          serializer: 'json',
          responseType: 'json',
          debug: true,
          data: {
            profile_device: erp.info.profile.profile_device,
          },
        })
        .then((resData) => {
          emitter.emit('network/post', {
            code: 1,
            networkList: networkList,
          });
        });
    },
    async updateErp(){
      let networkList = this.networkList.filter((item) => {
        return item.ischeck;
      });
      let url = encodeURI(`/api/resource/Profile/${erp.info.profile.name}`);
      try{
        await http2.request(url,{
          method: 'PUT',
          serializer: 'json',
          responseType: 'json',
          debug: true,
          data: {
            profile_device: this.profileDeviceList,
          },
        });
        emitter.emit('network/post', {
          code: 2,
          networkList: networkList,
          replaceList: this.replaceList
        });
      }catch(err){
        app.dialog.alert(err);
      }
    },
    changeNetworkStatus(item) {
      item.ischeck = !item.ischeck;
      console.log('item', item);
      //should del the network device gateway
      let profileDevices = cloneDeep(erp.info.profile.profile_device);
      if (!item.ischeck && !item.isdisabled) {
        profileDevices.forEach((kitem) => {
          if (parseInt(kitem.network_id) === parseInt(item.index)) {
            kitem.gateway = '';
          }
        });
      } else {
        profileDevices.forEach((kitem) => {
          if (parseInt(kitem.network_id) === parseInt(item.index) && !item.isdisabled) {
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
