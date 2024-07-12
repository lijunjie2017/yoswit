window.iot_device_reset = function(params) {
    const guid = params.ref;
    const profile_device_name = params.obj.attr("profile-device-name");
    const profile_subdevice_name = params.obj.attr("profile-subdevice-name");

    app.dialog.confirm(_("Do you confirm to reset the device?"), runtime.appInfo.name, () => {
        app.dialog.preloader();
        setTimeout(()=>{
            app.dialog.close();
        },5*1000);
        window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: '8110',
        }])
        // .then(() => {
        //     return http.request(encodeURI('/api/resource/Profile Subdevice/' + profile_subdevice_name), {
        //         method: "DELETE",
        //         responseType: "json"
        //     });
        // }).then(() => {
        //     return http.request(encodeURI('/api/resource/Profile Device/' + profile_device_name), {
        //         method: "DELETE",
        //         responseType: "json"
        //     });
        // })
        .then(() => {
            // Device can not delete
            return http.request(encodeURI('/api/resource/Device/' + guid), {
                method: "PUT",
                responseType: "json",
                serializer: "json",
                data: {
                    data: {
                        settings: [],
                        device_timer: []
                    }
                }
            });
        })
        .then(()=>{
            erp.info.device[guid].settings = [];
            //delete the profile device and profile subdevice configuration
            let profile_subdevice = erp.info.profile.profile_subdevice;
            let profile_device_list = erp.info.profile.profile_device;
            let this_device = profile_device_list.find((item)=>item.name == profile_device_name);
            if(this_device.device_model === 'YO105'){
                let this_gateway = this_device.gateway;
                //delete the same gateway device
                profile_device_list.forEach(item=>{
                    if(item.gateway === this_gateway){
                        item.gateway = ''
                    }
                })
            }
            //delete the profile subdevice configuration
            profile_subdevice.forEach((item)=>{
                if(item.name === profile_subdevice_name){
                    item.config = ''
                }
            })
            return http.request(encodeURI(`/api/resource/Profile/${erp.info.profile.name}`), {
                method: "PUT",
                serializer: "json",
                responseType: "json",
                data: {
                    profile_device: profile_device_list,
                    profile_subdevice : profile_subdevice
                },
            });
        })
        .then(()=>{
            return window.peripheral[guid].disconnect();
        })
        .then(()=>{
            return ha_profile_ready();
        })
        .then(() => {
            app.dialog.close();
            // app.toast.show({
            //     text: _("Reset Successfully"),
            //     closeTimeout: 1500
            // });
            emitter.emit("device/reset", {
                guid: guid
            });
            app.dialog.alert(_("Reset Successfully"));
            //mainView.router.back();
        }).catch((err) => {
            app.dialog.close();

            if (!iot_ble_exception_message(err, false)) {
                app.dialog.alert(err, runtime.appInfo.name);
            }
        });
    }, () => {});
}