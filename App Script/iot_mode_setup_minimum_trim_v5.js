window.iot_mode_setup_minimum_trim_init = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");

    params.obj.find("#action").on("click", () => {
        app.dialog.prompt(_('Please input Minimum Light Level (0-255)'), function(value) {
            if (/^\d+$/.test(value) && value * 1 >= 0 && value * 1 <= 255) {
                let uuid = Object.values(scanned_periperals).find(item=>item.guid == guid).id;
                app.preloader.show();
                const data = "8905" + value.toString(16).pad("00");
                let cmd = [{"action":'connect'},{"action":'write',data : data}];
                ha_process_periperal_cmd(uuid,cmd,true)
                .then(() => {
                    return iot_device_setting_sync_server(guid, setting_type, value);
                }).then(() => {
                    params.obj.attr("setting-value", value);
                    params.obj.find(".setting-value").html(_(value));

                    app.preloader.hide();
                }).catch((err) => {
                    app.preloader.hide();

                   if (!iot_ble_exception_message(err, false)) {
                        app.dialog.alert(err, runtime.appInfo.name);
                   }
                })
            }else{
                app.dialog.alert(_("Invalid value"));
            }
        });
    });
}