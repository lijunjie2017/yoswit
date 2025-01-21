window.iot_device_timer_form_checkout = function() {
    const TAG = ">>> iot_device_timer_checkout";

    const repeat_keys = ["repeat_monday", "repeat_tuesday", "repeat_wednesday", "repeat_thursday", "repeat_friday", "repeat_saturday", "repeat_sunday"].reverse();
    const formdata = app.form.convertToData('#frappe-form');
    console.log(TAG, formdata);

    const guid = formdata.guid;
    const timer_id = formdata.timer_id;
    const timer_max_num = parseInt(formdata.timer_max_num);
    // const mode = formdata.mode;
    const action = formdata.action;

    let repeat = "";
    if (formdata.repeat && formdata.repeat.length > 0) {
        repeat += formdata.repeat.findIndex((e) => e === repeat_keys[0]) !== -1 ? 1 : 0;
        repeat += formdata.repeat.findIndex((e) => e === repeat_keys[1]) !== -1 ? 1 : 0;
        repeat += formdata.repeat.findIndex((e) => e === repeat_keys[2]) !== -1 ? 1 : 0;
        repeat += formdata.repeat.findIndex((e) => e === repeat_keys[3]) !== -1 ? 1 : 0;
        repeat += formdata.repeat.findIndex((e) => e === repeat_keys[4]) !== -1 ? 1 : 0;
        repeat += formdata.repeat.findIndex((e) => e === repeat_keys[5]) !== -1 ? 1 : 0;
        repeat += formdata.repeat.findIndex((e) => e === repeat_keys[6]) !== -1 ? 1 : 0;
    } else {
        repeat = "000000"
    }

    //app.preloader.show();
    iot_ble_check_enable(() => {
        //return iot_ble_do_pre_action(formdata.guid);
        return window.peripheral[formdata.guid].connect();
    }).then(() => {
        //alert(123)
        return iot_ble_set_timer(guid, timer_id ? parseInt(timer_id) : null, formdata.button_group, formdata.date, formdata.time + ":00", repeat, 1, action, timer_max_num);
    }).then(() => {
        //app.preloader.hide();
        app.dialog.close();
        mainView.router.back();
        setTimeout(() => {
          app.ptr.refresh('.frappe-list-ptr-content');
        }, 200);
    }).catch((e) => {
        //app.preloader.hide();
        app.dialog.close();
        if ((e + "").startsWith("BLE Connection Error:")) {
            app.dialog.alert(_("Sorry, the device cannot be connected right now. Please come close to the device to continue the setup!"), runtime.appInfo.name, () => {
                mainView.router.back();
            });
        } else {
            app.dialog.alert(_(erp.get_log_description(e)));
        }
    });
}