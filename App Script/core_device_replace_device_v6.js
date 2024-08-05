window.core_device_replace_pending_cmds = [];
window.core_device_replace_target_temp = {};
window.core_device_replace_target_device = {};
window.core_device_replace_target_profile_device = {};
window.core_device_replace_password = "000000";
window.core_device_replace_settings = [];
window.core_device_replace_device = async(params, fpassword) => {
	clearTimeout(core_device_replace_update_timer1);
	clearTimeout(core_device_replace_update_timer2);
	clearTimeout(core_device_replace_update_timer3);
	
    const temp = params.ref.split("|");
    const this_hex_model = temp[3].toLowerCase();
    const guid = temp[0],
            model = temp[1],
            batch = temp[2];
    let password = iot_ble_get_password(guid);
    let this_mode = '';
    if(isset(fpassword)) password = fpassword;
    let p = peripheral[guid].prop;
    core_device_replace_target_temp.hex_model = temp[3].toLowerCase();
    core_device_replace_target_temp.hex_batch = temp[4].toLowerCase();
    //alert(params.ref);
    //get the device mode,due to some device can not have the device mode in the Device and profile_device
    let model_obj = cloneDeep(erp.doctype.device_model);
    for(let i in model_obj){
        if(model_obj[i].hexid.toLowerCase() === this_hex_model){
            this_mode = model_obj[i].mode;
        }
    }
    core_device_replace_target_device = {guid:guid,password:password,batch:batch,device_model:model,firmware:"",mac_address:"",settings:[],device_mode : this_mode};
    core_device_replace_target_profile_device = {device:guid,device_model:model,device_name:p.name,device_mode : this_mode};
    
    core_device_replace_pending_cmds = [];
    
    /*
    for(let k in core_device_replace_original_device.settings){
        let s = core_device_replace_original_device.settings[k].split("=");
        if(!isset(s[1]) || s[1].trim()=="") continue;
        core_device_replace_pending_cmds.push(s[1]);
        core_device_replace_target_device.settings.push({
            'setting_type':s[0],
            'setting':s[1]
        });
    }*/
    
    
    app.sheet.close();
    app.toast.show({
        text: _('Starting...'),
        position: 'bottom'
    });
    app.preloader.show();
    //await peripheral[guid].disconnect();
    peripheral[guid].connect().then(()=>{
        app.toast.show({
            text: _('Connect Success'),
            position: 'bottom'
        });
        core_device_replace_target_device.firmware = p.firmware || 0;
        core_device_replace_target_device.mac_address = core_utils_get_mac_address_from_guid(p.guid);
        
        if(guid.endsWith("12011A01") && isset(core_device_replace_target_device.guid)){
            let gguid = core_device_replace_target_device.mac_address.split(':').join('').convertToHex()+'12'+core_device_replace_original_device.hex_model.toLowerCase()+core_device_replace_original_device.hex_batch.toLowerCase();
            core_device_replace_target_device.guid = gguid.toLowerCase();
            core_device_replace_target_device.device_model = core_device_replace_original_device.ori_model;
            core_device_replace_target_device.batch = core_device_replace_original_device.ori_batch;
            core_device_replace_target_profile_device.device = gguid.toLowerCase();
            core_device_replace_target_profile_device.device_model = core_device_replace_original_device.ori_model;
            core_device_replace_target_profile_device.device_name = gguid.convertToAscii().substr(0,12);
            
            core_device_replace_pending_cmds.unshift('88014B'+core_device_replace_target_device.mac_address.substr(9,2)+core_device_replace_target_device.mac_address.substr(0,2)+'A16E95', '8100'+core_device_replace_target_device.mac_address.split(':').join('').convertToHex()+'12'+core_device_replace_original_device.hex_model.toLowerCase()+core_device_replace_original_device.hex_batch.toLowerCase());
        }else{
        
        }
        if(password!=core_device_replace_original_device.password){
            core_device_replace_pending_cmds.push(82+password.convertToHex()+core_device_replace_original_device.password.convertToHex());
            core_device_replace_target_device.password = core_device_replace_original_device.password;
            core_device_replace_target_profile_device.password = core_device_replace_original_device.password;
        }
        //core_device_replace_pending_cmds.push('810A01');
        core_device_replace_pending_cmds.push('812A');
        //update the setting command
        let profile_device = cloneDeep(erp.info.profile.profile_device);
        let profile_subdevice = cloneDeep(erp.info.profile.profile_subdevice);
        let erp_device_setting_obj = {};
        window.core_device_replace_settings = [];
        profile_device.forEach((item)=>{

            if(isset(item.default_manufacturing_setup)){
                let json = JSON.parse(item.default_manufacturing_setup);
                let this_obj = {};
                for(let i in json){
                    //first update the erp setting
                    if(i == 'virtual_device_pairing'){
                        //update to the erp
                        //first get the button_group
                        //sencond tune the device name
                        //update the setting
                        let virtual_list = json[i];
                        for(let z in virtual_list){
                            let this_gang = virtual_list[z].gang;
                            let this_mode = virtual_list[z].mode;
                            let target_button_group = virtual_list[z].target_button_group;
                            let this_type = '';
                            if(this_mode == 'On Off Switch'){
                                this_type = `ONOFF GANG${this_gang}|Virtual Device Pairing`;
                            }
                            //get the mapping device info
                            let this_network_id = virtual_list[z].network_id;
                            let this_position = virtual_list[z].position;
                            let this_device_name = '';
                            this_device_name = profile_device.find(kitem=>kitem.network_id && kitem.network_id == this_network_id && kitem.network_position == this_position).device_name;
                            window.core_device_replace_settings.push({
                                "setting_type" : this_type,
                                "setting" : `${target_button_group}|${this_device_name}`
                            });
                        }
                    }
                    if(i == 'physical_switch_lock'){
                        window.core_device_replace_settings.push({
                            "setting_type" : 'Physical Switch Lock',
                            "setting" : 'On'
                        });
                    }
                    if(i == 'run_for'){
                        //different mode have different button_group
                        let this_mode = item.device_mode;
                        let setting_type = '';
                        let run_obj = {};
                        if(this_mode && this_mode == 'On Off Switch'){
                            let this_gang = json[i].gang;
                            setting_type = `ONOFF GANG${this_gang}`;
                            run_obj = {
                                "button_group" : setting_type,
                                "Run for (s)" : json[i].run_for_time,
                                "Delay Mode" : 'Off Only',
                                "Delay for (s)" : 0
                            }
                            window.core_device_replace_settings.push({
                                "setting_type" : `${setting_type}|Delay Lastfor`,
                                "setting" : JSON.stringify(run_obj)
                            });
                        }
                        if(this_mode && this_mode == 'Curtain Switch'){
                            let this_gang = json[i].gang;
                            setting_type = `OPENCLOSE GANG${this_gang}`;
                            run_obj = {
                                "button_group" : setting_type,
                                "Run for (s)" : json[i].run_for_time,
                                "Delay Mode" : 'Off Only',
                                "Delay for (s)" : 0
                            }
                            window.core_device_replace_settings.push({
                                "setting_type" : `${setting_type}|Delay Lastfor`,
                                "setting" : JSON.stringify(run_obj)
                            });
                        }
                    }
                    if(i != 'virtual_device_pairing'){
                        let list = json[i];
                        list.forEach((kitem)=>{
                            core_device_replace_pending_cmds.push(kitem);
                        })
                    }else{
                        let list = json[i];
                        list.forEach((kitem)=>{
                            let gang = kitem.gang;
                            let nework_id = kitem.nework_id;
                            let position = kitem.position;
                            let target_mac = '';
                            profile_device.forEach((zitem=>{
                                if(nework_id == zitem.nework_id && position == zitem.network_position){
                                    target_mac = zitem.device_name;
                                }
                            }))
                            //map the virtual_device_pairing command
                            let command = `8108${gang.toString(16).pad("00")}20${target_mac}2000`
                        })
                    
                    }
                }
                
                window.core_device_replace_settings.push(this_obj);
            }
        })
        core_device_replace_device_write_command(guid)
    }).catch((error)=>{
        app.preloader.hide();
        if(error=="Password is not correct"){
            app.dialog.password(_('Please enter the password'), function (password) {
                if(!isset(p)){
                    runtime = {};
                    runtime.peripherals_password[guid] = {};
                    runtime.peripherals_password[guid].password = password;
                }
                runtime.peripherals_password[guid].updatedPassword = password;
                $("li.device[guid='" + guid + "']").attr('updatedPassword', password);
                db.set("peripherals_password", JSON.stringify(runtime.peripherals_password));
                core_device_replace_device(params, password);
            });
        }else{
            app.dialog.alert(_(error));
        }
    });
    
	//let profile_device_data = {idx:data.profile_device_idx,device:guid,password:password,parenttype:data.parenttype,parent:data.parent,parentfield:'profile_device',device_name:data.device_name,device_model:data.model};
};

