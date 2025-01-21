window.iot_mode_setup_battery_notification_change = function(params) {
    const TAG = ">>>> iot_mode_setup_physical_switch_lock_change";

    const checked = params.obj.is(":checked");
    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const device_mode = params.obj.attr("device-mode");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    let p = window.peripheral[guid];
    app.preloader.show();

    iot_ble_check_enable()
    .then(() => {
        return window.peripheral[guid].connect();
    })
    .then(async() => {
        let sceneIdMap = await get_battery_threshold_scene_id("Geomagnetic Scene",guid);
        debugger
        let sceneId = sceneIdMap.id;
        if(sceneId){
            const status = checked ? "00" : "01";
            let data = `8f2f0000${parseInt(sceneId).toString(16).pad("00")}${status}`;
            return window.peripheral[guid].write([{
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
            }]);
        }else{
            return new Promise((resolve,reject)=>{
                reject("Battery threshold has not been set yet.");
            });
        }
    }).then((data) => {
        const setting = checked ? "On" : "Off";
        // params.obj.attr("setting-value", setting);
        $(".battery-notification").html(_(setting));
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