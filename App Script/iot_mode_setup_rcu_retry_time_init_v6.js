window.iot_mode_setup_rcu_retry_time_picker = {};
window.iot_mode_setup_rcu_retry_time_init = function(params) {
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    let device_mode = params.obj.attr("device-mode");
    const inputEl = params.obj.find("input[name=rcu_retry_time]");
    const subdevice_name = params.obj.attr("subdevice-name");
    let status = true;//Multiway Switch have different formware
    let slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    iot_mode_setup_rcu_retry_time_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: [1,2,3,4,5]
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
                iot_mode_setup_rcu_retry_time_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", () => {
                    iot_mode_setup_rcu_retry_time_picker.close();
                    const selected = inputEl.val();
                    app.dialog.preloader();
                    iot_ble_check_enable()
                    .then(()=>{
                        let data = `9361000001${parseInt(selected).toString(16).pad("00")}`;
                        return window.peripheral[guid].write([{
                            service: 'ff80',
                            characteristic: 'ff81',
                            data: data,
                          },{
                            service: 'ff80',
                            characteristic: 'ff81',
                            data: `810e`,
                        }]);
                    })
                    .then(async() => {
                        return iot_device_setting_sync_server(guid, setting_type, selected);
                    }).then(() => {
                        app.dialog.close();
                    }).then(()=>{
                        params.obj.attr("setting-value", selected);
                        params.obj.find(".setting-value").html(_(selected));
                        app.dialog.alert(_('Save Successfully'));
                    }).catch((err) => {
                        app.dialog.close();
                        app.dialog.alert(erp.get_log_description(error)); 
                    });
                });
            }
        }
    });
    params.obj.find("#action-rcu-retry-time").on("click", () => {
        iot_mode_setup_rcu_retry_time_picker.open();
    });
}
// window.iot_mode_setup_rcu_retry_time_fun = () =>{
//     iot_mode_setup_rcu_retry_time_picker.open();
// }