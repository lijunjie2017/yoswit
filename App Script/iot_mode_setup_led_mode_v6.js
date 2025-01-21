window.iot_mode_setup_led_mode_picker = {};
window.iot_mode_setup_led_mode_auto_init = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");
    const button_group = params.obj.attr("button-group");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    console.log("led mode");
    const command = {
        "Reverse": "810A02",
        "Always On": "810A00",
        "Always Off": "810A01",
        "Sync": "810A03",
        "Radar Reverse": "810A82",
        "Radar Always On": "810A82",
        "Radar Sync": "810A82"
    };

    const inputEl = params.obj.find("input[name=led_mode]");

    iot_mode_setup_led_mode_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: Object.keys(command),
                displayValues: Object.keys(command).map((e) => _(e))
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
                iot_mode_setup_led_mode_picker.setValue([params.obj.attr("setting-value")]);

                $(picker.$el).find(".toolbar-save-link").on("click", () => {
                    iot_mode_setup_led_mode_picker.close();

                    const selected = inputEl.val() || "Reverse";

                    app.preloader.show();

                    iot_ble_check_enable()
                    .then(() => {
                        return window.peripheral[guid].connect();
                    })
                    .then(() => {
                        let data = command[selected];
                        if(button_group.startsWith("RCU")){
                            data = `971f${slot_index}${data}`;
                        }
                        if (data) {
                            let gang = 1;
                            if(button_group.startsWith("ONOFF GANG")){
                                gang = button_group.replace("ONOFF GANG","")*1;
                            }
                            //if the firmware is old
                            let firmware = window.peripheral[guid].prop.firmwareNo;
                            if(firmware > 12.0){
                                data = `${data}${parseInt(gang).toString(16).pad('00')}`;
                            }
                            return window.peripheral[guid].write([
                                {
                                  service: 'ff80',
                                  characteristic: 'ff81',
                                  data: data,
                                },
                              ]);
                            //return iot_ble_write(guid, "ff80", "ff81", data, false);
                        } else {
                            return Promise.reject(new Error("Unsupport option!"));
                        }
                    }).then(() => {
                        return iot_device_setting_sync_server(guid, setting_type+'_'+button_group, selected);
                    }).then(() => {
                        params.obj.attr("setting-value", selected);
                        params.obj.find(".setting-value").html(_(selected));

                        app.preloader.hide();
                    }).catch((err) => {
                        app.preloader.hide();
                        app.dialog.alert(_(erp.get_log_description(err)));
                    });

                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_mode_setup_led_mode_picker.open();
    });
}