window.ha_home_profile_room_load = ()=>{
    TAG = "ha_home_profile_room_load"
    if(!isset(window.profile_subdevice)){
        return
    }
    //define throttle function
    window.throttle_ha_home_local_status_save = core_utils_throttle(ha_home_local_status_save,1000*2,{'trailing':true,'leading':false});
    window.throttle_upload_device_control_log = core_utils_throttle(upload_device_control_log,1000*7,{'trailing':true,'leading':false});
    window.throttle_iot_update_profile_subdevice_status = window.core_utils_throttle(iot_update_profile_subdevice_status,1000*5,{'trailing':true,'leading':false});
    let paddingTop = 48; //fixed tabbar height
    if(Object.keys(window.iot_scene).length > 0){
      paddingTop = 152;
    }
    let is_margin_top = paddingTop>100?'margin-top:104px':'';
    let room = window.profile_room
    const getScenes = ()=>{
      let scenes = window.iot_scene;
      let scene_list = [];
      let scenes_item_html = "";
      for(let i in scenes){
        let is_local_html = '';
        console.log("is_local",scenes[i].is_local != 'None' && scenes[i].is_local != "0")
        if(scenes[i].is_local != 'None' && scenes[i].is_local != "0"){
          is_local_html = /*html*/`
            <label class="switch" style="margin-top:10px;margin-bottom:20px;">
              <input type="checkbox" scene-name="{{scenes[i].name}}" />
              <span class="slider round"></span>
            </label>
          `;
        }else{
          let scenes_ref = "";
          const device_list = scenes[i].scene_device;
          let new_list = [];
          for(let j in device_list){
            new_list.push(device_list[j].profile_subdevice + '=' + device_list[j].commands) 
          }
          console.log("new_list",new_list)
          scenes_ref = new_list.join('|');
          is_local_html = /*html*/`
            <a href="#" func="controller_click_scene_hotel" sceneref="${scenes[i].name}" ref="{{scene.scene_configuration}}+${scenes_ref}" class="right off_flag">
              <div class="button button-small button-raised button-round button-fill"
              style="width: 60px; height: 60px; content: '';-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;">
              <i class="material-icons">touch_app</i>
              </div>
            </a>
          `
        }
        scenes_item_html += /*html*/`
        <div class="swiper-slide home-swiper-slide">
          <div class="home-swiper-slide-inner">
            <div style="margin:8px 16px 8px 30px;"> 
              <div style="text-align: left; float: left; width: 50%; line-height: 29px;padding-top:5px;">
                <b style="font-size: 25px;text-shadow: 1px 2px 3px #000;color:#fff;">${ _(scenes[i].title) }</b>
              </div>
              <div style="text-align: right; float: right; width: 50%;display:none;">
                <a class="button" href="/frappe/form/{{ _('Edit Scene') }}/APP_Yoswit_Scene_Form_V5/Website Sidebar Item/${scenes[i].name}/" class="right">
                  <i class="material-icons">settings</i>
                </a>
              </div>
            <br />
              <div style="text-align: right; float: right; width: 50%; margin-top: -20px; margin-bottom: 20px;">
                ${is_local_html}
              </div>
            </div>
          </div>
        </div>
        `
      }
      let scene_html = /*html*/`
        <div class="banner-swiper-container swiper-container-auto swiper-container swiper-init home-swiper" style="z-index: 5;position:fixed;">
          <div class="swiper-wrapper">
            ${scenes_item_html}
          </div>
        </div>
        `
        $(".room-box").append(scene_html);
        const swiper = app.swiper.create('.swiper-container-auto', {
            speed: 200,
            spaceBetween: 20
        });
    }
    getScenes();
    const getRoomJson = (...props)=>{
      let profile_subdevice = window.profile_subdevice
      let list = []
      for(let i in room){
        let room_count = false;
        list.push({
          name : i,
          title : room[i].title,
          profile_subdevice : []
        })
        for(let j in profile_subdevice){
          if(profile_subdevice[j].profile_room == i && profile_subdevice[j].hidden == 0){
            room[i].count = true;
            for(let z in list){
              if(list[z].name == profile_subdevice[j].profile_room){
                if(profile_subdevice[j].device == props[0]){
                  profile_subdevice[j][props[1]] = props[2]
                }
                if(profile_subdevice[j].device == props[3]){
                  profile_subdevice[j][props[4]] = props[5]
                }
                if(profile_subdevice[j].device == props[6]){
                  profile_subdevice[j][props[6]] = props[8]
                }
                list[z].profile_subdevice.push(profile_subdevice[j])
              }
            }
          }
        }
      }
      return list
    }
    let roomJson = getRoomJson();

    const roomRender = ()=>{
      let toolbar_item = "";
      let tab_hidden_item = "";
      let room_index = 1;
      for(let i in room){
        if(room[i].count){
          toolbar_item += /*html*/`
          <a href="#ab-hidden-${room_index}" ref="${room_index}" id="room-bar-title-${room_index}" func="controller_home_switch_room_onclick" class="tab-link">
            ${tran(room[i].title)}
        </a>
          `;
        tab_hidden_item += `<div id="tab-hidden-${room_index}" class="page-content tab"></div>`;
        }
        room_index++;
      }
      let roomHtml = /*html*/`
        <div class="toolbar tabbar tabbar-scrollable toolbar-home-room no-show" style="z-index: 5;position:fixed;${is_margin_top}">
          <div class="toolbar-inner">
              <a href="#tab-hidden-0" ref="0" id="room-bar-title-0" func="controller_home_switch_room_onclick" class="tab-link tab-link-active"><i class="material-icons">home</i></a>
              ${toolbar_item}
              <a href="#" style="min-width:30px;">&nbsp;</a>
          </div>
          <div class="room-more-icon-box">
              <a href="/frappe/list/Room/APP_Yoswit_Room_V5/Website Sidebar Item/null/1000000/" class="button">
                  <i class="material-icons">more_vert</i>
              </a>
          </div>
      </div>
      <div class="tabs" style="display:none;">
          <div id="tab-hidden-0" class="page-content tab tab-active"></div>
          ${tab_hidden_item}
      </div>
      <div style="height:${paddingTop}px"></div>
      <div class="pin-to-top-div" style="display: none">
          <div class="list media-list no-margin pin-to-top">
              <ul id="pin-to-top-ul"></ul>
          </div>
      </div>
      `
    $(".room-box").append(roomHtml);
    }
    roomRender()
    //console.log(roomJson)
    
  const profile_roome_render = async()=>{
    let roomList = ``;
    let roomItems = ``;
    let roomJson_index = 0;
    let peripheral = {
      advertising : '',
      connected : false,
      connecting : false,
      disappear : true,
      guid : '',
      hexBatch : '',
      hexModel : '',
      id : '',
      lastDiscoverDate : '',
      name : '',
      reconnect : '',
      rssi : 0,
      button_group : 'ONOFF GANG1',
      password : '000000',
      leader : '',
      bluetooth_status : 0,
      authfail : 0,
      signal : 0,
      meshHeadStyle : '',
      meshHeadIcon : '',
      meshHeadConnect : false,
      meshHeadSet : false,
      meshTailSet : false,
      meshTailConnect : false,
      meshTailIcon : '',
      meshTailStyle : '',
      display_name : '',
      device_model : '',
      network_checking_status : '',
      connectedSize : '',
      totalMeshSize : 0,
      meshSize : 0,
      totalMeshSize : '',
      ref : 0,
      gang : 1,
      render_type : 'room',
      subdevice_name : '',
    };
    
    let json_index = 0;
    //load the hidden device data
    let hidden_list = [];
    try{
        let hidden_list_str = await window.db.get('hidden_peripherals');
        if(hidden_list_str){
            hidden_list = JSON.parse(hidden_list_str);
            hidden_list.forEach(item=>{
                if(!isset(runtime.hidden_peripherals)){
                    runtime.hidden_peripherals = {};
                    runtime.hidden_peripherals[item] = {'hidden': true}
                }else{
                    runtime.hidden_peripherals[item] = {'hidden': true}
                }
            })
        }
    }catch(err){
        //ignore
        console.log(err)
        
    }
    try{
        //load the local device status
        let local_device_list_str = await window.db.get('local_scanned_periperals');
        if(local_device_list_str){
            window.local_scanned_periperals = {} ;
            window.local_scanned_periperals = JSON.parse(local_device_list_str);
        }
    }catch(err){
        //ignore
        console.log(err)
    }
    //load room device data
    for(let i in roomJson){
      json_index++;
      let roomJsonItem = roomJson[i].profile_subdevice;
      console.log(roomJsonItem.length)
      if(roomJsonItem.length > 0){
        roomItems = `
        <li id="room-${json_index}-div-title" 
        room="${tran(roomJson[i].name)}" 
        class="swipeout room" ref="${json_index}">
          <div class="item-content swipeout-content">
            <div class="item-inner">
                <div class="item-title-row">
                  <!-- title text -->
                  <div class="item-title" lang="en" lang-packet="${roomJson[i].title}" func="controller_common_home_collapse" ref="${json_index}">
                      <i class="room-collapse material-icons" id="collapse-${json_index}">
                        expand_more
                      </i>
                      ${ tran(roomJson[i].title) }
                  </div>
          
                  <!-- click to turn on all device in room -->
                  <div class="item-after">
                    <p class="segmented segmented-raised segmented-round" style="display:none;">
                      <button class="button button-round link" func="controller_common_home_click_room_onoff" ref="1">Off</button>
                      <button class="button button-round link" func="controller_common_home_click_room_onoff" ref="0">On</button>
                    </p>
                  </div>
                </div>
            </div>
          </div>
          <div class="swipeout-actions-right">
            <a href="/frappe/form/Edit ${ tran(roomJson[i].title) }/APP_HA_Room_Form_V5/Profile Room/${ roomJson[i].name }/"
            class="link color-orange"><i class="icon material-icons">settings</i></a>
          </div>
      </li>
        `;
      roomList += `
        <div id="room-${json_index}-div" class="list media-list no-margin">
        <ul>
          ${roomItems}
        </ul>
        </div>
        `;
      }
      
    }
    $(".room-box").append(roomList)
    let append_index = 1
    for(let i in roomJson){
      let roomJsonItem = roomJson[i].profile_subdevice
      let thisHtml = ``;
      for(let j in roomJsonItem){
        peripheral.guid = roomJsonItem[j].device
        peripheral.hexModel = roomJsonItem[j].device.substring(roomJsonItem[j].device.length - 6, roomJsonItem[j].device.length - 2).toLowerCase();
        if(isset(device_models[peripheral.hexModel])){
          let device_model = device_models[peripheral.hexModel];
          let image = "";
          if(roomJsonItem[j].img_url.startsWith("https")){
            image = roomJsonItem[j].img_url;
          }else if(roomJsonItem[j].img_url != "None" && roomJsonItem[j].img_url){
            image = runtime.appConfig.app_api_url+roomJsonItem[j].img_url;
          }
          peripheral.image = image?image:device_model.image?device_model.image:'https://my.yoswit.com/files/products/YO2086-1G.svg';
          peripheral.mode = device_model.mode == 'None'?'':device_model.mode;
          if(!window.button_group_template[peripheral.mode])continue;
          peripheral.name = roomJsonItem[j].device_name.substring(0,12);
          peripheral.profile_device = roomJsonItem[j].profile_device;
          peripheral.profile_device_name = roomJsonItem[j].profile_device_name;
          peripheral.display_name = tran(roomJsonItem[j].title);
          peripheral.id = roomJsonItem[j].device_name.substring(0,12).toUpperCase().match(/.{1,2}/g).join(":");
          peripheral.device_model = device_model.name;
          peripheral.command_type = roomJsonItem[j].command_type;
          peripheral.command = roomJsonItem[j].command;
          peripheral.subdevice_name = roomJsonItem[j].subdevice_name;
          peripheral.status = roomJsonItem[j].status;
          peripheral.button_group = roomJsonItem[j].device_button_group;
          //peripheral.pairing_guid = roomJsonItem[j].pairing_guid;
          peripheral.pairing_gang = roomJsonItem[j].pairing_gang;
          //peripheral.be_pairing = roomJsonItem[j].be_pairing;
          peripheral.config = roomJsonItem[j].config;
          peripheral.default_connect = roomJsonItem[j].default_connect;
          peripheral.score = 96;
          peripheral.firmware = roomJsonItem[j].firmware;
          peripheral.password = roomJsonItem[j].password;
          //networks attribute
          peripheral.network_id = roomJsonItem[j].network_id;
          peripheral.leader = window.network_leader[peripheral.network_id];
          peripheral.network_position = roomJsonItem[j].network_position;
          peripheral.device_type = "";
          peripheral.ref = 0;
          //gateway
          peripheral.gateway = roomJsonItem[j].gateway;
          peripheral.mobmob = 0;
          //check config
          if(roomJsonItem[j].config && roomJsonItem[j].config!= 'None'){
            let configObj = JSON.parse(roomJsonItem[j].config);
            if(isset(configObj['be_pairing'])){
              peripheral.be_pairing = configObj['be_pairing']?1:"";
            }
            if(isset(configObj['pairing_guid'])){
              peripheral.pairing_guid = configObj['pairing_guid'];
            }
          }
          for(let z in window.local_scanned_periperals){
            if(peripheral.id == z){
                console.log(peripheral.id)
                console.log(isset(window.local_scanned_periperals[z].manual))
                if(isset(window.local_scanned_periperals) && isset(window.local_scanned_periperals[z].manual)){
                    if(peripheral.mode == "On Off Switch" || peripheral.mode == "Multiway Switch"){
                        if(isset(window.local_scanned_periperals[z].manual[peripheral.button_group.replace("ONOFF GANG","")])){
                          peripheral.ref = window.local_scanned_periperals[z].manual[peripheral.button_group.replace("ONOFF GANG","")].ref;
                        }
                        console.log('peripheral.ref',peripheral.ref);
                    }else if(peripheral.mode == "On Off IR"){
                        peripheral.ref = window.local_scanned_periperals[z].manual["On Off IR"].ref;
                    }
                }
            }
          }
          if(peripheral.gateway && peripheral.gateway != 'None'){
            peripheral.mobmob = 1;
            //check is nor exist local status
            if(isset(window.local_scanned_periperals) && isset(window.local_scanned_periperals[peripheral.id])){
                window.scanned_periperals[peripheral.id] = window.local_scanned_periperals[peripheral.id]
            }else{
                window.scanned_periperals[peripheral.id] = {
                    guid : peripheral.guid,
                    id : peripheral.id
                }
            }
          }
          peripheral.setting_link = `/frappe/detail/Edit ${encodeURIComponent(tran(peripheral.display_name))}/APP_HA_Device_Setting_Template_Detail_V5/Profile Subdevice/${ encodeURIComponent(tran(roomJsonItem[j].subdevice_name))}/guid=${ peripheral.guid }&device_button_group=${ peripheral.button_group }&device_name=${peripheral.profile_device}&device_model=${peripheral.device_model}&title=Edit ${encodeURIComponent(tran(peripheral.display_name))}&name=${roomJsonItem[j].subdevice_name}&doctype=Profile Subdevice/`
          if(peripheral.button_group.startsWith("ONOFF GANG")){
            peripheral.gang = roomJsonItem[j].device_button_group.replace('ONOFF GANG',"");
          }else if(peripheral.button_group.startsWith("DIMMING")){
            peripheral.gang = "dimming";
          }
          //differ IR device
          if(peripheral.button_group.startsWith("Air Conditioner-")){
            peripheral.device_type = "Air Conditioner"
          }else if(peripheral.button_group.startsWith("JOHNSON CONTROLS AIR CONDITIONER")){
            peripheral.device_type = "JOHNSON"
          }else if(peripheral.button_group.startsWith("Television-")){
            peripheral.device_type = "Television"
          }else if(peripheral.button_group.startsWith("Set-top")){
            peripheral.device_type = "SetTop"
          }else if(peripheral.button_group.startsWith("Audio-")){
            peripheral.device_type = "Audio"
          }else if(peripheral.button_group.startsWith("Projector-")){
            peripheral.device_type = "Projector"
          }else if(peripheral.button_group.startsWith("Fan-")){
            peripheral.device_type = "Fan"
          }else if(peripheral.button_group.startsWith("IPTV-")){
            peripheral.device_type = "IPTV"
          }else if(peripheral.button_group.startsWith("Air Purifier-")){
            peripheral.device_type = "Air Purifier"
          }else if(peripheral.button_group.startsWith("Camera-")){
            peripheral.device_type = "Camera"
          }else if(peripheral.button_group.startsWith("Dehumidifier-")){
            peripheral.device_type = "Dehumidifier"
          }else if(peripheral.button_group.startsWith("Robot Vacuum-")){
            peripheral.device_type = "Robot"
          }else if(peripheral.button_group.startsWith("OPEN_LOCK")){
            peripheral.device_type = "OPEN_LOCK";
            peripheral.device_model = "Yale-Zigbee-Lock";
          }
          console.log(peripheral)
          //console.log(($('ul li.home-scanned-peripheral[pairing-guid="'+peripheral.guid+'"]')))
          const dom_length = $('ul li.home-scanned-peripheral[pairing-guid="'+peripheral.guid+'"][pairing-gang="'+peripheral.button_group+'"][be-pairing="1"]')
          thisHtml = jinja.render(button_group_template[device_model.mode], peripheral);
          //delete the uncat repeat device
          $(`#room-0-div ul li.home-scanned-peripheral[guid="${peripheral.guid}"][button_group="${peripheral.button_group}"]`).remove();
          //if curtain motor,have rever mode
          if(peripheral.button_group == 'OPENCLOSE UART REVERSE' || peripheral.button_group == 'OPENCLOSE UART'){
              $(`#room-0-div ul li.home-scanned-peripheral[guid="${peripheral.guid}"]`).remove();
          }
          //if have pairing
          if(dom_length.length == 0){
            $(`#room-${append_index}-div ul`).append(thisHtml);
            if(peripheral.button_group.startsWith("DIMMING")){
                if(isset(window.local_scanned_periperals) && isset(window.local_scanned_periperals[peripheral.id]) && isset(window.local_scanned_periperals[peripheral.id].manual) && isset(window.local_scanned_periperals[peripheral.id].manual['dimming'])){
                    peripheral.status = window.local_scanned_periperals[peripheral.id].manual["dimming"].lastref
                } 
              home_ui_range_init_v5(peripheral.guid,peripheral.status);
            }
            if(peripheral.button_group.startsWith("OPENCLOSE UART")){
                if(isset(window.local_scanned_periperals) && isset(window.local_scanned_periperals[peripheral.id]) && isset(window.local_scanned_periperals[peripheral.id].manual)){
                    peripheral.status = window.local_scanned_periperals[peripheral.id].manual["1"].ref
                }
              home_ui_curtain_range_init_v5(peripheral.guid,peripheral.status)
            }
            if(peripheral.button_group.startsWith("Thermostat")){
              if(isset(window.local_scanned_periperals) && isset(window.local_scanned_periperals[peripheral.id]) && isset(window.local_scanned_periperals[peripheral.id].manual)){
                  peripheral.status = window.local_scanned_periperals[peripheral.id].manual["Thermostat"].ref;
                  let t_config = local_scanned_periperals[peripheral.id]['manual']['Thermostat'].config;
                  let list = [];
                  if(t_config){
                    list = t_config.split("|");
                    controller_thermostat_refresh_status(peripheral.guid,'',peripheral.status,list[1],list[2],list[3],list[4]);
                  }
                  
              }
            }
          }else{
            console.log(dom_length.length)
            let compare_index = 0;
            //have ONOFF GANG1 and ONOFF GANG3
            dom_length.forEach((ele)=>{
              console.log(ele)
              const self_button_group = $(ele).attr("pairing-gang");
              console.log(self_button_group)
              
              if(peripheral.button_group === self_button_group){
                
                const pairingHtml = jinja.render(button_group_template["Multiway Switch Pairing"], peripheral);
                $(ele).next().html(pairingHtml)
              }else{
                compare_index++;
              }
              console.log("compare_index",compare_index)
              if(compare_index == 2){
                const _html = jinja.render(button_group_template[device_model.mode], peripheral);
                $(`#room-${append_index}-div ul`).append(_html);
              }
            })
          }
        }
      }
      append_index++;
    }
  }
  profile_roome_render();
  _emitter.on('multiway_switch_pairing',(rs)=>{
    console.log("get data from",rs);
    const message_str = rs.message;
    const self_guid = rs.self_guid;
    const guid = rs.guid;
    const this_button_group = rs.this_button_group;
    const pair_button_group = rs.pair_button_group;
    //$('ul li.home-scanned-peripheral[guid="'+self_guid+'"]').attr('pairing-guid',guid)
    //find connect guid dom
    if(message_str == 'clear'){
      roomJson = getRoomJson(self_guid,'pairing_guid','',guid,'pairing_guid','',self_guid,'pairing_gang','');
    }else{
      roomJson = getRoomJson(self_guid,'pairing_guid',guid,guid,'pairing_guid',self_guid,self_guid,'pairing_gang',pair_button_group);
    }
    console.log(roomJson)
    //roomRender()
    //profile_roome_render()
    //console.log(roomJson)
    //console.log($('ul li.home-scanned-peripheral[pairing-guid="'+peripheral.guid+'"]'))
  })
  _emitter.on("gateway_refresh",()=>{
    app.ptr.refresh(".frappe-detail-ptr-content")
  })
  mainView.router.on('routeChanged',()=>{
    if(mainView.router.history.length == 1){
      _emitter.off('multiway_switch_pairing')
    }
    //save the local device
    window.throttle_ha_home_local_status_save.cancel();
    window.ha_home_local_status_save('local_scanned_periperals',JSON.stringify(window.scanned_periperals));
    //window.throttle_ha_home_local_status_save('local_scanned_periperals',JSON.stringify(window.scanned_periperals));
  })
}