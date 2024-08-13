window.prevent_ir_quick_send = {};
window.ir_aircond_airconfig = {}
window.controller_iot_device_ir_full_panel_click = function(params){
    const TAG = "ERP >>> controller_iot_device_ir_full_panel_click";
    console.log(TAG);
    let guid = params.obj.attr('guid');
    let uuid = '';
    for(let i in scanned_periperals){
        if(guid == scanned_periperals[i].guid){
            uuid = i;
        }
    }
    
    const peripherals = scanned_periperals[uuid];
    let subdevice_name = params.obj.closest('li').attr('subdevice-name') || '';
    if(isset(params.obj.attr('subdevice-name'))){
        subdevice_name = params.obj.attr('subdevice-name');
    }
    let command_type = params.obj.attr('command-type');
    let command = params.obj.attr('command');
    
    let mackey = core_utils_get_mac_address_from_guid(guid,true);
    
    let button_signal = params.obj.attr('button-signal');
    
    if(isset(prevent_ir_quick_send[params.obj.attr('guid')]) && prevent_ir_quick_send[params.obj.attr('guid')] == true){
        return;
    }
    prevent_ir_quick_send[params.obj.attr('guid')] = true;
    setTimeout(function(){
        prevent_ir_quick_send[params.obj.attr('guid')] = null;
        delete prevent_ir_quick_send[params.obj.attr('guid')];
    }, 1500);
    
    if(isset(peripherals) && peripherals['connecting']==1) return;
    
    let bleconnected = 0;
    if(isset(peripherals) && peripherals['connected']==1) bleconnected = 1;
    
    
    let network_leader = $('li.device[guid="'+guid+'"]').attr('network-leader');
    l(TAG, "command_type="+command_type);
    l(TAG, "command="+command);
    l(TAG, "guid="+guid);
    l(TAG, "subdevice_name="+subdevice_name);
    let render_pannel = ([tempt,speed,direction,swing,power,mode])=>{
        $(".air-panel a").attr('ref',power);
        if(power){
            $('.hidden').removeClass('hidden');
            $('.tempt-no-set').hide();
            let speedurl = `style/img/air_condition/icon-speed-${speed}.png`;
            $('.fan img').attr('src',speedurl);
            let modeurl = `style/img/air_condition/icon-mode-${mode}.png`;
            $('.mode img').attr('src',modeurl);
            let directionurl = `style/img/air_condition/icon-manual-${direction}.png`;
            $('.direction img').attr('src',directionurl);
            let swingurl = `style/img/air_condition/icon-swing-${swing}.png`
            $('.swing img').attr('src',swingurl);
        }else{
            $('.control').addClass('hidden');
            $('.tempt-no-set').show();
        }
    }
    let configStr = "ir|0|25,1,2,1,0,1"; //e.g. temp|volumn|menu wind|auto wind|on off|mode //temp+"|1|2|1|1|1"
    if(isset(ir_aircond_airconfig[subdevice_name])){
        configStr = ir_aircond_airconfig[subdevice_name];
    }else{
        if(isset(params.obj.attr('config')) && params.obj.attr('config').trim() != "" && params.obj.attr('config').trim() != "None" && params.obj.attr('config').trim() != "null"){
            configStr = params.obj.attr('config')
        }
    }
    if(configStr==""||configStr=="None") configStr = "ir|0|25,1,2,1,0,1";
    let config = configStr.split("|");
    l(TAG, "button_signal2="+button_signal);
    let airconfig = config[2].split(",");
    
    let ircode = "";
    if( button_signal=="ARC_ON_OFF"||
        button_signal=="ARC_MODE"||
        button_signal=="ARC_REDUCE_TEMP"||
        button_signal=="ARC_ADD_TEMP"||
        button_signal=="ARC_SPEED"||
        button_signal=="ARC_DIRECTION"||
        button_signal=="ARC_SWING")
    {
        if(button_signal=="ARC_ON_OFF"){
            l(TAG, "airconfig[4]1="+airconfig[4]);
            airconfig[4] = (airconfig[4]*1+1) % 2;
            l(TAG, "airconfig[4]2="+airconfig[4]);
        }else if(button_signal=="ARC_MODE"){
            airconfig[4] = 1;
            airconfig[5] = airconfig[5]*1+1;
    		if(airconfig[5]>5){
    			airconfig[5]=1;
    		}
            let url = `style/img/air_condition/icon-mode-${airconfig[5]}.png`
            $('.mode img').attr('src',url)
        }else if(button_signal=="ARC_REDUCE_TEMP"){
            airconfig[4] = 1;
    		airconfig[0] = airconfig[0]*1-1;
    		if(airconfig[0]<16){
    			airconfig[0] = 16;
    		}
            $(".tempt-set").text(airconfig[0]);
        }else if(button_signal=="ARC_ADD_TEMP"){
            airconfig[4] = 1;
    		airconfig[0] = airconfig[0]*1+1;
    		if(airconfig[0]>32){
    			airconfig[0] = 32;
    		}
            $(".tempt-set").text(airconfig[0]);
        }else if(button_signal=="ARC_SPEED"){
            airconfig[4] = 1;
            airconfig[1] = airconfig[1]*1+1;
    		if(airconfig[1]>4){
    			airconfig[1]=1;
    		}
            let url = `style/img/air_condition/icon-speed-${airconfig[1]}.png`
            $('.fan img').attr('src',url)
        }else if(button_signal=="ARC_DIRECTION"){
            airconfig[4] = 1;
    		airconfig[3] = 0;
    		airconfig[2] = airconfig[2]*1-1;
    		if(airconfig[2]<1){
    			airconfig[2]=3;
    		}
            let url = `style/img/air_condition/icon-manual-${airconfig[2]}.png`
            $('.direction img').attr('src',url)
        }else if(button_signal=="ARC_SWING"){
            airconfig[4] = 1;
    		airconfig[3] = airconfig[3]*1-1;
    		if(airconfig[3]<0){
    			airconfig[3]=1;
    		}
        }
        //change ui
        render_pannel(airconfig);
        config[2] = airconfig.join(",");
        params.obj.attr('config', config.join("|"));
        if(subdevice_name){
            $('a[subdevice-name="'+subdevice_name+'"]').attr('config', config.join("|"));
            $('li.device[subdevice-name="'+subdevice_name+'"]').find('*[config]').attr('config', config.join("|"));
            $('li.subdevice[subdevice-name="'+subdevice_name+'"]').find('*[config]').attr('config', config.join("|"));
        }
        
        ircode = iot_ble_generate_ir_code(command, button_signal, airconfig.join(","));
        if(subdevice_name){
            controller_aircond_refresh_home_panel_ui(subdevice_name, config.join("|"), command);
        }
        ir_aircond_airconfig[subdevice_name] = config.join("|");
        
        l(TAG, "config="+config.join("|"));
        
    	/*http.request('/api/resource/Profile%20Subdevice/'+subdevice_name,{
    		method: 'PUT',
    		dataType: 'json',
    		data:{config:config.join("|")},
    		contentType:'application/json',
    	});*/
    }else{
        ircode = iot_ble_generate_ir_code(command, button_signal,null);
    }
    
    l(TAG, "ircode="+ircode);
    l(TAG, "network_leader="+network_leader);

    let bytes_array = [];
    if(ircode){
        if(ircode.length>22){
            let group = Math.ceil(ircode.length*1.0 / 22.0);
            for(var i=0; i<group; i++){
                bytes_array.push("87"+(group-i-1).toString(16).pad("00")+ircode.substr(i*22, 22));
            }
        }else{
            bytes_array.push("8700"+ircode);
        }
        //check the status of the cooker
        
        let this_cmd = [];
        this_cmd.push({action:"connect"});
        this_cmd.push({action:"write",data:`02${mackey}80001100`});
        ha_process_periperal_cmd(uuid, this_cmd).then(()=>{
            for(var i in bytes_array){
                (function(_i, _bytes){
                    setTimeout(function(){
                        let cmd = [];
                        cmd.push({action:"connect"});
                        cmd.push({action:"write",data:`02${mackey}${_bytes}`});
                        ha_process_periperal_cmd(uuid, cmd).then(()=>{
    
                        },(error)=>{
                            const toast = app.toast.create({
                                position: 'bottom',
                                closeTimeout: 3000,
                                text: error,
                                });
                    
                            toast.open();
                        }) 
                        //iot_ble_normal_write(guid, "ff80", "ff81", _bytes);
                    }, _i*200)
                })(i, bytes_array[i]);
            }
        },(error)=>{
            const toast = app.toast.create({
                position: 'bottom',
                closeTimeout: 3000,
                text: error,
                });
    
            toast.open();
        })
    }
};