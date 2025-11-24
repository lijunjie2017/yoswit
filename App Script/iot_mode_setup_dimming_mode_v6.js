window.iot_mode_setup_dimming_mode_picker = {};
window.iot_mode_setup_dimming_mode = function(params) {
    const TAG = ">>>> iot_mode_setup_dimming_mode_init";
    
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    const inputEl = params.obj.find("input[name=dimming_mode]");

    iot_mode_setup_dimming_mode_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: ["0-10v Dimming", "1-10v Dimming"],
                displayValues: [_("0-10v Dimming"), _("1-10v Dimming")]
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
                iot_mode_setup_dimming_mode_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", () => {
                    iot_mode_setup_dimming_mode_picker.close();

                    const selected = inputEl.val();
                    app.preloader.show();

                    iot_ble_check_enable()
                    .then(() => {
                        return iot_ble_do_pre_action(guid);
                    })
                    .then(() => {
                        let data = '';
                        if(selected == '0-10v Dimming'){
                            //判断是不是多路
                            if(button_group.includes("DIMMING2")){
                                data = `89070202`;
                            }else if(button_group.includes("DIMMING3")){
                                data = `8907020202`;
                            }else{
                                data = '890702';
                            }
                        }else{
                            if(button_group.includes("DIMMING2")){
                                data = `89070303`;
                            }else if(button_group.includes("DIMMING3")){
                                data = `8907030303`;
                            }else{
                                data = '890703';
                            }
                        }
                        if(button_group.startsWith("RCU")){
                            data = `971f${slot_index}${data}${data.substring(4,6)}`;
                        }
                        console.log("iot",data);
                        // ha_process_periperal_cmd(runtime.peripherals[guid].id, [
                        //   {
                        //     action: 'connect'
                        //   },
                        //   {
                        //     action: 'write',
                        //     data: data
                        //   }
                        // ]);
                        return iot_ble_write(guid, "ff80", "ff81", data, false);
                    }).then(() => {
                        return iot_device_setting_sync_server(guid, setting_type, selected);
                    }).then(() => {
                        params.obj.attr("setting-value", selected);
                        params.obj.find(".setting-value").html(_(selected));

                        app.preloader.hide();
                        iot_mode_setup_dimming_mode_picker.close();
                    }).catch((err) => {
                        app.preloader.hide();
                        iot_mode_setup_dimming_mode_picker.close();
                        if (!iot_ble_exception_message(err, false)) {
                                app.dialog.alert(err, runtime.appInfo.name);
                        }
                    })
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_mode_setup_dimming_mode_picker.open();
    });
}