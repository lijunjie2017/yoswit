window.iot_device_restart = function(params) {
    const guid = params.ref;
    let reconnectCount = 0;
    app.dialog.confirm(_("Do you confirm to restart the device?"), runtime.appInfo.name, () => {
        app.dialog.preloader();
        setTimeout(()=>{
            app.dialog.close();
        },5*1000);
        const restartFun = async()=>{
            try{
                await window.peripheral[guid].write([{
                    service: 'ff80',
                    characteristic: 'ff81',
                    data: '810e',
                }])
                await window.peripheral[guid].disconnect();
                app.dialog.close();
                app.dialog.alert(_("Restart Successfully"));
            }catch(error){
                console.log(error);
                app.dialog.close();
                // reconnectCount++;
                // if(reconnectCount == 3){
                //     app.dialog.alert(error);
                // }else{
                //     restartFun();
                // }
            }
        }
        restartFun();
        // iot_ble_check_enable().then(() => {
        //     return iot_ble_do_pre_action(guid);
        // }).then(() => {
        //     return iot_ble_write(guid, "ff80", "ff81", "810E");
        // }).then(() => {
        //     app.preloader.hide();

        //     app.toast.show({
        //         text: _("Restart Successfully"),
        //         closeTimeout: 1500
        //     });

        //     mainView.router.back();
        // }).catch((err) => {
        //     app.preloader.hide();

        //     if (!iot_ble_exception_message(err, false)) {
        //        app.dialog.alert(err, runtime.appInfo.name);
        //     }
        // });
    }), () => {
        // ignore
    };
}