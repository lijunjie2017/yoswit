window.iot_mode_setup_server_uri = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");

    app.dialog.prompt(_("Enter server uri (e.g. mqtt://test.com)"), runtime.appInfo.name, (mqtt_uri) => {

        app.preloader.show();

        iot_ble_check_enable()
        .then(() => {
            return window.peripheral[guid].connect();
        })
        .then(()=>{
            if(deviceInfo.operatingSystem != 'ios'){
                return new Promise((resolve)=>{
                    ble.requestMtu(
                        peripheral[guid].prop.id,
                        512,
                        ()=>{
                            console.log('requestMtu success');
                            resolve();
                        },
                        ()=>{
                            console.log('requestMtu error');
                            resolve();
                        },
                    )
                });
            }else{
                return new Promise((resolve)=>{
                    resolve();
                });
            }
        })
        .then(() => {
            
            const data = "930000" + (mqtt_uri.length.toString(16).pad("0000")) + mqtt_uri.convertToHex();
            console.log(data);

            // ha_process_periperal_cmd(runtime.peripherals[guid].id, [
            //   {
            //     action: 'connect'
            //   },
            //   {
            //     action: 'write',
            //     data: data
            //   }
            // ]);
            //return iot_ble_write(guid, "ff80", "ff81", data, false);
            window.peripheral[guid].write([
              {
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
              },
            ]);
        }).then(() => {
            params.obj.closest('.card-content').find(".setting-value").html(_(mqtt_uri));
            return iot_device_setting_sync_server(guid, setting_type, mqtt_uri || "null");
        }).then(() => {
            app.preloader.hide();
            window.globalUpdate = true;
        }).catch((err) => {
            app.preloader.hide();

           if (!iot_ble_exception_message(err, false) && !core_server_exception_message(err)) {
                app.dialog.alert(err);
           }
        })

    }, () => {}, "mqtt://" + erp.settings[erp.appId].mqtt_server);
}