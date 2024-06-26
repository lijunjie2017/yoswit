window.iot_active_rcu_output = async(element)=>{
    let guid = element.obj.attr('guid');
    let subdevice_name = element.obj.attr('subdevice-name');
    let device_button_group = '';
    let profile_subdevice = cloneDeep(erp.info.profile.profile_subdevice);
    profile_subdevice.forEach(item=>{
      if(item.name == subdevice_name){
        device_button_group = item.device_button_group;
      }
    })
    console.log(device_button_group);
    let gang = device_button_group.replaceAll("RCU OUTPUT",'')*1;
    if(gang == 33){
        gang = 98;
    }
    app.preloader.show();
    let data = `972001${gang.toString(16).pad("00")}02`;
    console.log(data)
    try{
      await window.peripheral[guid].write([{
        service: 'ff80',
        characteristic: 'ff81',
        data: data,
      }]);
      app.preloader.hide();
      app.dialog.alert(`Successfully sent command to Rcu Output ${gang}`);
    }catch(error){
      app.preloader.hide();
      app.dialog.alert(error);
    }
    
}