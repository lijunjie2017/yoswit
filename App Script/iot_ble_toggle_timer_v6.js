window.iot_ble_toggle_timer = function(params) {
    const TAG = ">>> iot_ble_toggle_timer";
    
    const status = params.obj[0].checked ? 1 : 0;
    const guid = params.obj.attr("guid");
    const subdevice = params.obj.attr("subdevice");
    const timer_id = parseInt(params.obj.attr("timer-id"));
    const action = params.obj.attr("action");
    const button_group = params.obj.attr("button-group");
    const dateStr = params.obj.attr("date");
    const timeStr = params.obj.attr("time");
    const repeat_daily = params.obj.attr("repeat-daily");
    const repeat_monday = params.obj.attr("repeat-monday");
    const repeat_tuesday = params.obj.attr("repeat-tuesday");
    const repeat_wednesday = params.obj.attr("repeat-wednesday");
    const repeat_thursday = params.obj.attr("repeat-thursday");
    const repeat_friday = params.obj.attr("repeat-friday");
    const repeat_saturday = params.obj.attr("repeat-saturday");
    const repeat_sunday = params.obj.attr("repeat-sunday");

    //app.preloader.show();
    iot_ble_check_enable(() => {
        return window.peripheral[guid].connect();
    }).then(() => {
        let binaryRepeat = "";
        if (repeat_daily === "1") {
            binaryRepeat = "1111111";
        } else {
            binaryRepeat = repeat_sunday + repeat_saturday + repeat_friday + repeat_thursday + repeat_wednesday + repeat_tuesday + repeat_monday;
        }
        let mode_code = window.peripheral[guid]?window.peripheral[guid].prop.hexModel:'';
        if(mode_code == "021B"){
            ///mobile-app/timer-form-page?subdevice={{subdevice.name}}
            mainView.router.navigate(`/mobile-app/timer-form-page?subdevice=${subdevice}&timer_id=${timer_id}`);
        }else{
            return iot_ble_set_timer(guid, timer_id, button_group, dateStr, timeStr, binaryRepeat, status, parseInt(action));
        }
    }).then(() => {
        // nothing to do
        app.preloader.hide();
    }).catch((e) => {
        console.log(TAG, "error: " + e);
        app.preloader.hide();

        if ((e + "").startsWith("BLE Connection Error:")) {
            app.dialog.alert(_("Sorry, the device cannot be connected right now. Please come close to the device to continue the setup!"), runtime.appInfo.name, () => {
                mainView.router.back();
            });
        } else {
            app.dialog.alert(e, runtime.appInfo.name);
        }
    });
}