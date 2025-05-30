window.ble_delete_itinerary = async(element)=>{
    const guid = element.obj.attr("ref");

    let command = `860255fefe03073926`;
    let restart_command = `810e`;

    try{
        app.dialog.preloader();
        let bleList = [];
        bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: command,
        });
        bleList.push({
            service: 'ff80',
            characteristic: 'ff81',
            data: restart_command,
        });
        await window.peripheral[guid].write(bleList);
        app.dialog.close();
        app.dialog.alert(_('Delete Itinerary Success!'));
    }catch(error){
        app.dialog.close();
        app.dialog.alert(_(erp.get_log_description(error)));
    }
}