window.iot_mode_setup_powerup_status_picker = {};
window.iot_mode_setup_powerup_status_auto_init = function(params) {
    const TAG = ">>>> iot_mode_setup_powerup_status_auto_init";
    console.log(TAG)
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const device_mode = params.obj.attr("device-mode");
    const inputEl = params.obj.find("input[name=powerup_status]");
    let p = Object.values(scanned_periperals).find(item=>item.guid == guid && item.advertising);
    let status = true;//Multiway Switch have different formware
    let firmware = scanned_periperals[p.id].firmware?scanned_periperals[p.id].firmware:'0';
    let slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    if(device_mode == "Multiway Switch" && firmware.startsWith("10.")){
        status = false;
    }

    iot_mode_setup_powerup_status_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: ["On", "Off"],
                displayValues: [_("On"), _("Off")]
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
                iot_mode_setup_powerup_status_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", () => {
                    iot_mode_setup_powerup_status_picker.close();
                    const selected = inputEl.val();

                    app.preloader.show();
                    
                    iot_ble_check_enable()
                    .then(() => {
                        debugger
                        return iot_ble_do_pre_action(guid);
                    })
                    .then(() => {
                        debugger
                        let data = "810B";
                        if(device_mode == "Triac Dimming" || device_mode == "1-10v Dimming" || device_mode == "0-10v Dimming"){
                            data = "8908"
                        }
                        // All Gang 11110 -> 30 -> 1E
                        let gang = parseInt("11110", 2).toString(16).pad("00");
                        // gang 1 -> 2
                        // gang 2 -> 4
                        // gang 3 -> 8
                        // gang 4 -> 16
                        
                        if (button_group.startsWith("ONOFF GANG")) {
                            const g = button_group.replace("ONOFF GANG", "") * 1;
                            if(!status && g === 3){
                                gang = parseInt("1".padEnd(g, "0"), 2).toString(16).pad("00");
                            }else{
                                // 00010 00100 01000 10000
                                // 2     4     8     16
                                gang = parseInt("1".padEnd(g + 1, "0"), 2).toString(16).pad("00");
                            }
                        }else{
                            gang = "ffffffff"
                        }
                
                        data += gang;
                
                        if (selected === "Off") {
                            data += "00";
                        }
                        if(selected === "Off" && (device_mode == "Triac Dimming" || device_mode == "1-10v Dimming" || device_mode == "0-10v Dimming")){
                            data = '890800000000'
                        }
                        //check if rcu
                        if(button_group.startsWith("RCU")){
                            data = `971f${slot_index}${data}`;
                        }
                        console.log(TAG, data);
                        
                        return iot_ble_write(guid, "ff80", "ff81", data, false);
                        // ha_process_periperal_cmd(runtime.peripherals[guid].id, [
                        //   {
                        //     action: 'connect',
                        //   },
                        //   {
                        //     action: 'write',
                        //     data: data
                        //   }
                        // ]);
                    }).then(() => {
                        return iot_device_setting_sync_server(guid, setting_type, selected);
                    }).then(() => {
                        params.obj.attr("setting-value", selected);
                        params.obj.find(".setting-value").html(_(selected));

                        app.preloader.hide();
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
    params.obj.find("#action-powerup-status").on("click", () => {
        console.log(425)
        console.log(iot_mode_setup_powerup_status_picker);
        iot_mode_setup_powerup_status_picker.open();
    });
}