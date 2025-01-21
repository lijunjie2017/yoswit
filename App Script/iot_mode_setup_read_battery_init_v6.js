window.iot_mode_setup_read_battery_init = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");
    const toast = app.toast.create({
            position: 'center',
            text : `Sending commands, please wait.`,
        });
        toast.open();
        try{
            //let p = Object.values(window.scanned_periperals).find(e=>e.guid == guid);
            let p = window.peripheral[guid];
            let cmd = [{"action":'connect'}];
            ble.startNotification(
                p.prop.id,
                'ff80',
                'ff82',
                (rs)=>{
                    console.log(rs);
                    //tune the rs
                    let battery_level = rs.substring(10, 12);
                    let battery_voltage = rs.substring(12, 16);
                    if(rs.startsWith('93a1')){
                        toast.close();
                        app.dialog.alert(`Battery Level is: ${battery_level}  Battery Voltage is: ${iot_utils_from_little_endian_hex(battery_voltage)}`);
                        let setting_type = `Read Battery Voltage Threshold`;
                        let setting_value = `Battery Level is: ${battery_level}  Battery Voltage is: ${iot_utils_from_little_endian_hex(battery_voltage)}`;
                        iot_device_setting_sync_server(guid,setting_type,setting_value);
                        //update to local device setting
                        let list = erp.info.device[guid].settings;
                        //check if have differ value
                        let index = list.findIndex(e=>e.setting_type == setting_type);
                        if(index >= 0){
                            list[index].setting = setting_value;
                        }else{
                            list.push({
                                parent : guid,
                                parentfield : "settings",
                                parenttype : "Device",
                                setting:setting_value,
                                setting_type : setting_type
                            })
                        }
                        //update the device setting item value
                        params.obj.parent().parent().find('.setting-value').text(setting_value);
                        
                    }
                },
                (err)=>{
                    toast.close();
                    console.log(err);
                }
            )
            setTimeout(()=>{
                peripheral[guid].write([{
                    service: 'ff80',
                    characteristic: 'ff81',
                    data: `93A1`,
                }]);
                //ha_process_periperal_cmd(p.id,[{"action":'write',data:`93A1`}],true);
            },1000)
        }catch(error){
            toast.close();
            app.dialog.alert(_(erp.get_log_description(error)));
        }
}