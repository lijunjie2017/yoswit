window.iot_mode_setup_change_mode_picker = {};
window.iot_mode_setup_change_mode_init = function(params) {
    const TAG = ">>>> iot_mode_setup_powerup_status_auto_init";
    console.log(TAG)
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    let device_mode = params.obj.attr("device-mode");
    const inputEl = params.obj.find("input[name=change_mode]");
    const subdevice_name = params.obj.attr("subdevice-name");
    let status = true;//Multiway Switch have different formware
    let slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    //get active device mode
    if(subdevice_name && isset(subdevice_name)){
        let subdevices = cloneDeep(erp.info.profile.profile_subdevice);
        subdevices.forEach(item=>{
            if(subdevice_name === item.name){
                device_mode = item.device_mode
            }
        })
    }
    if(device_mode == "Multiway Switch" && firmware.startsWith("10.")){
        status = false;
    }
    let device_hex_model = peripheral[guid].getProp().hexModel.toUpperCase();
    let device_model = erp.doctype.device_model[device_hex_model];
    let device_default_template_list = erp.doctype.device_model[peripheral[guid].getProp().hexModel.toUpperCase()].device_default_template || {}
    let dms = {};
    for(let i in device_default_template_list){
        if(!isset(dms[device_default_template_list[i].mode])){
            dms[device_default_template_list[i].mode] = true;
        }
    }
    let valueList = [];
    for(let i in dms){
        valueList.push(i);
    }
    if(button_group.startsWith("RCU DIMMING")){
        valueList = ["Triac Dimming","0-10v Dimming","On Off Switch","Curtain Switch"];
    }else if(device_mode.startsWith("RCU Controller")){
        valueList = ["RCU Controller"];
    }else if(button_group.startsWith("RCU ONOFF GANG")){
        valueList = ["Triac Dimming","0-10v Dimming","On Off Switch","Curtain Switch"];
    }
    iot_mode_setup_change_mode_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: valueList
            }
        ],
        formatValue: (values) => {
            return values[0];
        },
        renderToolbar: () => {
            return `
            <div class="toolbar">
                <div class="toolbar-inner">
                    <div class="left"></div>
                    <div class="right">
                        <a href="#" class="link toolbar-save-link">${_("Save")}</a>
                    </div>
                </div>
            </div>
            `;
        },
        on: {
            open: (picker) => {
                iot_mode_setup_change_mode_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", () => {
                    iot_mode_setup_change_mode_picker.close();
                    const selected = inputEl.val();

                    app.preloader.show();

                    iot_ble_check_enable()
                    .then(()=>{
                        //if Triac Dimming write some command,if 0-10v Dimming write some command
                        if(selected == 'Triac Dimming'){
                            let data = `971f${slot_index}89070101`;
                            return window.peripheral[guid].write([{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `9711${slot_index}02`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: data,
                              },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `971f${slot_index}89050d0d`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `971f${slot_index}89068a8a`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `810e`,
                            }]);
                        }else if(selected == '0-10v Dimming'){
                            let data = `971f${slot_index}89070202`;
                            return window.peripheral[guid].write([{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `9711${slot_index}02`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: data,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `971f${slot_index}89050000`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `971f${slot_index}8906ffff`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `810e`,
                            }]);
                        }else if(selected == '1-10v Dimming'){
                            let data = `971f${slot_index}89070303`;
                            return window.peripheral[guid].write([{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `9711${slot_index}02`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: data,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `971f${slot_index}89050000`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `971f${slot_index}8906ffff`,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `810e`,
                            }]);
                        }else if(selected == 'On Off Switch'){
                            let data = `9711${slot_index}01`;
                            let this_data = `971f${slot_index}810500`;
                            debugger
                            return window.peripheral[guid].write([{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: data,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: this_data,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `810e`,
                            }]);
                        }else if(selected == 'Curtain Switch'){
                            let data = `9711${slot_index}01`;
                            let this_data = `971f${slot_index}810501`;
                            return window.peripheral[guid].write([{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: data,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: this_data,
                            },{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: `810e`,
                            }]);
                        }else{
                            return new Promise((solve)=>{
                                solve()
                            })
                        }
                    })
                    .then(async() => {
                        //if rcu should add some devices
                        if(selected == 'On Off Switch'){
                            let subdevices = erp.info.profile.profile_subdevice;
                            let device_name = '';
                            let profile_room = '';
                            let room_name = '';
                            let device_guid = '';
                            let postList = [];
                            let postSubdevices = [];
                            subdevices.forEach(item=>{
                                if(subdevice_name == item.name){
                                    subdevices.forEach(kitem=>{
                                        if(kitem.config == item.config && kitem.device == item.device && kitem.name != subdevice_name){
                                            debugger
                                            kitem.hidden = 1;
                                        }
                                    })
                                    device_name = item.profile_device;
                                    profile_room = item.profile_room;
                                    room_name = item.room_name;
                                    device_guid = item.device;
                                    item.device_mode = 'On Off Switch';
                                    let config = item.config;
                                    if(config == '01'){
                                        item.device_button_group = 'RCU ONOFF GANG1';
                                        postList = [{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 1-2`,
                                            device_button_group: 'RCU ONOFF GANG2',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 1-3`,
                                            device_button_group: 'RCU ONOFF GANG2',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 1-4`,
                                            device_button_group: 'RCU ONOFF GANG2',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          }]
                                    }else if(config == '02'){
                                        item.device_button_group = 'RCU ONOFF GANG5';
                                        postList = [{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 2-2`,
                                            device_button_group: 'RCU ONOFF GANG6',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 2-3`,
                                            device_button_group: 'RCU ONOFF GANG7',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 2-4`,
                                            device_button_group: 'RCU ONOFF GANG8',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          }]
                                    }else if(config == '03'){
                                        item.device_button_group = 'RCU ONOFF GANG9';
                                        postList = [{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 3-2`,
                                            device_button_group: 'RCU ONOFF GANG10',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 3-3`,
                                            device_button_group: 'RCU ONOFF GANG11',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 3-4`,
                                            device_button_group: 'RCU ONOFF GANG12',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          }]
                                    }else if(config == '04'){
                                        item.device_button_group = 'RCU ONOFF GANG13';
                                        postList = [{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 4-2`,
                                            device_button_group: 'RCU ONOFF GANG14',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 4-3`,
                                            device_button_group: 'RCU ONOFF GANG15',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 4-4`,
                                            device_button_group: 'RCU ONOFF GANG16',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          }]
                                    }else if(config == '05'){
                                        item.device_button_group = 'RCU ONOFF GANG17';
                                        postList = [{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 5-2`,
                                            device_button_group: 'RCU ONOFF GANG18',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 5-3`,
                                            device_button_group: 'RCU ONOFF GANG19',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          },{
                                            parenttype: 'Profile',
                                            parent: erp.info.profile.name,
                                            parentfield: 'profile_subdevice',
                                            profile_room: profile_room,
                                            profile_device: device_name,
                                            device: device_guid,
                                            title: `YO780 4G 5-4`,
                                            device_button_group: 'RCU ONOFF GANG20',
                                            device_mode: 'On Off Switch',
                                            config: config,
                                          }]
                                    }
                                }
                            })
                            let subUrl = `/api/resource/Profile/${erp.info.profile.name}`;
                            await http2.request(encodeURI(subUrl), {
                                method: 'PUT',
                                serializer: 'json',
                                responseType: 'json',
                                data: {
                                    profile_subdevice : subdevices
                                },
                                debug: true,
                                });
                            for(let i in postList){
                                let url = `/api/resource/Profile Subdevice`;
                                await http2.request(encodeURI(url), {
                                    method: 'POST',
                                    serializer: 'json',
                                    responseType: 'json',
                                    data: postList[i],
                                    debug: true,
                                    });
                            }  
                        }
                        //let url = `/api/resource/Profile Subdevice/${subdevice_name}`;
                        let subdevices = cloneDeep(erp.info.profile.profile_subdevice);
                        
                        let url = `/api/resource/Profile/${erp.info.profile.name}`;
                        let method = 'PUT';
                        let post_data = {
                            "device_mode": selected,
                        }
                        if(selected == 'Curtain Motor Ac' || selected == 'Curtain Motor'){
                            post_data['device_button_group'] = 'OPENCLOSE UART';
                            //should check original device_button_group
                            if(button_group.includes('REVERSE')){
                                //update the status
                                let status =  peripheral[guid].prop.status.control[0][48];
                                let last_status = peripheral[guid].prop.status.last[0][48];
                                peripheral[guid].prop.status.control[0][48] = 100 - status*1;
                                if(last_status > 1){
                                    peripheral[guid].prop.status.last[0][48] = 100 - last_status*1;
                                }
                            }
                        }else if(selected == 'Curtain Motor Reverse Ac' || selected == 'Curtain Motor Reverse'){
                            post_data['device_button_group'] = 'OPENCLOSE UART REVERSE';
                            //should check original device_button_group
                            if(!button_group.includes('REVERSE')){
                                //update the status
                                let status =  peripheral[guid].prop.status.control[0][48];
                                let last_status = peripheral[guid].prop.status.last[0][48];
                                peripheral[guid].prop.status.control[0][48] = 100 - status*1;
                                if(last_status > 1){
                                    peripheral[guid].prop.status.last[0][48] = 100 - last_status*1;
                                }
                            }
                        }
                        subdevices.forEach(item=>{
                            if(subdevice_name == item.name){
                                item.device_mode = selected;
                                item.device_button_group = post_data['device_button_group'];
                            }
                        })
                        return http.request(encodeURI(url), {
                            method: method,
                            serializer: 'json',
                            responseType: 'json',
                            data: {
                                profile_subdevice : subdevices
                            },
                            debug: true,
                        });
                    }).then(() => {
                        app.preloader.hide();
                        return ha_profile_ready(2);
                    }).then(()=>{
                        app.dialog.alert(_('Change Mode successfully'));
                    }).catch((err) => {
                        app.preloader.hide();
                        
                        if (!iot_ble_exception_message(err, false)) {
                            app.dialog.alert(err, runtime.appInfo.name);
                        }
                    });
                });
            }
        }
    });
    console.log(params.obj.find("#action-powerup-status"))
    params.obj.find("#action-change-mode").on("click", () => {
        console.log(iot_mode_setup_change_mode_picker);
        app.dialog.confirm(`${_('This operation will change the data related to the profile and this device, are you sure to confirm?')}`,()=>{
            iot_mode_setup_change_mode_picker.open();
        },()=>{})
    });
}