window.scene_banner_component = {
  template: /*html*/ `
  <div class="card">
    <div class="card-content">
      <div
        class="list media-list no-margin"
        :id="'room-'+roomItem.idx+'-div'"
        :room="roomItem.name"
        v-for="(roomItem,roomIndex) in roomList"
        :key="roomItem.name"
        v-if="!roomItem.isHidden"
      >
        <ul>
          <li :id="'room-'+roomItem.idx+'-div-title'" class="swipeout room">
            <div class="item-content swipeout-content">
              <div class="item-inner">
                <div class="item-title-row">
                  <div
                    class="item-title"
                    lang="en"
                    :lang-packet="roomItem.title"
                    v-on:click="controller_common_home_collapse(roomItem.idx)"
                  >
                    <i class="room-collapse material-icons" :id="'collapse-'+roomItem.idx"> expand_more </i>
                    {{ tran(roomItem.title) }}
                  </div>
                </div>
              </div>
            </div>
          </li>
          <div class="scene-room-device-item">
            <div
              class="li-item"
              v-for="(subItem,subIndex) in subdevices"
              :key="subItem.name"
              v-if="subItem.profile_room == roomItem.name && !subItem.isHidden"
            >
              <li class="device swipeout" :guid="subItem.device">
                <div class="item-content swipeout-content">
                  <a class="item-link item-content no-chevron no-ripple no-active-state" style="width: 100%">
                    <div style="margin-top: 10px">
                      <i
                        class="material-icons text-color-gray"
                        style="font-size: 60px"
                        v-if="!subItem.chooseStatus"
                        v-on:click="showButton(subItem)"
                        >toggle_off</i
                      >
                      <i
                        class="material-icons text-color-theme"
                        style="font-size: 60px"
                        v-if="subItem.chooseStatus"
                        v-on:click="showButton(subItem)"
                        >toggle_on</i
                      >
                    </div>
                    <div
                      class="device-thumb item-media"
                      :style="{
              'background-image' : 'url('+subItem.imgUrl+')',
              'background-position' : 'center',
              'background-size' : 'contain',
              'position' : 'relative'
            }"
                    ></div>
                    <div class="item-inner">
                      <div class="item-title-row">
                        <div class="item-title ellipsis" lang="en" style="width: 180px">{{tran(subItem.title)}}</div>
                      </div>
                      <div class="item-subtitle">{{ subItem.device_model }}-{{ subItem.mac_address.substring(0,12) }}</div>
                      <div class="signal-panel item-text height-21" style="width: 120%">
                        <div>
                          <div class="status-info text-color-primary">{{subItem.firmware}}</div>
                        </div>
                      </div>
                    </div>
                  </a>
                  <div class="control-panel-right" style="">
                    <a class="right" v-on:click="${() => toScene(subItem)}" v-if="subItem.mainType == 0">
                      <div class="button button-raised button-big circle rf-sensor">
                        <i class="material-icons" style="line-height: 25px !important">block</i>
                      </div>
                    </a>
                    <div class="button button-raised button-big circle" v-if="subItem.mainType == 1">
                      <div>
                        <i class="material-icons" style="line-height: 70px !important; font-size: 25px !important">block</i>
                      </div>
                    </div>
                    <a
                      :class="subItem.ref == 0?'off_flag':'on_flag'"
                      :onoff="subItem.ref"
                      v-if="subItem.mainType == 2"
                      v-on:click="onOffItem(subItem)"
                    >
                      <div class="button button-raised button-big onoff"></div>
                    </a>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 4"
                    >
                      <div>
                        <i class="material-icons" style="line-height: 70px !important; font-size: 25px !important">touch_app</i>
                      </div>
                    </div>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 5"
                    >
                      <div>
                        <i class="material-icons" style="line-height: 70px !important; font-size: 25px !important"
                          >brightness_low</i
                        >
                      </div>
                    </div>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 6"
                    >
                      <div>
                        <i class="material-icons" style="line-height: 70px !important; font-size: 25px !important"
                          >brightness_high</i
                        >
                      </div>
                    </div>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 7"
                      v-on:click="openCloseItem(subItem)"
                    >
                      <div>
                        <img
                          :src="'https://my.yoswit.com/files/app/'+(subItem.ref === 0 ? 'close' : 'open') +'-curtain.svg'"
                          alt=""
                          style="width: 20px; height: 20px; margin-top: 20px"
                        />
                      </div>
                    </div>
                    <div class="button button-raised button-big circle" v-if="subItem.mainType == 9">
                      <div>
                        <i class="material-icons" style="line-height: 70px !important; font-size: 25px !important">pause</i>
                      </div>
                    </div>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 10"
                      style="background-color: var(--f7-theme-color)"
                      v-on:click="chooseTemplate(subItem)"
                    >
                      <div>
                        <i
                          class="material-icons text-color-white"
                          style="line-height: 70px !important; font-size: 25px !important"
                          >cleaning_services</i
                        >
                      </div>
                    </div>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 12"
                      v-on:click="chooseTemplate(subItem)"
                    >
                      <div>
                        <i class="material-icons" style="line-height: 70px !important; font-size: 25px !important"
                          >cleaning_services</i
                        >
                      </div>
                    </div>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 11"
                      style="background-color: var(--f7-theme-color)"
                      v-on:click="chooseTemplate(subItem)"
                    >
                      <div>
                        <i
                          class="material-icons text-color-white"
                          style="line-height: 70px !important; font-size: 25px !important"
                          >notifications_off</i
                        >
                      </div>
                    </div>
                    <div
                      class="button button-raised button-big circle"
                      v-if="subItem.mainType == 13"
                      v-on:click="chooseTemplate(subItem)"
                    >
                      <div>
                        <i class="material-icons" style="line-height: 70px !important; font-size: 25px !important"
                          >notifications_off</i
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="swipeout-actions-right">
                  <a v-on:click="cancelTemplate(subItem)" class="link color-red">
                    <i class="icon material-icons">cancel</i>
                  </a>
                </div>
              </li>
              <!-- subdevice bottom box start -->
              <li
                class="device subdevice"
                :class="{'device-hidden':subItem.buttonBoxType == 0?true:false,'display-flex':subItem.buttonBoxType == 0?false:true}"
                :style="{'height': subItem.buttonBoxType == 3?'77px':'67px'}"
              >
                <div class="row padding-tb flex-direction-column justify-content-center" v-if="subItem.buttonBoxType == 1">
                  <div class="col-100 medium-100 large-100">
                    <div class="content display-flex justify-content-center" style="margin-left: 15px; margin-right: 15px">
                      <div class="tip-title"><i class="icon material-icons" style="margin-right: 8px">brightness_low</i></div>
                      <div
                        class="range-slider range-slider-scene"
                        :guid="subItem.device"
                        :button_group="subItem.device_button_group"
                        :name="subItem.name"
                      ></div>
                      <div class="tip-title"><i class="icon material-icons" style="margin-left: 8px">brightness_high</i></div>
                    </div>
                  </div>
                </div>
                <div class="row padding-tb flex-direction-column justify-content-center" v-if="subItem.buttonBoxType == 2">
                  <div class="col-100 medium-100 large-100">
                    <div class="content display-flex justify-content-center" style="margin-left: 15px; margin-right: 15px">
                      <div class="tip-title">
                        <img
                          src="https://my.yoswit.com/files/app/close-curtain.svg"
                          alt=""
                          style="width: 20px; height: 20px; margin-right: 8px; margin-top: 5px"
                        />
                      </div>
                      <div
                        class="range-slider range-slider-scene"
                        :guid="subItem.device"
                        :button_group="subItem.device_button_group"
                        :name="subItem.name"
                      ></div>
                      <div class="tip-title">
                        <img
                          src="https://my.yoswit.com/files/app/open-curtain.svg"
                          alt=""
                          style="width: 20px; height: 20px; margin-left: 8px; margin-top: 5px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="item-content" style="width: 100%" v-if="subItem.buttonBoxType == 3">
                  <div class="item-inner">
                    <div
                      class="display-flex justify-content-space-between align-content-center align-items-center"
                      style="--f7-grid-gap: 3px"
                    >
                      <a
                        href="#"
                        class="col"
                        v-on:click="clickThermostatChange(subItem,'mode')"
                        command-type="mode"
                        :guid="subItem.device"
                      >
                        <div class="button button-raised button-big stop" style="width: 70px">
                          <img
                            style="width: 25px; height: 25px"
                            :src="'style/img/air_condition/icon-mode-'+dealWithThermostat(subItem.modeStr)+'.png'"
                          />
                        </div>
                      </a>
                      <a
                        href="#"
                        class="col"
                        v-on:click="clickThermostatChange(subItem,'fan')"
                        command-type="fan"
                        :guid="subItem.device"
                      >
                        <div class="button button-raised button-big stop" style="width: 70px">
                          <img
                            style="width: 25px; height: 25px"
                            :src="'style/img/air_condition/icon-speed-'+(subItem.speedVaule?subItem.speedVaule:0)+'.png'"
                          />
                        </div>
                      </a>
                      <a
                        href="#"
                        class="col"
                        v-on:click="clickThermostatChange(subItem,'reduce')"
                        command-type="reduce"
                        :guid="subItem.device"
                      >
                        <div class="button button-raised button-big stop" style="width: 70px; font-size: 25px">-</div>
                      </a>
                      <a
                        href="#"
                        class="col set-temp"
                        style="line-height: 60px; margin-top: 8px; text-align: center"
                        button-signal="5"
                      >
                        <span>{{subItem.temperature}}</span>℃
                      </a>
                      <a
                        href="#"
                        class="col"
                        v-on:click="clickThermostatChange(subItem,'add')"
                        command-type="reduce"
                        :guid="subItem.device"
                      >
                        <div class="button button-raised button-big stop" style="width: 70px; font-size: 25px">+</div>
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            </div>
            <!-- subdevice bottom box end -->
          </div>
        </ul>
      </div>
      <!-- room list end -->
    </div>
    <div class="row" style="margin-bottom: 15px; margin-top: 15px">
      <div class="col">
        <div class="button button-fill button-save" v-on:click="tindyCommandAndPostErp()">{{_("COMPLETE")}}</div>
      </div>
    </div>
  </div>
      `,
  props: ['guid', 'subdevice_name', 'type', 'config', 'scene_post_id'],
  data: () => {
    return {
      sceneList: [],
      networkList: [],
      otherGatewayMapDeviceList: [],
      localTrigerSceneList: [],
      localActionSceneList: [],
      sheetMap: {},
      updateGatewayStatus: false,
      profileDeviceList: [],
      replaceList: [],
    };
  },
  mounted: function () {},
  beforeDestroy() {
    //emitter.off('set_timmer');
  },
  computed: {},
  watch: {},
  methods: {
    initDevices() {
      let roomList = cloneDeep(erp.info.profile.profile_room);
      roomList.forEach((roomItem) => {
        if (roomName == roomItem.name) {
          roomItem.ischeck = true;
          roomItem.isHidden = false;
        } else {
          roomItem.ischeck = false;
          //roomItem.isHidden = true;
        }
      });
      this.roomList = roomList;
      let devices = this.initRoomDevices();
      //filter the room devices
      let roomMap = {};
      this.roomList.forEach((item) => {
        roomMap[item.name] = 0;
        item.isHidden = false;
      });
      devices.forEach((item) => {
        for (let i in roomMap) {
          if (item.profile_room == i && !item.isHidden) {
            roomMap[i]++;
          }
        }
      });
      this.roomList.forEach((item) => {
        if (roomMap[item.name] == 0) {
          item.isHidden = true;
        }
      });
    },
    initRoomDevices(){
      let devices = cloneDeep(erp.info.profile.profile_subdevice);
      let scenes = cloneDeep(erp.info.scene);
      let sceneMap;
      let tem_devices = [];
      for (let i in scenes) {
        if (scenes[i].name == this.scene_post_id) {
          sceneMap = scenes[i];
        }
      }
      //init the profile_device
      let profile_devices = cloneDeep(erp.info.profile.profile_device);
      devices.forEach((item) => {
        let device_name = item.profile_device;
        profile_devices.forEach((kitem) => {
          if (device_name === kitem.name) {
            item.device_model = kitem.device_model;
            item.mac_address = kitem.device_name.substring(0, 12);
            console.log('kitem.device', kitem.device);
            if (isset(window.peripheral[kitem.device])) {
              let firmware = window.peripheral[kitem.device].prop.firmware;
              item.firmware = firmware ? firmware : 0;
            }
          }
        });
      });
      //init the modelList
      let models = cloneDeep(erp.doctype.device_model);
      if (sceneMap) {
        tem_devices = JSON.parse(sceneMap.action);
      }
      devices.forEach((item) => {
        item.isload = false;
        tem_devices.forEach((kitem) => {
          if (kitem.name == item.name) {
            Object.assign(item, kitem);
            item.isload = true;
            console.log('item.mainType', item.mainType);
            if (item.mainType == 7 || item.mainType == 2) {
              this.initRangeBar(item.device, item.device_button_group, item.ref);
            }
          }
        });
        if (item.isload) return;
        item.mainType = 0;
        item.buttonBoxType = 0;
        item.ref = 1;
        if (item.device_button_group.startsWith('OPENCLOSE UART') || item.device_button_group.startsWith('DIMMING')) {
          item.ref = 100;
        }
        item.chooseStatus = false;
        //filter the device not show in the page
        item.isHidden = false;
        //YO780,YO780-Scene-12G,YO780-Scene-6G,YO105,YO790DC,YO205DC,YO203DC,YO202DS,YO201,YO161-H,YO161
        let fliterList = [
          'YO780',
          'YO780-Scene-12G',
          'YO780-Scene-6G',
          'YO780-Scene-4G',
          'YO780-Scene-1G',
          'YO105',
          'YO790DC',
          'YO205DC',
          'YO203DC',
          'YO202DS',
          'YO201',
          'YO161-H',
          'YO161',
        ];
        let fliterButtonGroup = ['RCU INPUT', 'ONOFF GANG'];
        //check if the button group is in the fliterButtonGroup
        if (fliterList.indexOf(item.device_model) > -1) {
          item.isHidden = true;
        }
        let triggerFliterList = ['YO105', 'YO121-BLE-LE', 'YO121-AC'];
        //rcu
        if (item.device_model == 'YO780' && item.device_button_group == 'ONOFF GANG1') {
          item.isHidden = true;
        }
        //choose status
        item.chooseStatus = false;
        let model = item.device_model;
        if (model == 'YO360') {
          item.modeStr = 2;
          item.speedVaule = 4;
          item.temperature = 26;
        }
        for (let i in models) {
          if (models[i].model_code === model) {
            if (isset(models[i].image)) {
              item.imgUrl = models[i].image;
            } else {
              item.imgUrl = 'https://my.yoswit.com/files/products/YO815.svg';
            }
          }
        }
      });
      this.subdevices = devices;
      return devices
    },
  },
  initRangeBar(guid, button_group, value) {
    setTimeout(() => {
      console.log($(`.range-slider-scene[guid="${guid}"][button_group="${button_group}"]`));
      let range_silder = app.range.create({
        el: `.range-slider-scene[guid="${guid}"][button_group="${button_group}"]`,
        value: isset(value) ? value : 100,
        min: 0,
        max: 100,
        draggableBar: false,
        label: true,
        step: 1,
        scale: true,
        scaleSteps: 5,
        scaleSubSteps: 4,
        on: {
          changed: this.rangeChangeFunDimming,
        },
      });
    }, 300);
  },
  rangeChangeFunDimming(element) {
    console.log(element);
    let value = element.value;
    let el = element.$el;
    let subName = $(el).attr('name');
    console.log(subName);
    this.subdevices.forEach((kitem) => {
      if (kitem.name === subName) {
        kitem.ref = value;
      }
    });
  },
  clickThermostatChange(item, click_type) {
    console.log(item, click_type);
    let data = '';
    let post_value = ``;
    switch (click_type) {
      case 'mode':
        if (item.modeStr == 1) {
          item.modeStr = 0;
        } else if (item.modeStr == 2) {
          let devices = cloneDeep(erp.info.device);
          let device = devices[item.device];
          let mode_seetting = '';
          if (isset(device)) {
            let list = device.settings;
            list.forEach((item) => {
              if (item.setting_type === 'mode_selection') {
                mode_seetting = item.setting;
              }
            });
          }
          if (mode_seetting == 'Cooling') {
            item.modeStr = 0;
          } else {
            item.modeStr = 1;
          }
        } else if (item.modeStr == 0) {
          item.modeStr = 2;
        }
        data = '9404000001' + parseInt(item.modeStr).toString(16).pad('00');
        post_value = item.modeStr;
        break;
      case 'fan':
        if (item.speedVaule == 4) {
          if (item.modeStr == 0) {
            item.speedVaule = 2;
          } else {
            item.speedVaule = 1;
          }
        } else {
          item.speedVaule++;
        }
        data = '9405000001' + parseInt(item.speedVaule).toString(16).pad('00');
        post_value = item.speedVaule;
        break;
      case 'reduce':
        if (item.temperature != 5) {
          item.temperature--;
        }
        data = '9406000001' + parseInt(item.temperature).toString(16).pad('00');
        post_value = item.temperature;
        break;
      case 'add':
        if (item.temperature != 32) {
          item.temperature++;
        }
        data = '9406000001' + parseInt(item.temperature).toString(16).pad('00');
        post_value = item.temperature;
        break;
    }
  },
  openCloseItem(item) {
    if (item.ref == 0) {
      barValue = 100;
      item.ref = barValue;
    } else {
      item.ref = 0;
      barValue = 0;
    }
    this.changeBarUI(item.device, item.device_button_group, barValue);
  },
  onOffItem(item) {
    console.log(item);
    let barStatus = false;
    let barValue = 0;
    let hideBottomBar = null;
    if (item.ref == 0) {
      item.ref = 1;
      barValue = 100;
      if (isset(hideBottomBar)) hideBottomBar = false;
    } else {
      item.ref = 0;
      barValue = 0;
      if (isset(hideBottomBar)) hideBottomBar = true;
    }
    if (item.device_button_group.startsWith('DIMMING') || item.device_button_group.startsWith('RCU DIMMING')) {
      barStatus = true;
      if (item.ref == 1) {
        item.ref = barValue;
      }
    }
    if (item.device_button_group.startsWith('Thermostat') && item.ref == 0) {
      hideBottomBar = true;
    } else if (item.device_button_group.startsWith('Thermostat') && item.ref == 1) {
      hideBottomBar = false;
    }
    if (barStatus) {
      this.changeBarUI(item.device, item.device_button_group, barValue);
    }
    if (isset(hideBottomBar)) {
      if (hideBottomBar) {
        item.buttonBoxType = 0;
      } else {
        item.buttonBoxType = 3;
      }
    }
  },
  //defalut scene
  showButton(item) {
    item.chooseStatus = !item.chooseStatus;
    if (!item.chooseStatus) {
      item.mainType = 1;
      item.buttonBoxType = 0;
      return;
    }
    //depend on differ mode show differ template
    let button_group = item.device_button_group;
    if (button_group.startsWith('ONOFF GANG') || button_group.startsWith('RCU ONOFF GANG')) {
      item.mainType = 2;
    } else if (button_group.startsWith('DIMMING') || button_group.startsWith('RCU DIMMING')) {
      item.mainType = 2;
      item.buttonBoxType = 1;
      this.initRangeBar(item.device, item.device_button_group);
    } else if (button_group.startsWith('OPENCLOSE UART') || button_group.startsWith('OPENCLOSE UART REVERSE')) {
      item.mainType = 7;
      item.buttonBoxType = 2;
      this.initRangeBar(item.device, item.device_button_group, 100);
    } else if (button_group.startsWith('OPENCLOSE GANG') || button_group.startsWith('RCU OPENCLOSE GANG')) {
      item.mainType = 7;
      item.buttonBoxType = 2;
      this.initRangeBar(item.device, item.device_button_group, 100);
    } else if (button_group.startsWith('TOGGLE GANG')) {
      item.mainType = 4;
    } else if (button_group.startsWith('Thermostat')) {
      item.mainType = 2;
      item.buttonBoxType = 3;
    } else if (button_group.startsWith('Air Conditioner')) {
    }
  },
};
