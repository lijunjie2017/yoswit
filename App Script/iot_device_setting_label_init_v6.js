window.iot_device_setting_label_init = (title,subdevice_name,profile_device_name,guid,device_mode,slot_index)=>{
    const TAG = "iot_device_setting_label_init";
    //init data for v6
    initSettingData(subdevice_name,profile_device_name,guid,device_mode);
    console.log(TAG);
    let setting_list = [];
    let device_setting_list = [];
    device_setting_list = window.setting_device.settings;
    //group some data in same list (subdevice and profile device)
    let subdevice_list = [];
    subdevice_list = window.setting_profile.profile_subdevice;
    let profile_device_list = [];
    profile_device_list = window.setting_profile.profile_device;
    subdevice_list.forEach((item,index)=>{
        profile_device_list.forEach(kitem=>{
            if(item.profile_device == kitem.name){
                subdevice_list[index] = Object.assign({profile_device_name : kitem.name,profile_subdevice_name:item.name},subdevice_list[index],kitem);
                subdevice_list[index]['device_name'] = kitem['device_name'].substring(0,12);
                subdevice_list[index]['mac_address'] = kitem['device_name'].substring(0,12);
            }
        })
    })
    setting_list = setting_mode.device_setup_template;
    setting_list.forEach((setting_item,setting_index) => {
        let setting_template = window.setting_label_template[setting_item.label];
        let rolesList = erp.info.user.roles;
        rolesList.forEach(item=>{
            if(item.role === 'App Developer' || item.role === 'Custom Host'){
                window.developer = true;
            }
        })
        if((setting_item.role == 'App Developer') && !window.developer){
            return;
        }
        if(isset(setting_template) && setting_item.type != 'Section Break'){
            let data = Object.assign({},window.setting_profile_device,window.setting_profile_subdevice,window.setting_device,window.setting_batch,window.setting_brand);
            data.settings = window.setting_settings.join(",");
            data.brand_image = window.setting_brand.image;
            data.subdevice_list = subdevice_list;
            data.uuid = "";
            data.slot_index = slot_index;
            data.hexModel = setting_hexid;
            data.mac
            data.setting_title = title.substring(5,title.length);
            if(isset(window.peripheral[guid].getProp().id)){
                data.uuid = window.peripheral[guid].getProp().id;
            }
            //if can not get the firmware,pass to the ble
            if(!data.firmware || data.firmware == '----' ||  data.firmware == 'undefined'){
                if(peripheral && isset(window.peripheral[guid])){
                    data.firmware = window.peripheral[guid].prop.firmware;
                }
            }
            // if(!data.firmware || data.firmware == '----'){
            //     if(isset(window.scanned_periperals[data.uuid])){
            //         data.firmware = window.scanned_periperals[data.uuid].firmware?window.scanned_periperals[data.uuid].firmware:0;
            //     }else{
            //         data.firmware = 0;
            //     }
            // }else if(isset(window.scanned_periperals[data.uuid]) && isset(window.scanned_periperals[data.uuid].firmware) && window.scanned_periperals[data.uuid].firmware > data.firmware){
            //     data.firmware = window.scanned_periperals[data.uuid].firmware;
            // }
            data.self_setting_data = {
                setting_type : setting_item.label,
                setting : '',
                name : '',
                dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
            };
            data.pair_data = {
                setting_type : "",
                setting : '',
                name : '',
            };
            data.rcu_min = {
                setting_type : '',
                setting : '',
                name : '',
                dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
            }
            data.per_data = {
                setting_type : 'Per Press Brightness',
                setting : '',
                name : '',
                dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
            }
            data.led_data = {
                setting_type : 'Led Mode',
                setting : '',
                name : '',
                dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
            }
            data.brightness_data = {
                setting_type : 'Backlight Brightness',
                setting : '',
                name : '',
                dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
            }
            device_setting_list.forEach(device_item=>{
                console.log(device_item);
                if(device_item.setting_type == setting_item.label){
                    data.self_setting_data = {
                        setting_type : device_item.setting_type,
                        setting : device_item.setting,
                        name : device_item.name,
                        dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
                    }
                }
                let rcu_key = `Minimum Trim_${data.slot_index}`
                if(device_item.setting_type == rcu_key){
                    data.rcu_min = {
                        setting_type : device_item.setting_type,
                        setting : device_item.setting,
                        name : device_item.name,
                        dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
                    }
                }
                let key = "Device Pairing"+data.device_button_group.replace("ONOFF GANG","")*1;
                if(device_item.setting_type == key){
                    data.pair_data = {
                        setting_type : device_item.setting_type,
                        setting : device_item.setting,
                        name : device_item.name
                    }
                }
                let per_key = `Per Press Brightness ${data.device_button_group}`;
                if(device_item.setting_type == per_key){
                    data.per_data = {
                        setting_type : 'Per Press Brightness',
                        setting : device_item.setting,
                        name : device_item.name,
                        dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
                    }
                }
                let led_key = `Led Mode_${data.device_button_group}`;
                if(device_item.setting_type == led_key){
                    data.led_data = {
                        setting_type : 'Led Mode',
                        setting : device_item.setting,
                        name : device_item.name,
                        dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
                    }
                }
                let brightness_key = `Backlight Brightness`;
                if(device_item.setting_type == brightness_key){
                    data.brightness_data = {
                        setting_type : 'Backlight Brightness',
                        setting : device_item.setting,
                        name : device_item.name,
                        dependencies : isset(setting_item.dependencies)?setting_item.dependencies:""
                    }
                }
            })
            //check if developer
            //console.log("data",data)
            
            let html = jinja2.render(setting_template, {
                ...data,
                _: _,
            });
            $(".device-setting-list").append(html);
        }else{
            if(setting_item.type == 'Section Break'){
                let data = {};
                data.self_setting_data = {
                    setting_type : setting_item.label,
                    setting : '',
                    name : ''
                };
                setting_template = window.setting_label_template['Title'];
                let html = jinja2.render(setting_template, {
                    ...data,
                    _: _,
                });
                $(".device-setting-list").append(html);
            }
        }
    });
}
window.initSettingData = (subdevice_name,profile_device_name,guid,device_mode)=>{
    window.setting_profile = cloneDeep(erp.info.profile);
    let profile_device = cloneDeep(erp.info.profile.profile_device);
    let profile_subdevice = cloneDeep(erp.info.profile.profile_subdevice);
    let this_setting_device = cloneDeep(erp.info.device);
    let hexid = device_mode != 'Miele Device'?guid.substring(guid.length - 6, guid.length - 2).toUpperCase():'';
    if(!hexid){
        let this_device_model = erp.info.device[guid].device_model;
        hexid = Object.values(erp.doctype.device_model).find(item=>item.name == this_device_model).hexid;
    }
    console.log(profile_device.find((item)=>item.name === profile_device_name));
    window.setting_profile_device = profile_device.find((item)=>item.name === profile_device_name);
    window.setting_profile_device.profile_device_name = profile_device_name;
    window.setting_profile_subdevice = profile_subdevice.find((item)=>item.name === subdevice_name);
    window.setting_profile_subdevice.profile_subdevice_name = subdevice_name;
    window.setting_device = this_setting_device[guid]?this_setting_device[guid]:{};
    window.setting_device.device_settings = window.setting_device?window.setting_device.settings:null;
    window.setting_settings = window.setting_device?window.setting_device.settings:[];
    window.setting_mode = erp.doctype.device_mode[device_mode];
    window.setting_hexid = hexid;
    window.setting_model = erp.doctype.device_model[hexid];
    window.setting_model.model_name = window.setting_model.name;
    window.setting_batch = Object.values(erp.doctype.device_batch).find((item)=>item.batch_id === setting_device.batch);
    //debugger
    if(window.setting_batch){
        window.setting_batch.batch_name = window.setting_batch.name;
    }
    window.setting_brand = erp.doctype.device_brand[setting_model.brand];
    //console.log(window.setting_mode);
};
window.iot_device_setting_fun_init = ()=>{

};