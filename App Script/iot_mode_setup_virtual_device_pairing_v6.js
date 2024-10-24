window.iot_mode_setup_virtual_device_pairing_picker = {};
window.iot_mode_setup_virtual_device_pairing_auto_init = function(params) {
    const TAG = ">>>> iot_mode_setup_virtual_device_pairing_auto_init";
    console.log(TAG)
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const this_subdevice = params.obj.attr("subdevice-name");
    const device_model = params.obj.attr("device-model");
    const inputEl = params.obj.find("input[name=virtual_device_pairing]");
    const valueEl = params.obj.find(".setting-value");

    const pairing_devices = [];
    params.obj.find("#network-group-device .device").forEach((e) => {
        const el = $(e);
        if(el.attr("guid") != guid){
            pairing_devices.push({
                mac_address: el.attr("button-group")+"|" + el.attr("mac-address"),
                name: el.attr("name"),
                button_group: el.attr("button-group"),
                subdevice_name : el.attr("subdevice-name")
            });
        }
    });

    const update_setting_value = () => {
        const mac = params.obj.attr("setting-value");
        //find the profile setting
        let devices = cloneDeep(erp.info.profile.profile_subdevice);
        let config = null;
        devices.forEach(item=>{
            if(this_subdevice == item.name){
                if(item.config){
                    config = JSON.parse(item.config); 
                }
            }
        })
        let mapping_device = config?config['mapping']:'';
        let show_value = '';
        if(mapping_device){
            devices.forEach(item=>{
                if(mapping_device == item.name){
                    show_value = tran(item.title);
                }
            })
        }
        console.log("valueEl",valueEl);
        console.log("show_value",show_value)
        if(show_value){
            valueEl.html(show_value);
        }else{
            valueEl.html(_("No Pairing"));
        }
        // if (mac === "No Pairing") {
        //     valueEl.html(_("No Pairing"));
        // } else {
        //     const target = pairing_devices.find((e) => e.mac_address === mac);
        //     if (target) {
        //         valueEl.html(target.name);
        //     }
        // }
    }

    update_setting_value();

    const reverseStringByLittleEndian = (hexString) => {
        let swapped = "";
        for (var i = hexString.length - 2; i >= 0; i -= 2) {
            swapped += hexString.substr(i, 2);
        }
        return swapped;
    };

    iot_mode_setup_virtual_device_pairing_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: 'center',
                values: ["No Pairing", ...pairing_devices.map((e) => e.mac_address)],
                displayValues: [_("No Pairing"), ...pairing_devices.map((e) => e.name)]
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
                iot_mode_setup_virtual_device_pairing_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", () => {
                    iot_mode_setup_virtual_device_pairing_picker.close();

                    const mac = inputEl.val();
                    const target_info = pairing_devices.find((e) => e.mac_address === mac);

                    app.preloader.show();
                    let target_data = {};
                    iot_ble_check_enable()
                    // .then(() => {
                    //     return iot_ble_do_pre_action(guid)
                    // })
                    .then(() => {
                        let data = "8108";
                        let data_2 = "";
                        let data_3 = "";//pause curtain switch
                        if (mac === "No Pairing") {
                            //check if curtain switch
                            if(button_group.startsWith("OPENCLOSE GANG")){
                                let curtain_gang = button_group.replace("OPENCLOSE GANG","");
                                data_3 = `81080502`;
                                if(curtain_gang == '1_2'){
                                    data = '81080102'
                                    data_2 = `81080202`;
                                }else if(curtain_gang == '3_4'){
                                    data += '81080302'
                                    data_2 = `81080402`;
                                }
                            }else if(button_group.startsWith("DIMMING")){
                                data += `0502`;
                            }else{
                                data += `0${button_group.replace("ONOFF GANG","")*1}02`;
                            }
                            let cmd = [];
                            let lock_data = `8111${(button_group.startsWith("ONOFF GANG") ? parseInt("1".padEnd((button_group.replace("ONOFF GANG", "") * 1) + 1, "0"), 2).toString(16).pad("00") : 'FF')}00`;
                            cmd.push({action: 'connect'});
                            cmd.push({action: 'write',data: data});
                            if(data_2){
                                cmd.push({action: 'write',data: data_2});
                            }
                            if(data_3){
                                cmd.push({action: 'write',data: data_3});
                            }
                            if(button_group.startsWith("ONOFF GANG")){
                                cmd.push({action: 'write',data: lock_data});
                            }
                            return ha_process_periperal_cmd(Object.values(scanned_periperals).find(item=>item.guid == guid && item.advertising).id, cmd,true);
                            target_data = {
                                "virtual" : "",
                                "mapping" : "",
                            }
                        } else {
                            target_data = {
                                "virtual" : this_subdevice,
                                "mapping" : target_info.subdevice_name ,
                            };
                            if (!target_info) {
                                throw new Error("Invalid equipment!");
                            }

                            let gang = "01";
                            if (button_group.startsWith("ONOFF GANG")) {
                                let g = button_group.replace("ONOFF GANG", "") * 1;
                                if(device_model == 'YO845m' || device_model == "YO843m" || device_model == 'YO2086s-2GM'){
                                    if(g > 1){
                                        g = g - 1;
                                    }
                                }
                                gang = g.toString(16).pad("00");
                            } else if (button_group.startsWith("DIMMING")) {
                                gang = "05";
                            }else if(button_group.startsWith("OPENCLOSE GANG")){
                                let curtain_gang = button_group.replace("OPENCLOSE GANG","");
                                data_3 = '81080520';
                                if(curtain_gang == '1_2'){
                                    gang = '01';
                                    data_2 = `810802`
                                }else if(curtain_gang == '3_4'){
                                    gang = '03';
                                    data_2 = `810804`
                                }
                            }

                            data += gang;

                            let head = "02"; // FF
                            if (target_info.button_group.startsWith("DIMMING")) {
                                head = "";
                                data += "20";
                            }else if(target_info.button_group.startsWith("OPENCLOSE GANG")){
                                head = "";
                                data += "20";
                                data_2+= "20";
                            }

                            data += head;
                            let new_mac = mac.split("|")[1]
                            data += reverseStringByLittleEndian(new_mac.replace(/:/g, ""));
                            if(data_2){
                                data_2 += reverseStringByLittleEndian(new_mac.replace(/:/g, ""));
                            }
                            if(data_3){
                                data_3 += reverseStringByLittleEndian(new_mac.replace(/:/g, ""));
                            }
                            if (target_info.button_group.startsWith("DIMMING")) {
                                data += "2000";
                            }else if(target_info.button_group.startsWith("OPENCLOSE GANG")){
                                let target_gang = target_info.button_group.replace("OPENCLOSE GANG","");
                                data_3 += `2000`;
                                if(target_gang == "1_2"){
                                    data += "0200";
                                    data_2 += `0400`;
                                }else if(target_gang == "3_4"){
                                    data += "0800";
                                    data_2 += `1000`
                                }
                            } else {
                                data += "00";
                                
                                let target_gang = "01";
                                if (target_info.button_group.startsWith("ONOFF GANG")) {
                                    const g = target_info.button_group.replace("ONOFF GANG", "") * 1;
                                    target_gang = g.toString(16).pad("00");
                                }

                                data += target_gang;
                            }
                            if(target_info.button_group.startsWith("DIMMING")){
                                
                            }else if(target_info.button_group.startsWith("OPENCLOSE GANG")){

                            }else{
                                data += "00";
                            }
                            console.log(TAG, data);
                            let cmd = [];
                            cmd.push({action: 'connect'});
                            cmd.push({action: 'write',data: data });
                            if(data_2){
                                cmd.push({action: 'write',data: data_2 });
                            }
                            if(data_3){
                                cmd.push({action: 'write',data: data_3 });
                            }
                            if(device_model == 'YO845m' || device_model == "YO843m" || device_model == 'YO2086s-2GM'){
                                //fixed the two a bug;
                                let new_mac = mac.split("|")[1];
                                let g = button_group.replace("ONOFF GANG", "") * 1;
                                let target_gang = "01";
                                if (target_info.button_group.startsWith("ONOFF GANG")) {
                                    const g = target_info.button_group.replace("ONOFF GANG", "") * 1;
                                    target_gang = g.toString(16).pad("00");
                                }
                                if(g>2){
                                    cmd.push({action: 'write',data: `8108${g.toString(16).pad("00")}02${reverseStringByLittleEndian(new_mac.replace(/:/g, ""))}00${target_gang}00` });
                                    //cmd.push({action: 'write',data:'8111' + (button_group.startsWith("ONOFF GANG") ? parseInt("1".padEnd((button_group.replace("ONOFF GANG", "") * 1), "0"), 2).toString(16).pad("00") : 'FF')})
                                }
                            }
                            if(target_info.button_group.startsWith("DIMMING")){
                                
                            }else if(target_info.button_group.startsWith("OPENCLOSE GANG")){

                            }else{
                                cmd.push({action: 'write',data: '8111' + (button_group.startsWith("ONOFF GANG") ? parseInt("1".padEnd((button_group.replace("ONOFF GANG", "") * 1) + 1, "0"), 2).toString(16).pad("00") : 'FF')});
                            }
                            ha_process_periperal_cmd(Object.values(scanned_periperals).find(item=>item.guid == guid && item.advertising).id, cmd,true);
                            // return iot_ble_write(guid, "ff80", "ff81", data, false);
                        }
                    }).then(() => {
                        window.iot_update_profile_subdevice_config(this_subdevice,JSON.stringify(target_data));

                        return iot_device_setting_sync_server(guid, setting_type, mac);
                    }).then(() => {
                        params.obj.attr("setting-value", mac);
                        valueEl.html(mac);
                        update_setting_value();

                        app.preloader.hide();
                    }).catch((err) => {
                        app.preloader.hide();
                        if (!iot_ble_exception_message(err, false)) {
                            app.dialog.alert(err, runtime.appInfo.name);
                        }
                    });
                })
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_mode_setup_virtual_device_pairing_picker.open();
    });
}