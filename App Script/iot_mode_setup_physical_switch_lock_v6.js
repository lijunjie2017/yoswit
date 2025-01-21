window.iot_mode_setup_physical_switch_lock_change = function(params) {
    const TAG = ">>>> iot_mode_setup_physical_switch_lock_change";

    const checked = params.obj.is(":checked");
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const device_mode = params.obj.attr("device-mode");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    //let p = Object.values(scanned_periperals).find(item=>item.guid == guid && item.advertising);
    let p = window.peripheral[guid];
    let status = true;//Multiway Switch have different formware
    let firmware = p.prop.firmware?p.prop.firmware:0;
    if(device_mode == "Multiway Switch" && firmware<10.0){
        status = false;
    }
    app.preloader.show();

    iot_ble_check_enable()
    .then(() => {
        return window.peripheral[guid].connect();
    })
    .then(() => {
        let data = "8111";

        // All Gang 11110 -> 30 -> 1E
        let gang = "FF";
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
        }

        data += gang;

        if (!checked) {
            data += "00";
        }
        if(button_group.startsWith("RCU")){
            data = `971f${slot_index}${data}`;
        }
        console.log(TAG, data);

        // ha_process_periperal_cmd(runtime.peripherals[guid].id, [
        //   {
        //     action: 'connect'
        //   },
        //   {
        //     action: 'write',
        //     data: data
        //   }
        // ]);
        return window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
        }]);
    }).then((data) => {
        const setting = checked ? "On" : "Off";
        return iot_device_setting_sync_server(guid, setting_type, setting);
    }).then(() => {
        app.preloader.hide();
    }).catch((err) => {
        app.preloader.hide();
        app.dialog.alert(_(erp.get_log_description(err)));
        // if (!iot_ble_exception_message(err, false)) {
        //     app.dialog.alert(err, runtime.appInfo.name);
        // }
    });
}