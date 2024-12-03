window.manual_dim_bar_list = [];
window.ha_control_template_render = (guid, device_model, device_button_group,id) => {
  //get the device_model and image
  const device_models = cloneDeep(erp.doctype.device_model);
  let device_default_template = [];
  window.model_map = {};
  for (let i in device_models) {
    if (device_models[i].model_code == device_model) {
      model_map = device_models[i];
    }
  }
  if (Object.keys(model_map).length != 0) {
    device_default_template = model_map.device_default_template;
  }
  const range_change_fun = (element) => {
    let thisvalue = element.value;
    let device_button_group = $(element.$el).attr('button_group');
    let guid = $(element.$el).attr('guid');
    let id = $(element.$el).attr('id');
    initPeripheral(guid,id);
    console.log('thisvalue', thisvalue);
    let data = ``;
    let otherModelStatus = false;
    if (model_map.model_code == 'YO121-AC-R2W') otherModelStatus = true;
    data = `55AA060102${thisvalue.toString(16).pad('00')}FF`;
    if (otherModelStatus) {
      data = `55fefe0304${thisvalue.toString(16).pad('00')}`;
    }
    if (otherModelStatus) {
      data += erp.script.core_util_calculate_crc16_for_motor(data);
    } else {
      data += core_util_calculate_crc16_modbus_for_doa(data);
    }
    if (thisvalue > 0) {
      $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr('ref', 1);
      //change image
      $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"] .onoff`).attr(
        'src',
        `https://my.yoswit.com//files/app/open-curtain.svg`
      );
    } else {
      $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr('ref', 0);
      //change image
      $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"] .onoff`).attr(
        'src',
        `https://my.yoswit.com//files/app/close-curtain.svg`
      );
    }
    if (peripheral[guid]) {
      if (device_button_group.startsWith('OPENCLOSE UART')) {
        let command = '8602' + data.toLowerCase();
        try {
          debugger
          //alert(JSON.stringify(peripheral[guid]))
          peripheral[guid].curtainmotor([
            {
              gang: bleHelper.getGangId(device_button_group),
              value: thisvalue,
              command: command,
            },
          ]).catch((error)=>{
            app.dialog.alert(_(erp.get_log_description(error)));
          });
        } catch (error) {
          app.dialog.alert(_(erp.get_log_description(error)));
        }
      } else {
        try {
          let direction = thisvalue > 0 ? 'open' : 'close';
          peripheral[guid].openClose(bleHelper.getGangId(device_button_group), direction, true).catch((error)=>{
            app.dialog.alert(_(erp.get_log_description(error)));
          });
        } catch (error) {
          app.dialog.alert(_(erp.get_log_description(error)));
        }
      }
    }
  };
  const range_change_fun_for_dimming = (element) => {
    console.log($(element.$el).attr('button_group'));
    let device_button_group = $(element.$el).attr('button_group');
    let guid = $(element.$el).attr('guid');
    let id = $(element.$el).attr('id');
    let thisvalue = element.value;
    console.log('thisvalue', thisvalue);
    initPeripheral(guid,id);
    let v = Math.ceil((thisvalue / 100) * 255);
    if (thisvalue > 0) {
      $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr('ref', 1);
    } else {
      $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr('ref', 0);
    }
    if (peripheral[guid]) {
      try {
        peripheral[guid].dimming([
          {
            gang: bleHelper.getGangId(device_button_group),
            value: v,
          },
        ]).catch((error)=>{
          app.dialog.alert(_(erp.get_log_description(error)));
        });
      } catch (error) {
        app.dialog.alert(_(erp.get_log_description(error)));
      }
    }
  };
  const initDimBar = (device_button_group) => {
    let range_key = `${guid}_${device_button_group}_manual`;
    if (!isset(manual_dim_bar_list[range_key])) {
      manual_dim_bar_list[range_key] = {};
    }
    manual_dim_bar_list[range_key] = app.range.create({
      el: `.range-slider[guid="${guid}"][button_group="${device_button_group}"][name="manual"]`,
      value: 0,
      min: 0,
      max: 100,
      draggableBar: false,
      label: true,
      step: 1,
      scale: true,
      scaleSteps: 5,
      scaleSubSteps: 4,
      on: {
        changed:
          device_button_group.startsWith('OPENCLOSE UART') || device_button_group.startsWith('OPENCLOSE GANG')
            ? range_change_fun
            : range_change_fun_for_dimming,
      },
    });
  };
  // onoff template
  const onoff_template = (device_button_group, title) => {
    return `
  <div>
  <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
  <div class="item-content swipeout-content">
    <a class="item-content">
      <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.image}');">
      </div>
      <div class="item-inner flex-direction-column flex-start" style="justify-content: flex-start;align-items: flex-start;">
        <div class="item-title-row">
          <div class="item-title ellipsis"style="width: 190px">${model_map.model_code} ${title}</div>
        </div>
        <div class="item-subtitle" style="margin-top: 3px;margin-bottom: 3px;">${_(core_utils_get_mac_address_from_guid(guid))}</div>
          <div class="signal-panel-manual item-text height-21" style="width: 120%" signal="5" bluetooth="0" guid="${guid}" device_button_group="${device_button_group}">
            <div class="signal-view-main">
              <div class="signal"></div>
              <div class="bluetooth"></div>
              <div class="wifiicon ${model_map.mode_type == 'Wifi' ? '' : 'device-none'}">
                <i class="material-icons text-color-red" style="font-size:22px;">wifi_off</i>
              </div>
            </div>
          </div>
        </div>  
      </div>
    </a>
    <div class="control-panel-right" style="">
      <a class="on_flag off_flag manua-onoff" ref="0" func="manual_onoff" guid="${guid}" device_button_group="${device_button_group}" id="${id}">
        <div class="button button-raised button-big onoff"></div>
      </a>
    </div>
  </div>
  </li>
  </div>
    `;
  };

  const curtain_motor_template = (device_button_group, title) => {
    return `
  <div>
  <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
    <a class="item-content">
      <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.image}');">
      </div>
      <div class="item-inner flex-direction-column flex-start" style="justify-content: flex-start;align-items: flex-start;">
        <div class="item-title-row">
          <div class="item-title ellipsis"style="width: 190px">${model_map.model_code} ${title}</div>
        </div>
        <div class="item-subtitle" style="margin-top: 3px;margin-bottom: 3px;">${_(core_utils_get_mac_address_from_guid(guid))}</div>
          <div class="signal-panel-manual item-text height-21" style="width: 120%" signal="5" bluetooth="0" guid="${guid}">
            <div class="signal-view-main">
              <div class="signal"></div>
              <div class="bluetooth"></div>
              <div class="wifiicon ${model_map.mode_type == 'Wifi' ? '' : 'device-none'}">
                <i class="material-icons text-color-red" style="font-size:22px;">wifi_off</i>
              </div>
            </div>
          </div>
        </div>  
        <div class="control-panel-right" style="">
          <div class="left on_flag button button-raised" ref="2" guid="${guid}" device_button_group="${device_button_group}" id="${id}" style="margin-top:8px;height:57px;" func="manual_curtain_motor">
            <div class="" style="width:57px;line-height:55px!important;"><i class="material-icons" style="font-size:24px!important;margin-top:6px;">pause</i></div>
        </div>
        <div class="left on_flag button button-raised manual-curtain-motor" ref="0" func="manual_curtain_motor" guid="${guid}" device_button_group="${device_button_group}" style="margin-top:8px;margin-left:10px;height:57px;">
          <div class="" style="width:57px;line-height:16px!important;"><img src="${'https://my.yoswit.com//files/app/close-curtain.svg'}" alt="" style="width:20px;height:20px;margin-top:5px;" /></div>
        </div>
      </div>
    </a>
  </li>
  <li class="device home-scanned-peripheral home-scanned-peripheral-smart display-flex curtain-subdevice">
    <div class="row padding-tb flex-direction-column justify-content-center">
      <div class="col-100 medium-100 large-100">
        <div class="content display-flex justify-content-center" style="margin-left: 15px;margin-right:15px;">
          <div class="tip-title"><img src="${'https://my.yoswit.com/'}/files/app/close-curtain.svg" alt="" style="width:20px;height:20px;margin-right:8px;margin-top:5px;" /></div>
          <div class="range-slider range-slider-home-auto range-slider-init"
              button_group="${device_button_group}"
              guid="${guid}"
              id="${id}"
              name="manual"
          ></div>  
          <div class="tip-title"><img src="${'https://my.yoswit.com/'}/files/app/open-curtain.svg" alt="" style="width:20px;height:20px;margin-left:8px;margin-top:5px;" /></div>
        </div>
      </div>
    </div>
  </li>
  </div>
  `;
  };

  const dimming_template = (device_button_group, title) => {
    return `
  <div>
    <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
      <a class="item-content">
        <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.image}');">
        </div>
        <div class="item-inner flex-direction-column flex-start" style="justify-content: flex-start;align-items: flex-start;">
          <div class="item-title-row">
            <div class="item-title ellipsis"style="width: 190px">${model_map.model_code} ${title}</div>
          </div>
          <div class="item-subtitle" style="margin-top: 3px;margin-bottom: 3px;">${_(core_utils_get_mac_address_from_guid(guid))}</div>
          <div class="signal-panel-manual item-text height-21" style="width: 120%" signal="5" bluetooth="0" guid="${guid}">
            <div class="signal-view-main">
              <div class="signal"></div>
              <div class="bluetooth"></div>
              <div class="wifiicon ${model_map.mode_type == 'Wifi' ? '' : 'device-none'}">
                <i class="material-icons text-color-red" style="font-size:22px;">wifi_off</i>
              </div>
            </div>
          </div>
        </div>
        <div class="control-panel-right" style="">
          <a class="on_flag off_flag manua-onoff" ref="0" func="manual_onoff" guid="${guid}" device_button_group="${device_button_group}" id="${id}">
            <div class="button button-raised button-big onoff"></div>
          </a>
        </div>
      </a>
    </li>
    <li class="device home-scanned-peripheral home-scanned-peripheral-smart display-flex curtain-subdevice">
      <div class="row padding-tb flex-direction-column justify-content-center">
        <div class="col-100 medium-100 large-100">
          <div class="content display-flex justify-content-center" style="margin-left: 15px;margin-right:15px;">
            <div class="tip-title"><i class="icon material-icons" style="margin-right:8px;">brightness_low</i></div>
            <div class="range-slider range-slider-home-auto range-slider-init"
                button_group="${device_button_group}"
                guid="${guid}"
                name="manual"
                id="${id}"
            ></div>  
            <div class="tip-title"><i class="icon material-icons" style="margin-left:8px;">brightness_high</i></div>
          </div>
        </div>
      </div>
    </li>
  </div>
  `;
  };

  const thermostat_template = (device_button_group, title) => {
    return `
  <div>
    <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
    <div class="item-content swipeout-content">  
      <a class="item-content">
        <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.image}');">
        </div>
        <div class="item-inner flex-direction-column flex-start" style="justify-content: flex-start;align-items: flex-start;">
          <div class="item-title-row">
            <div class="item-title ellipsis"style="width: 190px">${model_map.model_code} ${title}</div>
          </div>
          <div class="item-subtitle" style="margin-top: 3px;margin-bottom: 3px;">${_(core_utils_get_mac_address_from_guid(guid))}</div>
          <div class="signal-panel-manual item-text height-21" style="width: 120%" signal="5" bluetooth="0" guid="${guid}">
            <div class="signal-view-main">
              <div class="signal"></div>
              <div class="bluetooth"></div>
              <div class="wifiicon ${model_map.mode_type == 'Wifi' ? '' : 'device-none'}">
                <i class="material-icons text-color-red" style="font-size:22px;">wifi_off</i>
              </div>
            </div>
          </div>
        </div>
      </a>
      <div class="swipeout-actions-right">
        <a
          func="click_gateway_wifi_setting"
          link="/mobile-app/gateway-wifi-setting?guid=${guid}"
          class="link color-orange"
          guid="${guid}"
          id="${id}"
          ><i class="icon material-icons" style="line-height: 15px!important;">settings</i></a
        >
      </div>
      <div class="control-panel-right" style="">
        <a class="on_flag off_flag manua-onoff" ref="0" func="manual_onoff" guid="${guid}" device_button_group="${device_button_group}" id="${id}">
          <div class="button button-raised button-big onoff"></div>
        </a>
      </div>
    </div>
    </li>
    <li class="device home-scanned-peripheral home-scanned-peripheral-smart display-flex thermostat-subdevice-manual">
      <div class="item-content" style="width:100%;">
        <div class="item-inner">
          <div class="display-flex justify-content-space-between align-content-center align-items-center" style="--f7-grid-gap:3px;width:100%;">
            <a href="#" class="col manual-thermostat-change" command-type="mode" guid="${guid}" device_button_group="${device_button_group}" ref="0" id="${id}" func="manual_thermostat_change">
              <div class="button button-raised button-big stop" style="width:70px"><img style="width:25px;height:25px;" src="style/img/air_condition/icon-mode-4.png" /></div>
            </a>
            <a href="#" class="col manual-thermostat-change" command-type="fan" guid="${guid}" device_button_group="${device_button_group}" ref="1" id="${id}" func="manual_thermostat_change">
              <div class="button button-raised button-big stop" style="width:70px"><img style="width:25px;height:25px;" src="style/img/air_condition/icon-speed-1.png" /></div>
            </a>
            <a href="#" class="col manual-thermostat-change" command-type="reduce" guid="${guid}" device_button_group="${device_button_group}" ref="26" id="${id}" func="manual_thermostat_change">
              <div class="button button-raised button-big stop" style="width:70px;font-size:25px;">-</div>
            </a>
            <a href="#" class="col set-temp-manual" style="line-height:60px;margin-top:8px;text-align:center;">
              <span>26</span>℃
            </a>
            <a href="#" class="col manual-thermostat-change" command-type="add" guid="${guid}" device_button_group="${device_button_group}" ref="26" id="${id}" func="manual_thermostat_change">
              <div class="button button-raised button-big stop" style="width:70px;font-size:25px;">+</div>
            </a>  
          </div>
        </div>
      </div>
    </li>
  </div>
  `;
  };

  const ir_template = (device_button_group, title) => {
    return `
  <div>
    <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
      <a class="item-content">
        <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.image}');">
        </div>
        <div class="item-inner flex-direction-column flex-start" style="justify-content: flex-start;align-items: flex-start;">
          <div class="item-title-row">
            <div class="item-title ellipsis"style="width: 190px">${model_map.model_code} ${title}</div>
          </div>
          <div class="item-subtitle" style="margin-top: 3px;margin-bottom: 3px;">${_(core_utils_get_mac_address_from_guid(guid))}</div>
          <div class="signal-panel-manual item-text height-21" style="width: 120%" signal="5" bluetooth="0" guid="${guid}">
            <div class="signal-view-main">
              <div class="signal"></div>
              <div class="bluetooth"></div>
              <div class="wifiicon ${model_map.mode_type == 'Wifi' ? '' : 'device-none'}">
                <i class="material-icons text-color-red" style="font-size:22px;">wifi_off</i>
              </div>
            </div>
          </div>
        </div>
        <div class="control-panel-right" style="">
          <a class="right manual-ir-change" guid="${guid}" device_button_group="${device_button_group}" id="${id}" command-type="ARC_ON_OFF" func="manual_ir_change" ref="0">
            <div class="button button-raised button-big circle">
                <i class="material-icons">power_settings_new</i>
            </div>
          </a>
        </div>
      </a>
    </li>
    <li class="device home-scanned-peripheral home-scanned-peripheral-smart display-flex thermostat-subdevice-manual">
      <div class="item-content" style="width:100%;">
        <div class="item-inner">
          <div class="display-flex justify-content-space-between align-content-center align-items-center" style="--f7-grid-gap:3px;width:100%;">
            <a href="#" class="col manual-ir-change" command-type="ARC_MODE" guid="${guid}" device_button_group="${device_button_group}" ref="0" id="${id}" func="manual_ir_change">
              <div class="button button-raised button-big stop" style="width:60px"><img style="width:25px;height:25px;" src="style/img/air_condition/icon-mode-4.png" /></div>
            </a>
            <a href="#" class="col manual-ir-change" command-type="ARC_SPEED" guid="${guid}" device_button_group="${device_button_group}" ref="1" id="${id}" func="manual_ir_change">
              <div class="button button-raised button-big stop" style="width:60px"><img style="width:25px;height:25px;" src="style/img/air_condition/icon-speed-1.png" /></div>
            </a>
            <a href="#" class="col manual-ir-change" command-type="ARC_SWING" guid="${guid}" device_button_group="${device_button_group}" ref="0" id="${id}" func="manual_ir_change">
              <div class="button button-raised button-big stop" style="width:60px"><img style="width:25px;height:25px;" src="style/img/air_condition/icon-swing-0.png" /></div>
            </a>
            <a href="#" class="col manual-ir-change" command-type="ARC_REDUCE_TEMP" guid="${guid}" device_button_group="${device_button_group}" ref="26" id="${id}" func="manual_ir_change">
              <div class="button button-raised button-big stop" style="width:60px;font-size:25px;">-</div>
            </a>
            <a href="#" class="col set-temp-manual" style="line-height:60px;margin-top:8px;text-align:center;">
              <span>26</span>℃
            </a>
            <a href="#" class="col manual-ir-change" command-type="ARC_ADD_TEMP" guid="${guid}" device_button_group="${device_button_group}" ref="26" id="${id}" func="manual_ir_change">
              <div class="button button-raised button-big stop" style="width:60px;font-size:25px;">+</div>
            </a>  
          </div>
        </div>
      </div>
    </li>
  </div>
  `;
  };

  //gateway template
  const gateway_template = (device_button_group, title) => {
    return `
  <div>
    <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
    <div class="item-content swipeout-content">
      <a class="item-link item-content no-chevron no-ripple no-active-state">
        <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.image}');">
        </div>
        <div class="item-inner flex-direction-column flex-start" style="justify-content: flex-start;align-items: flex-start;">
          <div class="item-title-row">
            <div class="item-title ellipsis"style="width: 190px">${model_map.model_code} ${title}</div>
          </div>
          <div class="item-subtitle" style="margin-top: 3px;margin-bottom: 3px;">${_(core_utils_get_mac_address_from_guid(guid))}</div>
          <div class="signal-panel-manual item-text height-21" style="width: 120%" signal="5" bluetooth="0" guid="${guid}">
            <div class="signal-view-main">
              <div class="signal"></div>
              <div class="bluetooth"></div>
              <div class="wifiicon ${model_map.mode_type == 'Wifi' ? '' : 'device-none'}">
                <i class="material-icons text-color-red" style="font-size:22px;">wifi_off</i>
              </div>
            </div>
          </div>
        </div>
        </a>
        <div class="swipeout-actions-right">
          <a
            func="click_gateway_wifi_setting"
            link="/mobile-app/gateway-wifi-setting?guid=${guid}"
            class="link color-orange"
            guid="${guid}"
            id="${id}"
            ><i class="icon material-icons" style="line-height: 15px!important;">settings</i></a
          >
        </div>
        <div class="control-panel-right" style="">
          <a class="right" guid="${guid}" device_button_group="${device_button_group}" id="${id}" func="click_connect_manual">
            <div class="button button-raised button-big circle">
                <i class="material-icons" style="line-height: 25px!important;">bluetooth_connected</i>
            </div>
          </a>
        </div>
      </div>
    </li>
  </div>
  `;
  };

  //IAQ template
  const iaq_template = (device_button_group, title) => {
    return `
    <div>
    <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
      <div class="item-content swipeout-content">
      <a class="item-link item-content no-chevron no-ripple no-active-state">
        <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.image}');">
        </div>
        <div class="item-inner flex-direction-column flex-start" style="justify-content: flex-start;align-items: flex-start;">
          <div class="item-title-row">
            <div class="item-title ellipsis"style="width: 190px">${model_map.model_code} ${title}</div>
          </div>
          <div class="item-subtitle" style="margin-top: 3px;margin-bottom: 3px;">${_(core_utils_get_mac_address_from_guid(guid))}</div>
          <div class="signal-panel-manual item-text height-21" style="width: 120%" signal="5" bluetooth="0" guid="${guid}">
            <div class="signal-view-main">
              <div class="signal"></div>
              <div class="bluetooth"></div>
              <div class="wifiicon ${model_map.mode_type == 'Wifi' ? '' : 'device-none'}">
                <i class="material-icons text-color-red" style="font-size:22px;">wifi_off</i>
              </div>
            </div>
          </div>
        </div>
      </a>
      <div class="swipeout-actions-right">
        <a
          func="click_gateway_wifi_setting"
					link="/mobile-app/gateway-wifi-setting?guid=${guid}"
					class="link color-orange"
          guid="${guid}"
					><i class="icon material-icons" style="line-height: 15px!important;">settings</i></a
				>
      </div>
      <div class="control-panel-right" style="">
        <a class="right manual-ir-change" guid="${guid}" device_button_group="${device_button_group}" id="${id}" func="click_connect_manual">
          <div class="button button-raised button-big circle">
              <i class="material-icons" style="line-height: 25px!important;">bluetooth_connected</i>
          </div>
        </a>
      </div>
      </div>
    </li>
    <li class="device home-scanned-peripheral home-scanned-peripheral-smart iaq-subdevice device-none" guid="${guid}" device_button_group="${device_button_group}" style="height:auto;">
      <div class="display-flex justify-content-start align-content-center align-items-center" style="flex-wrap:wrap;height:auto;width:100%;">
        <!-- Temperature -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center">
                    <div class="Temperature display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/Temperature_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">℃</span> 
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM1.0 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM1 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="PM1 box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/PM1.0_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM2.5 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM2_5 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/PM2.5_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM4 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM4 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/PM4.0_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM10 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM10 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/PM10_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Humidity -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="Humidity display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/Humidity_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">%</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- CO2 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="CO2 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/CO2_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- TVOCs -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="VOC display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/VOC_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span> 
                            <span class="unit">ppd</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Light -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="LUX display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/Light_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">lux</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- NOX_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="NOX display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/NOX_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppb</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- CO_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="CO display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/CO_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- O3_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="O3 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/O3_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppb</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- HCHO_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="HCHO display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/HCHO_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- NOISE_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="NOISE display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/NOISE_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">dB</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PRESSURE_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PRESSURE display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${'https://my.yoswit.com/'}/files/app/PRESSURE_1.svg" alt="" style="width: 25px;height:25px;"/>
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">kpa</span>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </li>
    </div>
  `;
  };

  let html = '';
  for (let i in device_default_template) {
    let device_button_group = device_default_template[i].device_button_group;
    if (device_button_group.includes('REVERSE')) {
      continue;
    }
    let gang = '';
    if (device_button_group.startsWith('OPENCLOSE UART') || device_button_group.startsWith('OPENCLOSE GANG')) {
      if (device_default_template[i].device_button_group && device_default_template[i].device_button_group.startsWith('OPENCLOSE GANG')) {
        gang = device_default_template[i].device_button_group.replace('OPENCLOSE GANG', '');
      }
      html += curtain_motor_template(device_button_group, gang);
      setTimeout(() => {
        initDimBar(device_default_template[i].device_button_group);
      }, 500);
    } else if (device_button_group.startsWith('DIMMING')) {
      html += dimming_template(device_button_group, gang);
      setTimeout(() => {
        initDimBar(device_default_template[i].device_button_group);
      }, 500);
    } else if (device_button_group.startsWith('Thermostat')) {
      html += thermostat_template(device_button_group, gang);
      setTimeout(() => {
        $(`.thermostat-subdevice-manual`).css({ 'height': '0px' });
        $(`.thermostat-subdevice-manual .item-inner`).css({ 'display': 'none' });
      }, 200);
    } else if (device_button_group.includes('IR')) {
      html += ir_template(device_button_group, 'AC');
    } else if (device_button_group.includes('Yoswit Gateway')) {
      html += gateway_template(device_button_group, '');
    } else if (device_button_group.includes('IAQ')) {
      html += iaq_template(device_button_group, '');
    } else {
      gang = device_default_template[i].device_button_group.replace('ONOFF GANG', '');
      html += onoff_template(device_button_group, gang);
    }
  }
  return html;
};

