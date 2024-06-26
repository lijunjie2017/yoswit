window.iot_check_mac_error = async()=>{
    //check the erp data and the device data
    app.dialog.preloader();
    console.log("iot_check_mac_error");
    let devices = cloneDeep(erp.info.device);
    let profileDevices = cloneDeep(erp.info.profile.profile_device);
    let errorList = [];
    profileDevices.forEach(item=>{
      let profileDeviceMac = item.device_name;
      for(let j in devices){
          if(!isset(devices[j].mac_address))continue;
        let deviceMac = devices[j].mac_address.replace(/:/g, '').toLowerCase();
        if(deviceMac != profileDeviceMac && j == item.device){
          errorList.push(item);
          item.fixMac = deviceMac;
        }
      }
    })
    try{
      debugger
      for(let i in errorList){
        let url = `/api/resource/Profile%20Device/${encodeURI(errorList[i].name)}`;
        await http.request(url,{
          method: "PUT",
          dataType: 'json',
          serializer: "json",
          data:{
            device_name : errorList[i].fixMac
          },
          contentType:'application/json',
        });
      }
      app.dialog.close();
      app.dialog.alert('Update Successfully');
    }catch(error){
      app.dialog.close();
      app.dialog.alert(error);
    }
}