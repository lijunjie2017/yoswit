window.iot_ble_set_timer = function (guid, timer_id, button_group, dateStr, timeStr, binaryRepeat, status, action, max_timer = 8) {
    // repeat [0000000]
    const TAG = ">>> iot_ble_set_timer";
    window.device_timer_list = [];
    return iot_ble_sync_clock(guid,binaryRepeat).then(() => {
      return http.request(`/api/resource/Device/${guid}`, {
          method: "GET",
          responseType: "json"
      });
    }).then((rs) => {
      const server_timers = rs.data.data.device_timer;
      device_timer_list = server_timers;
      if (timer_id === undefined || timer_id === null) {
          const timers = (runtime.peripherals ? runtime.peripherals[guid] ? runtime.peripherals[guid].timers ? runtime.peripherals[guid].timers : [] : [] : []).concat(server_timers);
          const timer_map = new Map();

          for (let i = 0; i < timers.length; i++) {
              timer_map.set(timers[i].timer_id, timers[i]);
          }

          let next_create_timer_id = max_timer - 1;

          for (let i = 0; i < max_timer; i++) {
              if (!timer_map.get(i)) {
                  next_create_timer_id = i;
                  break;
              }
          }

          // or can not create?
          const t = server_timers.find((e) => e.timer_id === next_create_timer_id);

          return Promise.resolve({ new_timer_id: next_create_timer_id, timer_name: t ? t.name : null });
      } else {
          const t = server_timers.find((e) => e.timer_id === timer_id);

          return Promise.resolve({ new_timer_id: timer_id, timer_name: t ? t.name : null });
      }
  }).then((rs) => {
        let data = "840101";
        const dateParts = dateStr.split("-");
        const timeParts = timeStr.split(":");
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);

        // EVT PORT ss mm hh dd MM YY YY REPEAT DELAY_FLAG STATUS ACTION ACTION ACTION ACTION
        // 0   1    2  3  4  5  6  7  8  9      10         11     12     12     12     12
        //     01   00 2f 0e 0b 03 e7 07 00     00         01     00     00     00     00

        data += parseInt(rs.new_timer_id).toString(16).pad("00");

        let port = iot_ble_get_device_port(button_group);

        data += port.toString(16).pad("00");
        data += date.getSeconds().toString(16).pad("00");
        data += date.getMinutes().toString(16).pad("00");
        data += date.getHours().toString(16).pad("00");
        data += date.getDate().toString(16).pad("00");
        data += (date.getMonth() + 1).toString(16).pad("00");

        const hexYear = date.getFullYear().toString(16).pad("0000");
        // hexYear.match(/.{1,2}/g).reverse().join('');
        const yearHigh = hexYear.substring(0, 2);
        const yearLow = hexYear.substring(2);
        data += (yearLow + yearHigh);

        // binaryRepeat value like: 0000000
        // sun sat fri thur wed tues mon
        // 0   0   0   0    0   0    0

        data += parseInt(binaryRepeat.pad("00000000"), 2).toString(16).pad("00");
        // data += "00"; // delay
        // data += status.toString(16).pad("00");
        // data += parseInt(action).toString(16).pad("00");
        // // unuse action
        // data += "000000";
    
        
        
        return new Promise(async(resolve, reject) => {
            let bleList = [];
            let service = 'ff80';
            let characteristic = 'ff81';
            //check the firmware
            
            await window.peripheral[guid].connect();
            let firmware = window.peripheral[guid].prop.firmwareNo;
            console.log("firmware",firmware);
            if(firmware < 6){
                //check if repeat: fe02
                bleList.push({
                    service: service,
                    characteristic: 'fe02',
                    data: `${parseInt(rs.new_timer_id).toString(16).pad("00")}`,
                })
                
                
                service = 'fe00';
                characteristic = 'fe03';
                data = data.substring(6, data.length);
                data += parseInt(action).toString(16).pad("00");
                data += status.toString(16).pad("00");
                if(firmware < 3.8){
                    let dataList = data.match(/.{1,2}/g);
                    let repeat = binaryRepeat == '00000000'?false:true;
                    if(repeat){
                        //data is 00(id) 00(port) 00(getSeconds) 00(getMinutes) 00(getHours) 00(getDate) 00(getMonth) 00(yearLow) 00(yearHigh)
                        //change is 01 00 2d 0e ff ff ff ff 02000000
                        //          00 00 0f 0f ff ff ff ff 02000000
                        dataList[5] = "ff";
                        dataList[6] = "ff";
                        dataList[7] = "ff";
                        dataList[8] = "ff";
                    }
                    data = dataList[0]+dataList[2]+dataList[3]+dataList[4]+dataList[5]+dataList[6]+dataList[7]+dataList[8];
                    let this_action = status == 1?"02000000":"01000000";
                    data += this_action;
                    bleList.push({
                        service: service,
                        characteristic: characteristic,
                        data: data,
                    })
                    bleList.push({
                        service: `fe00`,
                        characteristic: `fe04`,
                        data: `${port.toString(16).pad("00")}`,
                    });
                    bleList.push({
                        service: `fe00`,
                        characteristic: `fe05`,
                        data: `${port.toString(16).pad("00")}ffffffff`,
                    })
                    bleList.push({
                        service: `fe00`,
                        characteristic: `fe06`,
                        data: `ff07`,
                    })
                }
            }else{
                data += "00"; // delay
                data += status.toString(16).pad("00");
                data += parseInt(action).toString(16).pad("00");
                // unuse action
                data += "000000";
                bleList.push({
                    service: service,
                    characteristic: characteristic,
                    data: data,
                })
            }
            console.log(TAG, data);
            console.log("service",service);
            console.log("characteristic",characteristic);
            console.log(bleList);
            // if(firmware < 3.8){
            //     try{
            //         for(let j in bleList){
            //             console.log("data",bleList[j].data);
            //             await ble.writeWithoutResponse(peripheral[guid].prop.id,bleList[j].service,bleList[j].characteristic,service,bleList[j].data.convertToBytes())
            //         }
            //         resolve(rs);
            //     }catch(error){
            //         reject(error);
            //     }
            // }else{
            //     window.peripheral[guid].write(bleList).then(() => {
            //         resolve(rs);
            //     }).catch(reject);
            // }
            window.peripheral[guid].write(bleList).then(() => {
                resolve(rs);
            }).catch(reject);
            // ble.writeWithoutResponse(peripheral[guid].prop.id,'fff0','fff2',`${'ff'}`.convertToBytes(),(res)=>{
            //     console.log(res)
            //     resolve(rs);
            // },(error)=>{
            //     console.log("error",error)
            //     reject(error);
            // })
        });
    }).then((rs) => {
        debugger
        let url = encodeURI("/api/resource/Device/"+guid);
        let method = "PUT";
        let device_timer = cloneDeep(device_timer_list);
        const repeat_keys = ["repeat_monday", "repeat_tuesday", "repeat_wednesday", "repeat_thursday", "repeat_friday", "repeat_saturday", "repeat_sunday"].reverse();

        const repeat = {};
        for (let i = 0; i < repeat_keys.length; i++) {
            repeat[repeat_keys[i]] = parseInt(binaryRepeat[i]);
        }
        if (rs.timer_name) {
            //url += rs.timer_name;
            device_timer.forEach(item=>{
                if(item.name == rs.timer_name){
                    item.date = dateStr;
                    item.time = timeStr;
                    item.action = action;
                    item.disabled = status === 0 ? 1 : 0;
                    item.repeat_daily = binaryRepeat === "1111111" ? 1 : 0;
                    item.repeat_sunday = repeat.repeat_sunday;
                    item.repeat_monday = repeat.repeat_monday;
                    item.repeat_tuesday = repeat.repeat_tuesday;
                    item.repeat_wednesday = repeat.repeat_wednesday;
                    item.repeat_thursday = repeat.repeat_thursday;
                    item.repeat_friday = repeat.repeat_friday;
                    item.repeat_saturday = repeat.repeat_saturday;
                }
            })
        }else{
            device_timer.push({
                device_button_group: button_group,
                timer_id: rs.new_timer_id,
                date: dateStr,
                time: timeStr,
                action: action,
                repeat_daily: binaryRepeat === "1111111" ? 1 : 0,
                ...repeat,
                disabled: status === 0 ? 1 : 0,
            })
        }

        
        
        return http.request(url, {
            method: method,
            serializer: "json",
            data: {
                device_timer : device_timer
            }
        });
    }).then(()=>{
        //set the erp setting
        return iot_device_setting_sync_server(guid, 'Set Time', "true")
    })
}