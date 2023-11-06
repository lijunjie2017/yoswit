window.iot_mode_setup_admin_minimum_init = ()=>{
    let TAG = "iot_mode_setup_admin_minimum_init";
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");

    params.obj.find("#action").on("click", () => {
        app.dialog.prompt(_('Please input Minimum Light Level (0-255)'), function(value) {
            if (/^\d+$/.test(value) && value * 1 >= 0 && value * 1 <= 255) {

                app.preloader.show();

                iot_ble_check_enable()
                .then(() => {
                    return iot_ble_do_pre_action(guid);
                })
                .then(() => {
                    const data = "8905" + value.toString(16).pad("00");

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