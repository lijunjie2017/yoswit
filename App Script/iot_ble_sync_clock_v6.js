window.iot_ble_sync_clock = function(element) {
    const TAG = ">>>> iot_ble_sync_clock";
    const guid =  element;
    let data = "840001";
    
    const date = new Date();

    data += date.getSeconds().toString(16).pad("00");
    data += date.getMinutes().toString(16).pad("00");
    data += date.getHours().toString(16).pad("00");
    data += date.getDate().toString(16).pad("00");
    data += (date.getMonth() + 1).toString(16).pad("00");

    const hexYear = date.getFullYear().toString(16).pad("0000");
    const yearHigh = hexYear.substring(0, 2);
    const yearLow = hexYear.substring(2);
    data += (yearLow + yearHigh);

    console.log(TAG, data);
    app.dialog.preloader();
    return new Promise(async(resolve,reject)=>{
        try{
            let bleList = [];
            let service = 'ff80';
            let characteristic = 'ff81';
            await window.peripheral[guid].connect();
            let firmware = window.peripheral[guid].prop.firmwareNo;
            console.log("firmware",firmware);
            if(firmware < 6){
                service = 'fe00';
                characteristic = 'fe01';
                data = data.substring(6,data.length);
                if(firmware < 3.8){
                    bleList.push({
                        service: service,
                        characteristic: characteristic,
                        data: data,
                    })
                }
            }
            console.log("service",service);
            console.log("characteristic",characteristic);
            console.log("data",data);
            bleList.push({
                service: service,
                characteristic: characteristic,
                data: data,
            })
            await peripheral[guid].write(bleList);
            resolve(1)
        }catch(error){
            reject(error);
        }
    })
    
}