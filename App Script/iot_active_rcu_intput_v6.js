window.iot_active_rcu_intput = async(element)=>{
    let guid = element.obj.attr('guid');
    let subdevice_name = element.obj.attr('subdevice-name');
    let device_button_group = '';
    let profile_subdevice = cloneDeep(erp.info.profile.profile_subdevice);
    //defind the input
    app.dialog.prompt(`Input The Gang`,(value)=>{
      let data = `972001${parseInt(value).toString(16).pad("00")}01`;
      window.peripheral[guid].write([{
        service: 'ff80',
        characteristic: 'ff81',
        data: data,
      }]).then(()=>{
        app.dialog.alert(`Successfully sent command to Rcu Intput ${value}`);
      })
    });
}