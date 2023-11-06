window.iot_device_setting_label_init = (title)=>{
    const TAG = "iot_device_setting_label_init";
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
            }
        })
    })
    setting_list = setting_mode.device_setup_template;
    setting_list.forEach((setting_item,setting_index) => {
        let setting_template = window.setting_label_template[setting_item.label];
        if(isset(setting_template) && setting_item.type != 'Section Break'){
            let data = Object.assign({},window.setting_profile_device,window.setting_profile_subdevice,window.setting_device,window.setting_batch,window.setting_brand);
            data.settings = window.setting_settings.join(",");
            data.brand_image = window.setting_brand.image;
            data.subdevice_list = subdevice_list;
            data.uuid = "";
            data.setting_title = title.substring(5,title.length);
            for(let i in scanned_periperals){
                if(data.guid == scanned_periperals[i].guid){
                    data.uuid = i;
                }
            }
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
            device_setting_list.forEach(device_item=>{
                //console.log(device_item);
                if(device_item.setting_type == setting_item.label){
                    data.self_setting_data = {
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
            })
            //check if developer
            //console.log("data",data)
            if(setting_item.role == 'App Developer' && !window.developer){
              return;
            }
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

window.iot_device_setting_fun_init = ()=>{

};