window.manual_onoff = (params) => {
  const ref = params.ref;
  const guid = params.obj.attr('guid');
  const device_button_group = params.obj.attr('device_button_group');
  const id = params.obj.attr('id'); 
  debugger
  initPeripheral(guid,id);
  if (device_button_group.startsWith('DIMMING')) {
    let range_key = `${guid}_${device_button_group}_manual`;
    manual_dim_bar_list[range_key].setValue(ref == 0 ? 100 : 0);
    $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr('ref', ref == 0 ? 1 : 0);

    return false;
  } else if (device_button_group.startsWith('Thermostat')) {
    $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr('ref', ref == 0 ? 1 : 0);
    if (ref == 0) {
      $(`.thermostat-subdevice-manual`).css({ 'height': '77px' });

      $(`.thermostat-subdevice-manual .item-inner`).css({ 'display': 'block' });
    } else {
      $(`.thermostat-subdevice-manual`).css({ 'height': '0px' });
      $(`.thermostat-subdevice-manual .item-inner`).css({ 'display': 'none' });
    }
    if (peripheral[guid]) {
      try {
        let data =
          '9403000001' +
          parseInt(ref == 0 ? 1 : 0)
            .toString(16)
            .pad('00');
        peripheral[guid].thermostat([
          {
            gang: 42,
            value: ref == 0 ? 1 : 0,
            command: data,
          },
        ]).catch((error)=>{
          app.dialog.alert(_(erp.get_log_description(error)));
        });
      } catch (error) {
        app.dialog.alert(_(erp.get_log_description(error)));
      }
    }
    return false;
  } else {
    if (peripheral[guid]) {
      try {
        $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr('ref', ref == 0 ? 1 : 0);
        debugger
        //alert(JSON.stringify(peripheral[guid]));
        peripheral[guid]
          .onoff([
            {
              gang: bleHelper.getGangId(device_button_group),
              on: ref == 0 ? true : false,
            },
          ])
          .then((rs) => {
            console.log(rs);
          })
          .catch((error) => {
            console.log(error);
            app.dialog.alert(_(erp.get_log_description(error)));
          });
      } catch (error) {
        $(`.signal-panel-manual[guid="${guid}"]`).attr('bluetooth', 0);
        app.dialog.alert(_(erp.get_log_description(error)));
      }
    }
  }
  //change ui

  // try{
  //   peripheral[guid].onoff([{
  //     gang : bleHelper.getGangId(device_button_group),
  //     on : ref == 0 ? true : false
  //   }]);
  // }catch(error){
  //   if(error == 7200){
  //     erp.script.iot_entry_class_password_verify(guid,device_button_group);
  //   }else{
  //     app.dialog.alert(_(erp.get_log_description(error)));
  //   }
  // }
};

