window.iot_ble_change_virtual_button = ()=>{
    //send the mqtt command
    //input the virtual button id
    //input the button group
    //input the device
    app.dialog.prompt("Please input the virtual button id",(value)=>{
        let virtualButtonId = parseInt(value);
        let mac= `ae3f094aec24`;
        //let mac= `c63f094aec24`;
        let command = `02${mac}972103${virtualButtonId.toString(16).pad('00')}${'02'}`;
        let gatewayStr = `24:ec:4a:09:3f:ae-grace.zhao@yoswit.com`;
        //24:ec:4a:09:3f:c6-jack.li@yoswit.com
        //let gatewayStr = `24:ec:4a:09:3f:c6-jack.li@yoswit.com`;
        core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
          command:"Control",
          function:"bleHelper.perform",
          params:[{
            "action": "write",
            "guid": "3234656334613039336661651203461d",
            "mac_address": "24:ec:4a:09:3f:ae",
            "service_id": "ff80",
            "char_id": "ff81",
            "value": command
          }],
          callback:"",
          raw:""
        }, 0, false, false, false).then(()=>{
            app.dialog.alert("Change virtual button success");
        }).catch((error)=>{
            app.dialog.alert("Change virtual button failed");
        })
    })
}