window.iot_mode_setup_change_mode_picker = {};
window.iot_mode_setup_change_mode_init = function(params) {
    const TAG = ">>>> iot_mode_setup_powerup_status_auto_init";
    console.log(TAG)
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const device_mode = params.obj.attr("device-mode");
    const inputEl = params.obj.find("input[name=change_mode]");
    const subdevice_name = params.obj.attr("subdevice-name");
    let p = Object.values(scanned_periperals).find(item=>item.guid == guid && item.advertising);
    let status = true;//Multiway Switch have different formware
    let firmware = scanned_periperals[p.id].firmware?scanned_periperals[p.id].firmware:'0';
    let slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
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
        valueList = ["Triac Dimming","0-10v Dimming"];
    }else if(device_mode.startsWith("RCU Controller")){
        valueList = ["RCU Controller"];
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
                                data: data,
                              }]);
                        }else if(selected == '0-10v Dimming'){
                            let data = `971f${slot_index}89070202`;
                            return window.peripheral[guid].write([{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: data,
                            }]);
                        }else{
                            return new Promise((solve)=>{
                                solve()
                            })
                        }
                    })
                    .then(() => {
                        let url = `/api/resource/Profile Subdevice/${subdevice_name}`;
                        let method = 'PUT';
                        let post_data = {
                            "device_mode": selected,
                        }
                        if(selected == 'Curtain Motor Ac' || selected == 'Curtain Motor'){
                            post_data['device_button_group'] = 'OPENCLOSE UART';
                        }else if(selected == 'Curtain Motor Reverse Ac' || selected == 'Curtain Motor Reverse'){
                            post_data['device_button_group'] = 'OPENCLOSE UART REVERSE';
                        }
                        return http.request(encodeURI(url), {
                            method: method,
                            serializer: 'json',
                            responseType: 'json',
                            data: post_data,
                            debug: true,
                        });
                    }).then(() => {
                        app.preloader.hide();
                        return ha_profile_ready();
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