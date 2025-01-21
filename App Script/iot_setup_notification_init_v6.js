window.iot_setup_notification_init_picker = {};
window.iot_setup_notification_init = function(params) {
    const TAG = ">>>> iot_setup_notification_init";

    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    const inputEl = params.obj.find("input[name=setup_notification]");

    iot_setup_notification_init_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: ['Disable','Door Open','Door Close'],
                displayValues: ['Disable','Door Open','Door Close']
            }
        ],
        formatValue: function(values) {
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
                iot_setup_notification_init_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", async() => {
                    iot_setup_notification_init_picker.close();

                    const selected = inputEl.val();
                    debugger
                    app.dialog.preloader();
                    //iot write
                    try{
                        //get the gateway id
                        let profile_device = cloneDeep(erp.info.profile.profile_device);
                        let devices = cloneDeep(erp.info.device);
                        let gateway_str = profile_device.find(item=>item.device == guid).gateway;
                        
                        if(gateway_str){
                            // let sceneIdMap = await get_battery_threshold_scene_id("Geomagnetic Scene",guid);
                            let sceneId = '4';//only one scene
                            let sceneName = await get_scene_by_device_id(guid,sceneId);
                            let gateway_mac = gateway_str.split("-")[0];
                            let gateway_guid = '';
                            for(let i in devices){
                                if(devices[i].mac_address.toLowerCase() == gateway_mac.trim().toLowerCase()){
                                    gateway_guid = i;
                                    break;
                                }
                            };
                            let typeIndex = '05';
                            let opcode = '00';
                            let gatewayId = await get_device_id_by_guid(gateway_guid);
                            
                            if(!gatewayId || gatewayId == 'null'){
                                gatewayId = 1;
                            }
                            debugger
                            if(!sceneName){
                                gatewayId = parseInt(gatewayId) + 1;
                            }else{
                                //get the save id
                                let scenes = cloneDeep(erp.info.scene);
                                for(let i in scenes){
                                    if(i == sceneName){
                                        let scene_device_location = scenes[i].scene_device_location;
                                        for(let j in scene_device_location){
                                            if(scene_device_location[j].device == gateway_guid){
                                                gatewayId = scene_device_location[j].storage_id;
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            //check the door firmware version
                            let firmware = window.peripheral[guid]?.prop?.firmware;
                            let this_ref = '';
                            let post_type = '';
                            if(selected == 'Door Open'){
                                this_ref = '7c';
                                post_type = '0b';
                            }else if(selected == 'Door Close'){
                                this_ref = '7b';
                                post_type = '0c';
                            }
                            let trigger = '';
                            let button_action = '';
                            if(firmware && firmware.includes("12.0")){

                            }else{
                                //old version
                                //8f01008d010200054a06a403ee048c
                                if(!this_ref){
                                    trigger = `8f0100${parseInt('143').toString(16).pad("00")}00`;
                                    button_action = `8f0300${parseInt('143').toString(16).pad("00")}00`;
                                }else{
                                    trigger = `8f0100${parseInt('143').toString(16).pad("00")}010200${typeIndex}${core_utils_get_mac_address_from_guid(gateway_guid,true)}${parseInt(gatewayId).toString(16).pad("00")}`;
                                    button_action = `8f0300${this_ref}${parseInt('143').toString(16).pad("00")}`;
                                }
                                let $command = `02${core_utils_get_mac_address_from_guid(gateway_guid,true)}18${core_utils_get_mac_address_from_guid(guid,true)}${guid}${post_type}`;
                                gateway_action = `8F1000${parseInt(gatewayId).toString(16).pad("00")}${parseInt($command.length/2).toString(16).pad("00")}${$command}`;
                                debugger
                            }
                            //post ble
                            let trigger_ble_list = [];
                            trigger_ble_list.push({
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: trigger,
                            });
                            trigger_ble_list.push({
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: button_action,
                            });
                            let gateway_action_ble_list = [];
                            gateway_action_ble_list.push({
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: gateway_action,
                            });
                            //check gateway is online
                            try{
                                let gateway_connected = window.peripheral[gateway_guid]?window.peripheral[gateway_guid].prop.rssilv:0;
                                if(!gateway_connected){
                                    app.dialog.close();
                                    app.dialog.alert(_("This setting requires a connection through the Gateway, and please ensure that the Gateway is online."));
                                    return;
                                }
                            }catch(err){
                                app.dialog.close();
                                app.dialog.alert(_(erp.get_log_description(err)));
                                return;
                            }
                            try{
                                await window.peripheral[guid].write(trigger_ble_list);
                                await window.peripheral[gateway_guid].write(gateway_action_ble_list);
                                await iot_device_setting_sync_server(guid, setting_type, selected);
                                //update the scene data
                                let scene_device_location = [{
                                    device: guid,
                                    storage_id: sceneId
                                },{
                                    device: gateway_guid,
                                    storage_id: gatewayId
                                }];
                                await post_scene_data(sceneName,scene_device_location,selected,selected);
                                params.obj.attr("setting-value", selected);
                                params.obj.find(".setting-value").html(_(selected));
                                await ha_profile_ready();
                                app.dialog.close();
                                app.dialog.alert(_("Save Successfully"));
                            }catch(err){
                                app.dialog.close();
                                app.dialog.alert(_(erp.get_log_description(err)));
                                return;
                            }
                            
                        }else{
                            app.dialog.close();
                            app.dialog.alert(_("This setting requires a connection through the Gateway, and please ensure that the Gateway is online."));
                            return;
                        }
                    }catch(error){
                        app.dialog.close();
                        app.dialog.alert(_(erp.get_log_description(error)));
                    }
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_setup_notification_init_picker.open();
    });
}

window.get_scene_by_device_id = async (guid,storage_id) => {
    return new Promise(async (resolve,reject)=>{
    //this case only have one scene
    try{
        let url = `/api/method/appv6.getSceneListByDeviceId?storage_id=${storage_id}&guid=${guid}`;
        let res = await http2.request(encodeURI(url),{
            method: 'GET',
            serializer: 'json',
            responseType: 'json',
            debug:true
        });
        debugger
        resolve(res.data.data?res.data.data.name:'');
        }catch(error){
            reject(error);
        }
    })
}