window.loading_device = {};
window.loading_timer;
window.ble_load_to_device_form = (params) => {setTimeout(function(){
    const TAG = "ERP >>> ble_load_to_device_form";
    console.log(TAG+":1");
    
    //variables
    const obj = params.obj.hasClass("device") ? params.obj : params.obj.closest('li.device');
    const subdevice_name = obj.attr("subdevice-name");
    // if(subdevice_name){
    //   return
    // }
    let uuid = obj.attr('uuid');
    const button_group = obj.attr('button_group');
    const guid = obj.attr("guid");
    const display_name = obj.attr('display-name');
    if(!isset(uuid)){
        uuid = window.peripheral[guid].prop.id
    }
    _ble_load_to_device_form_perform({guid:guid,uuid:uuid, button_group:button_group,display_name : display_name,subdevice_name : subdevice_name});
}, 10);};

window._ble_load_to_device_form_perform = (loading_config) => {
    if(!isset(scanned_periperals[loading_config.uuid])) return;
    emitter.off('startNotification');
    iot_emitter_device();
    const peripheral = cloneDeep(scanned_periperals[loading_config.uuid]);
    const guid = peripheral.guid;
    const button_group = loading_config.button_group;
    //to check device is in database
    http.request(encodeURI('/api/resource/Device/' + guid), {
        serializer: "json",
        responseType: "json",
        method: "GET",
        data: {}
    }).then((res)=>{
      //let data = res.data
    }).catch((err)=>{
      let network_status = runtime.networkStatus;
      let device_batch = erp.doctype.device_batch[peripheral.hexBatch.toUpperCase()];
      if(!isset(network_status) || network_status){
        http.request(encodeURI('/api/resource/Device'), {
          serializer: "json",
          responseType: "json",
          method: "POST",
          data: {
              password: "000000",
              device_mode: "",
              guid: guid,
              mac_address: core_utils_get_mac_address_from_guid(peripheral.guid, false),
              device_model : erp.doctype.device_model[peripheral.hexModel.toUpperCase()].name,
              batch : isset(device_batch)?device_batch.batch_id:'YO0012',
              firmware : (isset(peripheral.firmware) ? peripheral.firmware : '----'),
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
    let cmd = [];
    //scanned_periperals[loading_config.uuid].firmware = '3.23';
	cmd.push({action:"connect"});
    // read firmware version 2a26
    cmd.push({action:"read",serv:'180a',char:'2a26'});
    app.preloader.show();
    loading_timer = setTimeout(function(){
        app.preloader.hide();
        ble.disconnect(scanned_periperals[loading_config.uuid].id);
        ble_peripheral_on_disconnect(loading_config.uuid);
    }, 10000);
    ha_process_periperal_cmd(loading_config.uuid,cmd).then(()=>{
        clearTimeout(loading_timer);
        app.preloader.hide();
        loading_device = loading_config;
        
        if(scanned_periperals[loading_config.uuid].connecting){
            
        }else{
            if(loading_config.button_group=='IR Setup'){
                let guid = scanned_periperals[loading_config.uuid].guid;
                let model = erp.doctype.device_model[scanned_periperals[loading_config.uuid].hexModel.toUpperCase()].name;
                mainView.router.navigate(`/mobile-app/device-type-ir?guid=${guid}&model=${model}`, {history:true});
            }else{
                mainView.router.navigate('/mobile-app/general-setting', {history:true});
            }
        }
        //fixed iaq notify
        let new_cmd = [];
        if(button_group == 'IAQ'){
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
            new_cmd.push({
                action : 'startNotification',
                post : (id,s,rs)=>{
                  console.log('startNotification',rs)
                  emitter.emit("startNotification",{rs:rs,guid:guid});
                }
              });
              setTimeout(()=>{
                ha_process_periperal_cmd(loading_config.uuid, new_cmd).then(()=>{
                    
                },(error)=>{
                    
                })
            },1000*5)
        }
    },(e)=>{
        clearTimeout(loading_timer);
        app.preloader.hide();
        if(e!="Password is not correct"){
            //alert(e);
            const toast = app.toast.create({
              position: 'bottom',
              closeTimeout: 3000,
              text: e,
            });
            toast.open();
        }else{
            _ble_load_to_device_form_ask_password(loading_config);
        }
    });
}

window._ble_load_to_device_form_ask_password = (loading_config) => {
    app.dialog.password('Please enter correct password', function(password){
        if(password.trim()=="" || password.length!=6 || password != (password*1+"").pad("000000")){
            app.dialog.alert("Invalid Password!", function(){
                _ble_load_to_device_form_ask_password(loading_config);
            });
        }else{
            scanned_periperals[loading_config.uuid].password = password;
            _ble_load_to_device_form_perform(loading_config);
        }
    });
}

window._ble_load_to_device_form = (loading_config) => {
    
    
    
    console.log('_ble_load_to_device_form')
    const peripheral = cloneDeep(scanned_periperals[loading_config.uuid]);
    
    
    let dms = {};
    for(let i in erp.doctype.device_model[peripheral.hexModel.toUpperCase()].device_default_template){
        if(!isset(dms[erp.doctype.device_model[peripheral.hexModel.toUpperCase()].device_default_template[i].mode])){
            dms[erp.doctype.device_model[peripheral.hexModel.toUpperCase()].device_default_template[i].mode] = true;
        }
    }
    let device_models = erp.doctype.device_model[peripheral.hexModel.toUpperCase()];
    console.log(device_models);
    let device_batch = erp.doctype.device_batch[peripheral.hexBatch.toUpperCase()];
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
    let args = app.utils.extend(peripheral, {
        model:device_models.name,
        brand:device_models.brand,
        brand_image:device_models.brand_image?device_models.brand_image:"",
        button_group:loading_config.button_group,
        parent:erp.info.profile.name,
        batch:isset(device_batch)?device_batch.batch_id:'YO0012',
        firmware:(isset(peripheral.firmware) ? peripheral.firmware : '----'),
        device_name:loading_config.display_name,
        profile_room:profile_room,
        password:iot_ble_get_password(loading_config.uuid),
        peripheral:peripheral.name.substring(0,12),
        image : device_models.image,
        mac_address: core_utils_get_mac_address_from_guid(peripheral.guid, false),
        dms:dms,
        subdevice_name : loading_config.subdevice_name
    });
    // console.log(args);
    let html = jinja2.render(tpl_erp_subdevice_form, args);
    $('.erp-subdevice-form-wrapper').html(html);
    const select = document.getElementById("device_mode");
    select.value = device_models.mode;
    select.addEventListener("change", function(){
        let button_group = args.button_group
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
        // let html = jinja.render(tpl_erp_subdevice_form, args);
        // $('.erp-subdevice-form-wrapper').html(html);
    })
};