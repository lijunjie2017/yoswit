window.iot_create_rcu_output = async(element)=>{
    let guid = element.obj.attr('guid');
    let device_button_group = '';
    let profile_device = cloneDeep(erp.info.profile.profile_device);
    let deviceMap = {};
    profile_device.forEach(item=>{
      if(item.device == guid){
        deviceMap = item;
      }
    })
    app.dialog.login(`${_('Please enter the device name and output location you want to generate, within the range of 1-33.')}`,(username,password)=>{
      let pattern = /^(?:[1-9]|3[0-3])$/;
      if(username == ''){
        app.dialog.alert(_("Please input the device name"));
        return
      }
      if(!pattern.test(password)){
        app.dialog.alert(_("Within the range of 1-33"))
        return
      }
      app.dialog.preloader();
      let gang = (password*1);
      let postGang = (password*1).toString().pad('00');
      if(gang == 33){
        gang = 98;
      }
      let data = `972001${gang.toString(16).pad("00")}02`;
      try{
        window.peripheral[guid].write([{
          service: 'ff80',
          characteristic: 'ff81',
          data: data,
        }]).then(()=>{
          //post data to erp
          let subUrl = `/api/resource/Profile Subdevice`;
          let subMethod = 'POST';
          let post_data = {
            parenttype: 'Profile',
            parent: erp.info.profile.name,
            parentfield: 'profile_subdevice',
            profile_room: erp.info.profile.profile_room[0].name,
            profile_device: deviceMap.name,
            device: guid,
            title: username,
            device_button_group: `${'RCU OUTPUT'}${(password*1)}`,
            device_mode: 'RCU Controller',
            config: `${postGang}`,
          };
          return http2.request(encodeURI(subUrl), {
            method: subMethod,
            serializer: 'json',
            responseType: 'json',
            data: post_data,
            debug: true,
          });
        }).then(()=>{
          return ha_profile_ready()
        }).then(()=>{
          app.dialog.close();
          app.dialog.alert(`Successfully created RCU Output ${postGang}`);
        }).catch(error=>{
          app.dialog.close();
          app.dialog.alert(error);
        })
      }catch(error){
        app.dialog.close();
        app.dialog.alert(error);
      }
    },()=>{});
    setTimeout(()=>{
        $(`.dialog-input-field input[name="dialog-username"]`).attr('placeholder',_('Device Name'));
        $(`.dialog-input-field input[name="dialog-password"]`).attr('placeholder',_('Output Gang'));
    },0)
    
}