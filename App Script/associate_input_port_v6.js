window.associate_input_port = async(element)=>{
    let guid = element.obj.attr('guid');
    let subdevice_name = element.obj.attr('subdevice-name');
    let device_button_group = '';
    let profile_subdevice = cloneDeep(erp.info.profile.profile_subdevice);
    profile_subdevice.forEach(item=>{
      if(item.name == subdevice_name){
        device_button_group = item.device_button_group;
      }
    })
    //inupt the port of the randar
    app.dialog.prompt(_('Please input Minimum Light Level (1-10)'),function(value){

    })
    console.log(device_button_group);
    if(!device_button_group.startsWith("RCU OUTPUT") && !device_button_group.startsWith("DOOR SIGN")){
      app.dialog.alert(`This device is not an rcu output`);
      return
    }
    let gang = '';
    let gang_1 = 31;
    let gang_2 = 32;
    let commandList = [];
    if(device_button_group.startsWith("RCU OUTPUT")){
      gang = device_button_group.replaceAll("RCU OUTPUT",'')*1;
      if(gang == 33){
        gang = 98;
      }
      let data = `972001${gang.toString(16).pad("00")}02`;
      commandList = [{
        service: 'ff80',
        characteristic: 'ff81',
        data: data,
      }]
    }else if(device_button_group.startsWith("DOOR SIGN")){
      
      commandList = [{
        service: 'ff80',
        characteristic: 'ff81',
        data: `972001${gang_1.toString(16).pad("00")}02`,
      },{
        service: 'ff80',
        characteristic: 'ff81',
        data: `972001${gang_2.toString(16).pad("00")}02`,
      }]
    }
    
    app.preloader.show();
    try{
      await window.peripheral[guid].write(commandList);
      app.preloader.hide();
      if(device_button_group.startsWith("RCU OUTPUT")){
        app.dialog.alert(`Successfully sent command to Rcu Output ${gang}`);
      }else{
        app.dialog.alert(`Successfully sent command to Rcu Output ${gang_1},${gang_2}`);
      }
    }catch(error){
      app.preloader.hide();
      app.dialog.alert(_(erp.get_log_description(error)));
    }
    
}