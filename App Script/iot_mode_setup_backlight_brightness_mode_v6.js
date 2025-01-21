window.iot_mode_setup_backlight_brightness_picker = {};
window.iot_mode_setup_backlight_brightness_mode_auto_init = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");
    const button_group = params.obj.attr("button-group");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    console.log("led mode");
    const command = {
        "0%": "00",
        "10%": "0a",
        "20%": "14",
        "30%": "1e",
        "40%": "28",
        "50%": "32",
        "60%": "3c",
        "70%": "46",
        "80%": "50",
        "90%": "5a",
        "100%": "64"
    };

    const inputEl = params.obj.find("input[name=backlight_brightness]");

    iot_mode_setup_backlight_brightness_picker = app.picker.create({
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
                iot_mode_setup_backlight_brightness_picker.setValue([params.obj.attr("setting-value")]);

                $(picker.$el).find(".toolbar-save-link").on("click", () => {
                    iot_mode_setup_backlight_brightness_picker.close();

                    const selected = inputEl.val();

                    app.preloader.show();

                    iot_ble_check_enable()
                    .then(() => {
                        return window.peripheral[guid].connect();
                    })
                    .then(() => {
                        let data = '';
                        if(button_group.startsWith("RCU")){
                            data = `971f${slot_index}${data}`;
                        }
                        if (selected) {
                            let gang = 1;
                            if(button_group.startsWith("ONOFF GANG")){
                                gang = button_group.replace("ONOFF GANG","")*1;
                            }
                            data = `8132${command[selected]}00`;
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
                        return iot_device_setting_sync_server(guid, setting_type, selected);
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
        iot_mode_setup_backlight_brightness_picker.open();
    });
}