window.core_device_replace_device_write_command = (guid) => {
    app.toast.show({
        text: _('Writing ...'),
        position: 'bottom'
    });
    console.log("Writing...");
    if(core_device_replace_pending_cmds.length>0){
        const data = core_device_replace_pending_cmds.shift();
        console.log("======> Write data = "+data);
        if(!isset(data) || data.trim()==""){
            core_device_replace_device_write_command(guid);
        }else{
            app.toast.show({
                text: _('Writing '+data+' ...'),
                position: 'bottom'
            });
            peripheral[guid].write([{
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
              }]).then(()=>{
                core_device_replace_device_write_command(guid);
            }).catch((error)=>{
                core_device_replace_pending_cmds = [];
                app.dialog.alert(_(error));
            })
        }
    }else{
    	let url = "/api/resource/Device/"+core_device_replace_target_device.guid;
    	let method = "GET";
        
        http.request(url, {
		    method: method
    	}).then((rs)=>{
    	    method = "PUT";
    	    return http.request(url, {
        		method: method,
        		serializer: 'json',
        		data:{data:core_device_replace_target_device},
        	})
    	}, (error)=>{
    	    //app.dialog.alert(_("2222error="+guid));
    	    //app.dialog.alert(_("2222error="+error));
    	    url = "/api/resource/Device";
    	    method = "POST";
    	    return http.request(url, {
        		method: method,
        		serializer: 'json',
        		data:{data:core_device_replace_target_device},
        	});
    	}).then((rs)=>{
    	    url = "/api/resource/Profile/"+encodeURI(erp.info.profile.name);
    	    method = "PUT";
          let newData = Object.assign(core_device_replace_target_profile_device,{
            parenttype:'Profile',
            parent:erp.info.profile.name,
            parentfield:'profile_device'
          });
          let devices = cloneDeep(erp.info.profile.profile_device);
          devices.forEach(item=>{
            if(item.name == core_device_replace_original_device.name){
                item = newData
            }
          })
    	    return http.request(url, {
        		method: method,
                dataType: 'json',
        		serializer: 'json',
        		data:{
                    profile_device:devices,
                },
                contentType:'application/json',
        	});
    	}).then((rs)=>{
            //in order to update the device setting
            let url = "/api/resource/Device/"+core_device_replace_target_device.guid;
            console.log(window.core_device_replace_settings.filter(item=>item.setting_type));
    	    return http.request(encodeURI(url), {
        		method: "PUT",
        		serializer: 'json',
        		data:{
                    settings:window.core_device_replace_settings.filter(item=>item.setting_type)
                },
        	})
            // return new Promise((resolve,reject)=>{
            //     console.log(window.core_device_replace_settings);
            //     resolve();                
            // })
        }).then((rs)=>{
            /*app.toast.show({
                text: _('Completing...'),
                closeTimeout: 1000,
                position: 'bottom'
            });
            setTimeout(function(){
        	    mainView.router.refreshPage();
        	    //app.dialog.alert(_("Replace Successfully2"));
        	    app.preloader.hide();
        	    //mainView.router.refreshPage();
            }, 1000);
            */
            
            //mainView.router.back()
            app.toast.show({
                text: _('Replace Successfully'),
                closeTimeout: 2000,
                position: 'bottom'
            })
            setTimeout(function(){
                ha_profile_ready();
                mainView.router.refreshPage();
            }, 1000);
            setTimeout(function(){
                app.preloader.hide()
            }, 3000);
            
    	}, (error)=>{
            app.toast.show({
                text: _('Checking...'),
                closeTimeout: 1000,
                position: 'bottom'
            });
            setTimeout(function(){
        	    //app.dialog.alert(_("error="+error));
        	    alert(_("error="+error));
        	    app.preloader.hide();
            }, 1000);
    	});
    }
}