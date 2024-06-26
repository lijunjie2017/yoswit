window.iot_device_load_detail = (params) => {
    //console.log("iot_device_load_detail: "+params.ref);
    const parameters = params.ref.split("|");
    const guid = parameters[0];
    let success = true;
    
    //console.log(runtime.peripherals[guid])
    const p = window.peripheral[guid].getProp();
    const device_name = params.obj.attr("device-name");
    const mac_address = params.obj.attr("mac-address");
    const hexBatch = params.obj.attr("hexBatch");
    let hexModel = params.obj.attr("hexModel").split(",").join("");
    const firmware = params.obj.attr("firmware");
    if(!isset(p) || !isset(p.mac_address)){
        if(p){
            p.mac_address = core_utils_get_mac_address_from_guid(guid, false);
        }
        if(!isset(p)){
            hexModel = window.setting_hexid;
        }
    }
    console.log("hexModel",hexModel);
    if(parameters[3]!="0")
        mainView.router.navigate('/frappe/form/New%20Device/APP_HA_Device_Form_V5/Profile%20Subdevice/null/guid='+guid+'&device_button_group='+parameters[1]+'&device_name='+device_name.substring(0,13)+'&mac_address='+mac_address+'&hexBatch='+hexBatch+'&hexModel='+hexModel+'&firmware='+firmware+'/', {history:true});
    else
        mainView.router.navigate('/frappe/form/Edit%20Device/APP_HA_Device_Form_V5/Profile%20Subdevice/'+parameters[2]+'/guid='+guid+'&device_button_group='+parameters[1]+'&device_name='+device_name+'&mac_address='+mac_address+'&hexBatch='+hexBatch+'&hexModel='+hexModel+'&firmware='+firmware+'/', {history:true});
    
    /*
    iot_ble_do_pre_action(guid).then(()=>{
    
    }).catch((error)=>{
        success = false;
        if(error=="Password is not correct"){
            app.dialog.password(_('Please enter the password'), function (password) {
                //app.dialog.alert('Thank you!<br>Password:' + password);
                runtime.peripherals_password[guid].updatedPassword = password;
                window.db.set("peripherals_password", JSON.stringify(runtime.peripherals_password));
                iot_device_load_detail(params);
            });
        }else{
            app.dialog.alert("Unkown:"+_(error));
        }
    }).then(()=>{
        console.log("load completed = "+runtime.peripherals[guid].mackey);
        
        if(success){
            const p = runtime.peripherals[guid];
            if(parameters[3]!="0")
                mainView.router.navigate('/frappe/form/New%20Device/APP_HA_Device_Form_V1/Profile%20Subdevice/null/guid='+guid+'&device_button_group='+parameters[1]+'&device_name='+p.name+'&mac_address='+p.mac_address+'&hexBatch='+p.hexBatch+'&hexModel='+p.hexModel+'&firmware='+p.firmware+'/', {history:true});
            else
                mainView.router.navigate('/frappe/form/Edit%20Device/APP_HA_Device_Form_V1/Profile%20Subdevice/'+parameters[2]+'/guid='+guid+'&device_button_group='+parameters[1]+'&device_name='+p.name+'&mac_address='+p.mac_address+'&hexBatch='+p.hexBatch+'&hexModel='+p.hexModel+'&firmware='+p.firmware+'/', {history:true});
        }
    });
    */
};