window.manual_curtain_motor = (params) => {
  const ref = params.ref;
  const guid = params.obj.attr('guid');
  const device_button_group = params.obj.attr('device_button_group');
  let open_icon = `https://my.yoswit.com//files/app/open-curtain.svg`;
  let close_icon = `https://my.yoswit.com//files/app/close-curtain.svg`;
  //console.log(ref);
  let range_key = `${guid}_${device_button_group}_manual`;
  if (ref == 0) {
    $(`.manual-curtain-motor`).attr('ref', 1);
    $(`.manual-curtain-motor img`).attr('src', open_icon);
    if (manual_dim_bar_list[range_key]) {
      manual_dim_bar_list[range_key].setValue(100);
    }
  } else if (ref == 2) {
    if (device_button_group.startsWith('OPENCLOSE UART')) {
      let data = '55AA050101036DDC' + erp.script.core_util_calculate_crc16_for_motor('55AA050101036DDC');
      let otherModelStatus = false;
      if (model_map.model_code == 'YO121-AC-R2W') otherModelStatus = true;
      if (otherModelStatus) {
        data = `55fefe0303` + erp.script.core_util_calculate_crc16_for_motor(`55fefe0303`);
      }
      if (peripheral[guid]) {
        let command = '8602' + data.toLowerCase();
        try {
          peripheral[guid].curtainmotor([
            {
              gang: bleHelper.getGangId(device_button_group),
              value: ref == 0 ? 0 : 100,
              command: command,
            },
          ]).catch((error)=>{
            app.dialog.alert(_(erp.get_log_description(error)));
          });
        } catch (error) {
          app.dialog.alert(_(erp.get_log_description(error)));
        }
      }
    } else {
      try {
        let direction = 'stop';
        peripheral[guid].openClose(bleHelper.getGangId(device_button_group), direction, true).catch((error)=>{
          app.dialog.alert(_(erp.get_log_description(error)));
        });
      } catch (error) {
        app.dialog.alert(_(erp.get_log_description(error)));
      }
    }
  } else {
    $(`.manual-curtain-motor`).attr('ref', 0);
    $(`.manual-curtain-motor img`).attr('src', close_icon);
    manual_dim_bar_list[range_key].setValue(0);
  }
};

