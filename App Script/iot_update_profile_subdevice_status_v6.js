window.iot_update_profile_subdevice_status = (subdevice,ref)=>{
    let TAG = "iot_update_profile_subdevice_status";
    //update status on profile subdevice
    http.request(encodeURI('/api/resource/Profile Subdevice/' + subdevice), {
        serializer: "json",
        responseType: "json",
        method: "PUT",
        data: {
            parenttype: "Profile",
            parentfield: "profile_subdevice",
            parent: erp.info.profile.name,
            status: ref
        }
    });
}

window.iot_update_profile_subdevice_config = (subdevice,config)=>{
    let TAG = "iot_update_profile_subdevice_config";
    let obj = JSON.parse(config)
    let upload_data = "";
    if(Object.getOwnPropertyNames(obj).length != 0){
        upload_data = config
    }
    return new Promise((resolve, reject)=>{
        http.request(encodeURI('/api/resource/Profile Subdevice/' + subdevice), {
            serializer: "json",
            responseType: "json",
            method: "GET",
            data: {}
        }).then((rs)=>{
            let data = rs.data.data;
            let config_data = {};
            console.log("data",data);
            // if(data.config){
            //     config_data = JSON.parse(data.config);
            //     if(isset(obj["virtual"]) && obj["virtual"] == ""){
            //         delete obj.virtual;
            //         delete config_data.virtual;
            //     }
            //     if(isset(obj["mapping"]) && obj["mapping"] == ""){
            //         config_data["mapping"] = "";
            //     }
            //     if(isset(obj["be_pairing"]) && obj["be_pairing"] == ""){
            //         config_data["be_pairing"] = "";
            //     }
            //     if(isset(obj["pairing_guid"]) && obj["pairing_guid"] == ""){
            //         config_data["pairing_guid"] = "";
            //     }
            //     //config_data = Object.assign(config_data,obj);
            //     upload_data = JSON.stringify(config_data)
            // }
            let subdevices = cloneDeep(erp.info.profile.profile_subdevice);
            subdevices.forEach(item=>{
                if(item.name == subdevice){
                    item.config = upload_data
                }
            })
            http.request(encodeURI('/api/resource/Profile/' + erp.info.profile.name), {
                serializer: "json",
                responseType: "json",
                method: "PUT",
                data: {
                    profile_subdevice : subdevices
                }
            }).then(()=>{
                resolve("success");
            })
        }).catch((error)=>{
            const toast = app.toast.create({
                position: 'bottom',
                closeTimeout: 3000,
                text: error,
              });
    
              toast.open();
              reject('error');
        })
    })
}

