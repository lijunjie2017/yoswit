window.iot_reset_mesh = async(element)=>{
    let guid = element.obj.attr('guid');
    let subdevice_name = element.obj.attr('subdevice-name');
    app.preloader.show();
    try{
      let data = `931200000101`;
      await window.peripheral[guid].write([{
        service: 'ff80',
        characteristic: 'ff81',
        data: data,
      }]);
      app.preloader.hide();
      app.dialog.alert(`Successfully Reset Mesh`);
    }catch(error){
      app.dialog.alert(error);
    }
}