window.manual_thermostat_change = (params) => {
  //mode 0:fan 1:heat 2:cool
  console.log(params);
  const ref = params.ref;
  const guid = params.obj.attr('guid');
  const id = params.obj.attr('id');
  const device_button_group = params.obj.attr('device_button_group');
  const command_type = params.obj.attr('command-type');
  let post_value = 0;
  let post_command = '';
  let this_gang = bleHelper.getGangId(device_button_group);
  if (command_type == 'mode') {
    if (ref == 0) {
      post_value = 2;
      this_gang = 43;
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="mode"]`).attr('ref', 2);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="mode"] img`).attr(
        'src',
        `style/img/air_condition/icon-mode-2.png`
      );
    } else if (ref == 1) {
      post_value = 0;
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="mode"]`).attr('ref', 0);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="mode"] img`).attr(
        'src',
        `style/img/air_condition/icon-mode-4.png`
      );
    } else {
      post_value = 1;
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="mode"]`).attr('ref', 1);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="mode"] img`).attr(
        'src',
        `style/img/air_condition/icon-mode-5.png`
      );
    }
    post_command = `9404000001${parseInt(post_value).toString(16).pad('00')}`;
  } else if (command_type == 'fan') {
    this_gang = 44;
    if (ref == 1) {
      post_value = 2;
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-2.png`
      );
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"]`).attr('ref', 2);
    } else if (ref == 2) {
      post_value = 3;
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"]`).attr('ref', 3);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-3.png`
      );
    } else if (ref == 3) {
      post_value = 4;
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"]`).attr('ref', 4);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-4.png`
      );
    } else if (ref == 4) {
      post_value = 1;
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"]`).attr('ref', 1);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="fan"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-1.png`
      );
    }
    post_command = `9405000001${parseInt(post_value).toString(16).pad('00')}`;
  } else if (command_type == 'reduce') {
    this_gang = 45;
    if (parseInt($('.set-temp-manual span').text()) > 5) {
      post_value = parseInt($('.set-temp-manual span').text()) - 1;
      $('.set-temp-manual span').text(parseInt($('.set-temp-manual span').text()) - 1);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="reduce"]`).attr(
        'ref',
        parseInt($('.set-temp-manual span').text())
      );
    }
    post_command = `9406000001${parseInt(post_value).toString(16).pad('00')}`;
  } else if (command_type == 'add') {
    this_gang = 45;
    if (parseInt($('.set-temp-manual span').text()) < 32) {
      post_value = parseInt($('.set-temp-manual span').text()) + 1;
      $('.set-temp-manual span').text(parseInt($('.set-temp-manual span').text()) + 1);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="add"]`).attr(
        'ref',
        parseInt($('.set-temp-manual span').text())
      );
    }
    post_command = `9406000001${parseInt(post_value).toString(16).pad('00')}`;
  }
  if (peripheral[guid]) {
    try {
      peripheral[guid].thermostat([
        {
          gang: this_gang,
          value: post_value,
          command: post_command,
        },
      ]).catch((error)=>{
        app.dialog.alert(_(erp.get_log_description(error)));
      });
    } catch (error) {
      app.dialog.alert(_(erp.get_log_description(error)));
    }
  }
};

