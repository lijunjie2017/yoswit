window.iot_source_switching = async(element)=>{
    let guid = element.obj.attr('guid');
    app.preloader.show();
    let subdevice_name = element.obj.attr('subdevice-name');
    //defind the input
    try{
        let data = `9807`;
        window.peripheral[guid].write([{
          service: 'ff80',
          characteristic: 'ff81',
          data: data,
        }]).then(()=>{
          app.preloader.hide();
          app.dialog.alert(`Audio Source Switched Successfully`);
        })
    }catch(error){
      app.preloader.hide();
      app.dialog.alert(error);
    }
}