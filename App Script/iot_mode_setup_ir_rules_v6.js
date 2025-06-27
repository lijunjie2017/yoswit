window.iot_mode_setup_ir_rule_picker = {};
window.iot_mode_setup_ir_rule_auto_init = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");
    const button_group = params.obj.attr("button-group");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    console.log("ir command");
    const command = ['Rule D','Rule E'];

    const inputEl = params.obj.find("input[name=led_mode]");

    iot_mode_setup_ir_rule_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: command,
                displayValues: command.map((e) => _(e))
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
                iot_mode_setup_ir_rule_picker.setValue([params.obj.attr("setting-value")]);

                $(picker.$el).find(".toolbar-save-link").on("click", () => {
                    iot_mode_setup_ir_rule_picker.close();

                    const selected = inputEl.val() || "Reverse";

                    app.preloader.show();

                    iot_ble_check_enable()
                    .then(() => {
                        return window.peripheral[guid].connect();
                    })
                    .then(() => {
                        let data = '812f00';
                        if(selected == 'Rule D'){
                            data = '812f00';
                        }else if(selected == 'Rule E'){
                            data = '812f01';
                        }
                        return window.peripheral[guid].write([
                            {
                              service: 'ff80',
                              characteristic: 'ff81',
                              data: data,
                            },
                          ]);
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
        iot_mode_setup_ir_rule_picker.open();
    });
}