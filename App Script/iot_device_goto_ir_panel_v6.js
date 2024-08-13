window.currentPanelParam = null;
window.currentPanelObject = null;
window.iot_device_goto_ir_panel = (params) => {
    const obj = params.obj.closest('li.device');
    const guid = obj.attr('guid');
    const gateway = obj.attr('gateway');
    const subdevice = obj.attr('subdevice-name');
    const password = iot_ble_get_password(guid);
    const bluetooth = obj.attr("bluetooth")*1;
    const signal = obj.attr("signal")*1;
    const mesh = obj.attr("mesh")*1;
    const mobmob = obj.attr("mobmob")*1;
    const network_id = obj.attr("network-id")*1;
    const button_group = obj.attr("button_group");
    const command_type = params.obj.attr("command-type");
    const command = params.obj.attr("command");
    const title = obj.find(".item-title").html();
    let uuid = "";
    for(let i in scanned_periperals){
      if(scanned_periperals[i].guid == guid){
        uuid = i;
      }
    }
    const p = scanned_periperals[uuid];
    
    window.currentPanelParam = params;
    window.currentPanelObject = obj;
    
    let success = true;
    console.log('iot_device_goto_ir_panel');
    if(gateway){
        mainView.router.navigate('/frappe/detail/'+title.replace("/", "%2F")+'/APP_HA_Full_Panel_V5/Profile%20Subdevice/'+button_group+'/guid='+guid+'/', {history:true});
    }else{
        let cmd = [];
        cmd.push({action:"connect"});
        ha_process_periperal_cmd(guid, cmd).then(()=>{
            mainView.router.navigate('/frappe/detail/'+title.replace("/", "%2F")+'/APP_HA_Full_Panel_V5/Profile%20Subdevice/'+button_group+'/guid='+guid+'/', {history:true});
        },(e)=>{
            const toast = app.toast.create({
            position: 'bottom',
            closeTimeout: 3000,
            text: e,
            });

            toast.open();
        })
    }
};
