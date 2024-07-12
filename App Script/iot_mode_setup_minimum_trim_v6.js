window.iot_mode_setup_minimum_trim_init = function(params) {
    const guid = params.ref;
    let setting_type = params.obj.attr("setting-type");
    const button_group = params.obj.attr("button-group");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    params.obj.find("#action").on("click", () => {
        app.dialog.prompt(_('Please input Minimum Light Level (1-10)'), function(value) {
            if (/^\d+$/.test(value) && value * 1 >= 0 && value * 1 <= 10) {
                //let uuid = Object.values(scanned_periperals).find(item=>item.guid == guid).id;
                app.preloader.show();
                //change the value
                let valueList = [13,19,25,31,37,43,49,55,61];
                let postValue = valueList[parseInt(value) - 1];
                let data = "8905" + parseInt(postValue).toString(16).pad("00")+parseInt(postValue).toString(16).pad("00");
                if(button_group.startsWith("RCU")){
                    data = `971f${slot_index}${data}`;
                    setting_type = `${setting_type}_${slot_index}`
                }
                console.log("iot",data);
                // let cmd = [{"action":'connect'},{"action":'write',data : data}];
                // ha_process_periperal_cmd(uuid,cmd,true)
                return window.peripheral[guid].write([{
                    service: 'ff80',
                    characteristic: 'ff81',
                    data: data,
                }])
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