window.manual_ir_change = (params) => {
  //mode 0:fan 1:heat 2:cool
  const ref = params.ref;
  const guid = params.obj.attr('guid');
  const id = params.obj.attr('id');
  const device_button_group = params.obj.attr('device_button_group');
  const command_type = params.obj.attr('command-type');
  const command_fun = '033E19010201010001030000FF';
  let onoff_value = 0;
  let mode_value = 0;
  let speed_value = 1;
  let swing_value = 0;
  let direction_value = 0;
  let temperature_value = 26;
  if (command_type == 'ARC_MODE') {
    if (ref == 0) {
      mode_value = 2;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_MODE"]`).attr('ref', 2);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_MODE"] img`).attr(
        'src',
        `style/img/air_condition/icon-mode-2.png`
      );
    } else if (ref == 1) {
      mode_value = 0;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_MODE"]`).attr('ref', 0);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_MODE"] img`).attr(
        'src',
        `style/img/air_condition/icon-mode-4.png`
      );
    } else {
      mode_value = 1;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_MODE"]`).attr('ref', 1);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_MODE"] img`).attr(
        'src',
        `style/img/air_condition/icon-mode-5.png`
      );
    }
  } else if (command_type == 'ARC_ON_OFF') {
    if (ref == 0) {
      onoff_value = 1;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_ON_OFF"]`).attr('ref', 1);
    } else {
      onoff_value = 0;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_ON_OFF"]`).attr('ref', 0);
    }
  } else if (command_type == 'ARC_SPEED') {
    if (ref == 1) {
      speed_value = 2;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-2.png`
      );
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"]`).attr('ref', 2);
    } else if (ref == 2) {
      speed_value = 3;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"]`).attr('ref', 3);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-3.png`
      );
    } else if (ref == 3) {
      speed_value = 4;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"]`).attr('ref', 4);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-4.png`
      );
    } else if (ref == 4) {
      speed_value = 1;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"]`).attr('ref', 1);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SPEED"] img`).attr(
        'src',
        `style/img/air_condition/icon-speed-1.png`
      );
    }
  } else if (command_type == 'ARC_SWING') {
    if (ref == 0) {
      swing_value = 1;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SWING"]`).attr('ref', 1);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SWING"] img`).attr(
        'src',
        `style/img/air_condition/icon-swing-1.png`
      );
    } else {
      swing_value = 0;
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SWING"]`).attr('ref', 0);
      $(`.manual-ir-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="ARC_SWING"] img`).attr(
        'src',
        `style/img/air_condition/icon-swing-0.png`
      );
    }
  } else if (command_type == 'ARC_REDUCE_TEMP') {
    if (parseInt($('.set-temp-manual span').text()) > 5) {
      temperature_value = parseInt($('.set-temp-manual span').text()) - 1;
      $('.set-temp-manual span').text(parseInt($('.set-temp-manual span').text()) - 1);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="reduce"]`).attr(
        'ref',
        parseInt($('.set-temp-manual span').text())
      );
    }
  } else if (command_type == 'ARC_ADD_TEMP') {
    if (parseInt($('.set-temp-manual span').text()) < 32) {
      temperature_value = parseInt($('.set-temp-manual span').text()) + 1;
      $('.set-temp-manual span').text(parseInt($('.set-temp-manual span').text()) + 1);
      $(`.manual-thermostat-change[guid="${guid}"][device_button_group="${device_button_group}"][command-type="add"]`).attr(
        'ref',
        parseInt($('.set-temp-manual span').text())
      );
    }
  }
  let ref_command = iot_ble_generate_ir_code(
    command_fun,
    command_type,
    `${temperature_value},${speed_value},${direction_value},${swing_value},${onoff_value},${mode_value}`
  );
  console.log(ref_command);
  initPeripheral(guid,id);
  if (peripheral[guid]) {
    try {
      peripheral[guid].sendIR(ref_command).catch((error)=>{
        app.dialog.alert(_(erp.get_log_description(error)));
      });
    } catch (error) {
      app.dialog.alert(_(erp.get_log_description(error)));
    }
  }
};

//ble icon connect
window.click_connect_manual = (params) => {
  const guid = params.obj.attr('guid');
  const id = params.obj.attr('id'); 
  const device_button_group = params.obj.attr('device_button_group');
  console.log(guid, device_button_group);
  initPeripheral(guid,id);
  if (device_button_group.includes('IAQ')) {
    if (isset(peripheral[guid])) {
      let connected = peripheral[guid].prop.connected;
      if (connected) {
        peripheral[guid].disconnect();
      } else {
        peripheral[guid]
          .connect()
          .then((rs) => {
            $(`.iaq-subdevice[guid="${guid}"]`).removeClass('device-none');
            if (deviceInfo.operatingSystem === 'ios') {
              peripheral[guid].write([
                {
                  service: 'ff80',
                  characteristic: 'ff81',
                  data: `9380`,
                },
              ]).catch((error)=>{
                app.dialog.alert(_(erp.get_log_description(error)));
              });
            } else {
              ble.requestMtu(
                peripheral[guid].prop.id,
                512,
                () => {
                  console.log('>>>> device request mtu success');
                  peripheral[guid].write([
                    {
                      service: 'ff80',
                      characteristic: 'ff81',
                      data: `9380`,
                    },
                  ]).catch((error)=>{
                    app.dialog.alert(_(erp.get_log_description(error)));
                  });
                },
                (err) => {
                  console.log('>>>> device request mtu fail: ' + err);
                }
              );
            }
          })
          .catch((error) => {
            $(`.signal-panel-manual[guid="${guid}"]`).attr('bluetooth', 0);
            app.dialog.alert(_(erp.get_log_description(error)));
          });
      }
    }
  } else {
    if (isset(peripheral[guid])) {
      let connected = peripheral[guid].prop.connected;
      if (connected) {
        peripheral[guid].disconnect();
      } else {
        peripheral[guid]
          .connect()
          .then((rs) => {
            //$(`.signal-panel-manual[guid="${guid}"]`).attr('bluetooth',1);
          })
          .catch((error) => {
            //$(`.signal-panel-manual[guid="${guid}"]`).attr('bluetooth',0);
            app.dialog.alert(_(erp.get_log_description(error)));
          });
      }
    }
  }
};

window.click_gateway_wifi_setting = (params) => {
  const guid = params.obj.attr('guid');
  const id = params.obj.attr('id');
  const login_dialog = app.dialog.login(_('Please enter ssid and password, ssid is only support 2.4Ghz.'), async (username, password) => {
    console.log(username, password);
    window.$this_timer = setTimeout(() => {
      if (window.$this_timer) {
        clearTimeout(window.$this_timer);
      }
      app.dialog.close();
      app.dialog.alert(_('Connection timeout. Please check the SSID and password.'));
    }, 40 * 1000);
    if (username === '' || password === '') {
      app.dialog.close();
      app.dialog.alert('Please fill in the SSID and Password.');
      clearTimeout(window.$this_timer);
      setTimeout(() => {
        click_gateway_wifi_setting(params);
      }, 1000);
      return;
    } else {
      //connect wifi
      let ssid = username;
      const saveSsid = () => {
        const data = '932000' + ssid.length.toString(16).pad('0000') + ssid.convertToHex();
        return window.peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const saveSsidPassword = () => {
        const data = '932100' + password.length.toString(16).pad('0000') + password.convertToHex();

        return window.peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const saveEmail = () => {
        let email = users[users.current].usr.toLowerCase();
        const data = '932200' + email.length.toString(16).pad('0000') + email.convertToHex();

        return window.peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const savePort = () => {
        let port = erp.settings[erp.appId].mqtt_port;
        const data = '9301000002' + (port * 1).toString(16).pad('0000');

        return window.peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const saveServerUrl = () => {
        let server_url = 'mqtt://' + erp.settings[erp.appId].mqtt_server;
        const data = '930000' + server_url.length.toString(16).pad('0000') + server_url.convertToHex();

        return window.peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
          },
        ]);
      };
      const restartDevice = () => {
        return window.peripheral[guid].write([
          {
            service: 'ff80',
            characteristic: 'ff81',
            data: '810E',
          },
        ]);
      };
      const sleep = (ms) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, ms);
        });
      };
      const checkIfOnline = () => {
        let mac = core_utils_get_mac_address_from_guid(guid, false);
        let topic_self = `${mac.toLowerCase()}-${users[users.current].usr.toLowerCase()}`;
        let will_topic = `will/${md5(md5(topic_self))}`;
        mqtt.subscribe(will_topic);
        window.$subscribeTimer = setTimeout(() => {
          mqtt.subscribe(will_topic);
        }, 10 * 1000);
        if (window.$wifiTopicFun) {
          emitter.off(will_topic, window.$wifiTopicFun);
        }
        window.$wifiTopicFun = async (res) => {
          console.log('component res', res);
          let message = res.message;
          if (message == 'Online') {
            clearTimeout(window.$subscribeTimer);
            clearTimeout(window.$this_timer);
            $(".signal-panel-manual[guid='" + guid + "']")
              .find('.wifiicon i')
              .removeClass('text-color-red');
            $(".signal-panel-manual[guid='" + guid + "']")
              .find('.wifiicon i')
              .addClass('text-color-green');
            $(".signal-panel-manual[guid='" + guid + "']")
              .find('.wifiicon i')
              .html('wifi');
            app.dialog.close();
            app.dialog.alert(_('Wi-Fi connected.'));
            //check the state of the connect status
          }
        };
        emitter.on(will_topic, window.$wifiTopicFun);
      };
      try {
        app.dialog.preloader(_('Bluetooth connection in progress.'));
        initPeripheral(guid,id);
        await window.peripheral[guid].connect();
        await saveSsid();
        await saveSsidPassword();
        await saveEmail();
        await savePort();
        await saveServerUrl();
        await restartDevice();
        app.dialog.close();
        app.dialog.preloader(_('Restarting...'));
        await sleep(10 * 1000);
        app.dialog.close();
        app.dialog.preloader(_('Checking connection...'));
        checkIfOnline();
      } catch (error) {
        app.dialog.alert(_(erp.get_log_description(error)));
      }
    }
  });
  setTimeout(() => {
    $(`.dialog-input-field input[name="dialog-password"]`).attr('type', 'text');
    $(`.dialog-input-field input[name="dialog-username"]`).attr('placeholder', _('Ssid'));
    $(`.dialog-input-field input[name="dialog-password"]`).attr('placeholder', _('Password'));
  }, 0);
  //window.location.href = `/mobile-app/gateway-wifi-setting?guid=${guid}`;
};

window.initPeripheral = (guid,id) => {
  //this function only use in manufacturing page
  if (!isset(peripheral[guid])) {
    for (let i in manufacturing_periperals) {
      if (manufacturing_periperals[i].id == id) {
        peripheral[guid] = new Peripheral(manufacturing_periperals[i]);
        peripheral[guid].prop.rssi = manufacturing_periperals[i].rssi;
        peripheral[guid].prop.id = manufacturing_periperals[i].id;
        peripheral[guid].prop.lastDiscoverDate = manufacturing_periperals[i].lastDiscoverDate;
        peripheral[guid].prop.firmware = `${manufacturing_periperals[i].firmware}`;
        peripheral[guid].prop.firmwareNo = getFirmwareNo(`${manufacturing_periperals[i].firmware}`);
        let obj = cloneDeep(manufacturing_periperals[i]);
        delete obj.guid;
        peripheral[guid].update(obj);
        break;
      }
    }
  }
};

window.getFirmwareNo = (firmware)=>{
  const versionPattern = /^\d+\.\d+\.\d+$/;
  if(versionPattern.test(firmware)){
      firmware = `7.0`;
  }
  let firmwareNo = firmware.replace(/[^0-9.]/g, '');
  firmwareNo = firmwareNo.split('.');
  firmwareNo = firmwareNo[0] + '.' + (firmwareNo.length>1 ? firmwareNo.slice(1).join('') : '0');
  return firmwareNo;
}
