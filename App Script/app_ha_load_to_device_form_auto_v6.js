window.loading_device = {};
window.loading_timer;
window.ble_load_to_device_form_auto = (params) => {setTimeout(function(){
    const TAG = "ERP >>> ble_load_to_device_form";
    console.log(TAG+":1");
    
    //variables
    const obj = params.obj.hasClass("device") ? params.obj : params.obj.closest('li.device');
    const subdevice_name = obj.attr("subdevice-name");
    let uuid = obj.attr('uuid');
    const button_group = obj.attr('button_group');
    const guid = obj.attr("guid");
    const display_name = obj.attr('display-name');
    if(!isset(uuid)){
        uuid = window.peripheral[guid].prop.id
    }
    _ble_load_to_device_form_perform_auto({guid:guid,uuid:uuid, button_group:button_group,display_name : display_name,subdevice_name : subdevice_name});
}, 10);};

window._ble_load_to_device_form_perform_auto = async(loading_config) => {
    const guid = loading_config.guid;
    const button_group = loading_config.button_group;
    console.log(peripheral[guid].getProp());
    try{
        loading_timer = setTimeout(function(){
            app.preloader.hide();
            peripheral[guid].disconnect();
            ble_peripheral_on_disconnect(peripheral[guid].getProp().id);
        }, 10000);
        await peripheral[guid].connect();
        loading_device = loading_config;
        clearTimeout(loading_timer);
    }catch(error){
        app.dialog.alert(_(erp.get_log_description(error)));
        return
    }
    //return
    let device_batch = erp.doctype.device_batch[peripheral[guid].getProp().hexBatch.toUpperCase()];
    let device_hex_model = peripheral[guid].getProp().hexModel.toUpperCase();
    let this_firmware = peripheral[guid].getProp().firmware;
    let model_name = erp.doctype.device_model[device_hex_model].name;
    console.log("this_firmware",this_firmware);
    
    //to check device is in database
    http.request(encodeURI('/api/resource/Device/' + guid), {
        serializer: "json",
        responseType: "json",
        method: "GET",
        data: {}
    }).then((res)=>{
      //let data = res.data
    }).catch((err)=>{
      let network_status = http2.isDisconnect; //is check network, false is connect, true is not conncet 
      if(!network_status){
        http.request(encodeURI('/api/resource/Device'), {
          serializer: "json",
          responseType: "json",
          method: "POST",
          data: {
              password: "000000",
              device_mode: "",
              guid: guid,
              mac_address: core_utils_get_mac_address_from_guid(guid, false),
              device_model : model_name,
              batch : isset(device_batch)?device_batch.batch_id:'YO0012',
              firmware : (isset(this_firmware) ? this_firmware : '----'),
          }
      });
      }else{
        const toast = app.toast.create({
          position: 'bottom',
          closeTimeout: 3000,
          text: 'Connection lost. Some features might not work.',
        });
        toast.open();
      }
    })
    app.preloader.hide();
    //start
    let connected = peripheral[guid].getProp().connected;
    if(connected){
        if(loading_config.button_group=='IR Setup'){
            mainView.router.navigate(`/mobile-app/device-type-ir?guid=${guid}&model=${model_name}`, {history:true});
        }else{
            mainView.router.navigate('/mobile-app/general-setting', {history:true});
        }
        //if is IAQ model
        let new_cmd = [];
        if(button_group == 'IAQ'){
            if(window.device.platform.toLowerCase()=='android'){
                ble.requestMtu(
                    peripheral.id,
                    512,
                    () => {
                      console.log('>>>> device request mtu success');
                    },
                    (err) => {
                      console.log('>>>> device request mtu fail: ' + err);
                    },
                );
            }
            new_cmd.push({
                action : 'startNotification',
                post : (id,s,rs)=>{
                  console.log('startNotification',rs)
                  emitter.emit("startNotification",{rs:rs,guid:guid});
                }
              });
              ha_process_periperal_cmd(loading_config.uuid, new_cmd).then(()=>{
                    
              },(error)=>{
                  
              })
              setTimeout(()=>{
                ha_process_periperal_cmd(loading_config.uuid, new_cmd).then(()=>{
                    
                },(error)=>{
                    
                })
            },1000*5)
        }
    }
}
window._ble_load_to_device_form_auto = (loading_config) => {
    
    
    app.preloader.hide();
    console.log('_ble_load_to_device_form')
    const guid = loading_config.guid;
    const mac_address = peripheral[guid].getProp().mac_address;
    let device_batch = erp.doctype.device_batch[peripheral[guid].getProp().hexBatch.toUpperCase()];
    let device_hex_model = peripheral[guid].getProp().hexModel.toUpperCase();
    let this_firmware = peripheral[guid].getFirmwareNo(peripheral[guid].getProp().firmware);
    let model_name = erp.doctype.device_model[device_hex_model].name;
    let device_default_template_list = erp.doctype.device_model[peripheral[guid].getProp().hexModel.toUpperCase()].device_default_template || {}
    let dms = {};
    for(let i in device_default_template_list){
        if(!isset(dms[device_default_template_list[i].mode])){
            dms[device_default_template_list[i].mode] = true;
        }
    }
    if(loading_config.button_group.startsWith("RCU DIMMING")){
        dms = {"Triac Dimming" : true,"0-10v Dimming" : true}
    }
    if(loading_config.button_group.startsWith("RCU OUTPUT")){
        dms = {"RCU Controller":true}
    }
    
    let device_models = erp.doctype.device_model[device_hex_model];
    if(device_models.name == 'YO780' && loading_config.button_group == 'ONOFF GANG1'){
        dms = {"RCU Controller":true}
    }
    console.log(device_models);
    let profile_room = {}
    let this_room_list = cloneDeep(erp.info.profile.profile_room);
    //get the this room_name
    let deviceList = cloneDeep(erp.info.profile.profile_subdevice);
    let this_profile_name = '';
    if(isset(loading_config.subdevice_name) && loading_config.subdevice_name){
        deviceList.forEach(item=>{
            if(item.name === loading_config.subdevice_name){
                this_profile_name = item.profile_room;
            }
        })
    }
    if(this_profile_name){
        this_room_list.sort((a,b)=>{
            if(a.name === this_profile_name && b.name !== this_profile_name){
                return -1
            }
            if(b.name === this_profile_name && a.name !== this_profile_name){
                return 1;
            }
            return 0;
        })
    }
    this_room_list.forEach(item=>{
        profile_room[item.name] = {title : tran(item.title)};
    })
    app.preloader.hide();
    let args =  {
        guid : guid,
        model:device_models.name,
        brand:device_models.brand,
        brand_image:device_models.brand_image?device_models.brand_image:"",
        button_group:loading_config.button_group,
        parent:erp.info.profile.name,
        batch:isset(device_batch)?device_batch.batch_id:'YO0012',
        firmware:(isset(this_firmware) ? this_firmware : '----'),
        device_name:loading_config.display_name,
        profile_room:profile_room,
        password:peripheral[guid].getProp().password,
        peripheral:peripheral[guid].getProp().name,
        image : device_models.image,
        mac_address: mac_address,
        dms:dms,
        subdevice_name : loading_config.subdevice_name
    };
    if(loading_config.button_group.startsWith("RCU DIMMING")){
        let rcu_gang = loading_config.button_group.replace("RCU DIMMING","");
        if(rcu_gang == 1 || rcu_gang == 2){
            args.config = '01';
        }else if(rcu_gang == 3 || rcu_gang == 4){
            args.config = '02';
        }else if(rcu_gang == 5 || rcu_gang == 6){
            args.config = '03';
        }else if(rcu_gang == 7 || rcu_gang == 8){
            args.config = '04';
        }else if(rcu_gang == 9 || rcu_gang == 10){
            args.config = '05';
        }
    }else if(loading_config.button_group.startsWith("RCU OUTPUT")){
        let rcu_gang = loading_config.button_group.replace("RCU OUTPUT");
        if(rcu_gang.length < 2) rcu_gang = `0${rcu_gang}`;
        args.config = rcu_gang;
    }else{
        args.config = '';
    }
    // console.log(args);
    let html = jinja2.render(tpl_erp_subdevice_form, args);
    $('.erp-subdevice-form-wrapper').html(html);
    const select = document.getElementById("device_mode");
    if(isset(loading_config.subdevice_name) && loading_config.subdevice_name != 'undefined'){
        let subdevices = cloneDeep(erp.info.profile.profile_subdevice);
        let this_mode = '';
        let this_button_group = '';
        subdevices.forEach(item=>{
            if(item.name == loading_config.subdevice_name){
                this_mode = item.device_mode;
                this_button_group = item.device_button_group;
            }
        })
        setTimeout(()=>{
            select.value = this_mode;
        },500)
    }else{
        select.value = device_models.mode;
    }
    select.addEventListener("change", function(){
        let button_group = args.button_group
        if(button_group.startsWith("RCU DIMMING")){
            return 
        }
        let new_button_group = '';
        let default_template = device_models.device_default_template;
        device_models.mode = select.value
        if(select.value == "Curtain Switch"){
          const old_button_group = loading_config.button_group
          let  old_gang = 1
          if(old_button_group.startsWith('ONOFF GANG') || old_button_group.startsWith("TOGGLE GANG")){
            old_gang = old_button_group.replace("ONOFF GANG", "")*1 || old_button_group.replace("TOGGLE GANG", "")*1
          }
          console.log('loading_config.button_group',loading_config.button_group)
            for(let i in default_template){
                console.log(default_template[i].mode == select.value)
                if(default_template[i].mode == select.value){
                    console.log('i',i)
                    if(old_gang == 1 || old_gang == 2){
                      if(i == "OPENCLOSE GANG1_2"){
                        new_button_group = default_template[i].device_button_group
                      }
                    }
                    if(old_gang == 3 || old_gang == 4){
                      if(i == "OPENCLOSE GANG3_4"){
                        new_button_group = default_template[i].device_button_group
                      }
                    }
                }
            }
        }else if(select.value == "Curtain Motor Reverse" || select.value == "Curtain Motor"){
          for(let i in default_template){
              if(default_template[i].mode == select.value){
                  new_button_group = default_template[i].device_button_group
              }
          }
          console.log('new_button_group',new_button_group)
          args.button_group = new_button_group;
          $(".device-button-group").html(new_button_group)
          $('input[name="device_button_group"').val(new_button_group)
        }else{
            let gang = button_group.substring(button_group.length-1)
            for(let i in default_template){
                if(default_template[i].mode == select.value && gang == default_template[i].gang){
                    new_button_group = i
                }
            }
        }
        args.button_group = new_button_group;
        $(".device-button-group").html(new_button_group)
        $('input[name="device_button_group"').val(new_button_group)
    })
};