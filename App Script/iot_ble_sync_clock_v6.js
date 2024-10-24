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
    return window.peripheral[guid].write([{
        service: 'ff80',
        characteristic: 'ff81',
        data: data,
    }])
    
}