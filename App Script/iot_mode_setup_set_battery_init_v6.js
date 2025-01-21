window.iot_mode_setup_set_battery_init = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");
    app.dialog.prompt(_("Please enter your numerical value.e.g(3500-4000)"), runtime.appInfo.name, async(value) => {
        const toast = app.toast.create({
            position: 'center',
            text : `Sending commands, please wait.`,
        });
        toast.open();
        let input_value = value.split('-');
        let post_value = '';
        if(input_value){
            input_value.map(e=>{
                post_value += iot_utils_to_little_endian_hex(e,2);
            })
        }
        try{
            let p = Object.values(window.scanned_periperals).find(e=>e.guid == guid);
            let cmd = [{"action":'connect'}];
            cmd.push({"action":'write',data:`93A2000004${post_value}`});
            await ha_process_periperal_cmd(p.id,cmd,true);
            toast.close();
            app.dialog.alert(_("Set successfully!"), runtime.appInfo.name);
        }catch(error){
            toast.close();
            app.dialog.alert(_(error))
        }
    },()=>{

    })
    return 
}