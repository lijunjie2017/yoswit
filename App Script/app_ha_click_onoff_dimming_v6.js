window.dimmingRecord = {};
window.app_ha_click_onoff_dimming = function(params){
    const TAG = "ERP >>> app_ha_click_onoff_dimming";
    emitter.off('startNotification');
    iot_emitter_device();
    //variables
    const obj = params.obj.hasClass("device") ? params.obj : params.obj.closest('li.device');
    const uuid = obj.attr('uuid');
    
    if(!isset(scanned_periperals[uuid])) return;
    
    const peripheral = scanned_periperals[uuid];
    const guid = obj.attr('guid');
    const config = obj.attr('slot-index');
    const subdevice = obj.attr('subdevice-name');
    let control_type = 'Bluetooth';
    const password = obj.attr('password');
    const gang = params.obj.attr('gang');
    const ref = params.obj.attr('ref');
    let lastRef = params.obj.attr('lastref')*1;
    const leader = obj.attr('leader');
    const button_group = obj.attr('button_group')
    let range_value = ref;
    let mackey = core_utils_get_mac_address_from_guid(guid,true);
    if(window.device.platform.toLowerCase()=='android'){
        mackey = uuid.split(":").reverse().join("");
    }
    //change range value,if have the rcu data
    if(button_group.startsWith("RCU")){
        if(ref == '0' && isset(window.dimmingRecord[subdevice]) && window.dimmingRecord[subdevice]['lastref']>0){
            lastRef = window.dimmingRecord[subdevice]['lastref'];
        }
    }else{
        if(ref == '0' && isset(window.dimmingRecord[uuid]) && window.dimmingRecord[uuid]['lastref']>0){
            lastRef = window.dimmingRecord[uuid]['lastref'];
        }
    }
    console.log('lastRef',lastRef)
    if(ref == '0' && lastRef != 0){
      range_value = lastRef.toString(16).pad("00")
    }else if(ref != '0'){
      range_value = 0;
      lastRef = 0;
    }else{
      range_value = 'ff';
      lastRef = 255
    }
    console.log("range_value",range_value)
    let cmd = [];
	cmd.push({action:"connect"});
    
    let this_data = `${(jinja2.render(window.DIM.toString(), {mackey:mackey,dim_value:(ref=='0' ? range_value : '00')})).toLowerCase()}`;
    if(button_group.startsWith("RCU")){
        let this_solt = parseInt(config?config:'01');
        let this_gang = parseInt(button_group.replace("RCU DIMMING",""));
        let gang = parseInt(this_gang-(this_solt-1)*2);
        let rcu_data = `02${core_utils_get_mac_address_from_guid(guid,true)}892${gang ==1?0:1}${ref=='0' ? range_value : '00'}`;
        this_data = rcu_data.slice(0,14)+`971F${config?config:'01'}`+rcu_data.slice(14);
    }
    cmd.push({action:"write",data:this_data});
    let newRef = (ref=='0' ? '1' : '0')
    params.obj.attr('ref', newRef);
    iot_ble_set_ui_status_dimming(guid, "bluetooth", button_group, lastRef)
    if(!isset(scanned_periperals[uuid]['manual']))
        scanned_periperals[uuid]['manual'] = {}
    let currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + 10);
    if(button_group.startsWith("RCU")){
        scanned_periperals[uuid]['manual'][subdevice] = {
            date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
            ref: newRef,
            lastref : lastRef
        }
    }else{
        scanned_periperals[uuid]['manual'][gang] = {
            date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
            ref: newRef,
            lastref : lastRef
        };
    }  
    window.throttle_ha_home_local_status_save.cancel();
    window.throttle_ha_home_local_status_save('local_scanned_periperals',JSON.stringify(window.scanned_periperals));
    ha_process_periperal_cmd(uuid, cmd).then(()=>{
        if(subdevice){
            window.throttle_upload_device_control_log.cancel();
            window.throttle_iot_update_profile_subdevice_status.cancel();
            window.throttle_upload_device_control_log(guid,newRef,control_type,subdevice);
            window.throttle_iot_update_profile_subdevice_status(subdevice,parseInt((ref=='0' ? range_value : '00'),16).toString());
        }
    },(e)=>{
        if(e!="Password is not correct"){
            const toast = app.toast.create({
                position: 'bottom',
                closeTimeout: 3000,
                text: e,
              });
  
              toast.open();
            //alert(e);
        }
    })
};



