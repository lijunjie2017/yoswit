window.core_gateway_refresh_peripherals = (topic, data) => {
    data = JSON.parse(data);
    //any case:1.gateway data; 2.mqtt data;
    //console.log("core_gateway_refresh_peripherals devices="+JSON.stringify(data.Device));
    //emitter.off('multiway_change_ref');
    let targetGateway = "";
    console.log("iot_ble_mobmob_way="+iot_ble_mobmob_way)
    $("li.device").each(function(){
        if(targetGateway=="" && isset($(this).attr('gateway'))){
            let gateway = $(this).attr('gateway').toLowerCase();
            
            if("status/"+md5(md5(gateway)) == topic){
                targetGateway = $(this).attr('gateway');
            }
        }
    });

    if(isset(data.Info)){
        const thisData = data.Info
        const guid = thisData.Guid;
        const hexid = guid.substring(guid.length - 6, guid.length - 2).toUpperCase();
        let mode = '';
        if(isset(erp.doctype.device_model[hexid])){
            mode = erp.doctype.device_model[hexid].mode;
        }
        const mac_address = thisData.mac_address?thisData.mac_address:'';
        let uuid = '';
        for(let i in scanned_periperals){
            if(scanned_periperals[i].guid == guid){
                uuid = i;
            }
        }
        if(mode == 'Thermostat'){
            console.log('Thermostat');
            console.log(data.Thermostat)
            const thermostatData = data.Thermostat;
            const thermostat_mode = thermostatData.mode;
            const power = thermostatData.power;
            const fan = thermostatData.fan;
            const temp = thermostatData.temp;
            const set_temp = thermostatData.set_temp;
            let this_date = new Date();
            //update Thermostat ui
            if(isset(scanned_periperals[uuid]) && isset(scanned_periperals[uuid]['manual'])){
                let scan_date = new Date(scanned_periperals[uuid]['manual']['Thermostat'].date);
                console.log(this_date.getTime());
                console.log(scan_date.getTime());
                if(this_date.getTime() > scan_date.getTime()){
                    scanned_periperals[uuid]['manual']['Thermostat'] = {
                        date: DateFormatter.format(this_date, "Y-m-d H:i:s"),
                        ref: power,
                        config : `${power}|${thermostat_mode}|${fan}|${set_temp}|${temp}`
                    };
                    controller_thermostat_refresh_status(guid, '', power,thermostat_mode,fan,set_temp,temp); 
                }
            }else{
                controller_thermostat_refresh_status(guid, '', power,thermostat_mode,fan,set_temp,temp); 
            }
            //{"power":1,"mode":0,"fan":4,"set_temp":25,"temp":27,
        }else if(mode == 'IAQ Sensor'){
            const iaqData = data.Sensor;
            console.log(iaqData);
            let list = [];
            //const voc_baseline = iaqData.voc_baseline;
            //const eco2_baseline = iaqData.eco2_baseline;
            const Temperature = parseInt(iaqData.temp?iaqData.temp:iaqData.temperature?iaqData.temperature:26);
            const Humidity = parseInt(iaqData.rh?iaqData.rh:iaqData.humidity?iaqData.humidity:0);
            const VOC =iaqData.voc?iaqData.voc:iaqData.VOC?iaqData.VOC:0;
            const CO2 = iaqData.eco2?iaqData.eco2:iaqData["CO2"]?iaqData["CO2"]:0;
            //const h2 = iaqData.h2;
            //const etoh = iaqData.etoh;
            const NOISE = (iaqData.db?iaqData.db:iaqData.noise?iaqData.noise:0).toFixed(1);
            const LUX = parseInt(iaqData.lux);
            const PM1 = iaqData.pm1.toFixed(1);
            const PM2_5 = iaqData['pm2.5'].toFixed(1);
            const PM4 = iaqData['pm4'].toFixed(1);
            const PM10 = iaqData['pm10'].toFixed(1);
            const PRESSURE = iaqData['pressure']?(iaqData['pressure']/1000).toFixed(1):'--';
            const HCHO = isset(iaqData['HCHO'])?iaqData['HCHO'].toFixed(1):'--';
            const O3 = isset(iaqData['O3'])?iaqData['O3'].toFixed(1):'--';
            const CO = isset(iaqData['CO'])?iaqData['CO'].toFixed(1):'--';
            const NOX = isset(iaqData['NOx'])?iaqData['NOx'].toFixed(1):'--';
            const score = iaqData['score'];
            list.push({type:"Temperature",value:Temperature},//
            {type:"Humidity",value:Humidity},//
            {type:"VOC",value:VOC},//
            {type:"CO2",value:CO2},//
            {type:"NOISE",value:NOISE},//
            {type:"LUX",value:LUX},//
            {type:"PM1",value:PM1},//
            {type:"PM2_5",value:PM2_5},
            {type:"PM4",value:PM4},
            {type:"PM10",value:PM10},
            {type:"NOX",value:NOX},
            {type:"PRESSURE",value:PRESSURE},
            {type:"HCHO",value:HCHO},
            {type:"O3",value:O3},
            {type:"CO",value:CO}
            )
            let score_data = window.iaq_evaluate_rule('score',score);
            $("li.device[guid='"+guid+"']").find(".iaq-button-score").css({'background-color':score_data.bgcolor})
            $("li.device[guid='"+guid+"']").find(".score").text(score);
            $("li.iaq-subdevice[guid='"+guid+"']").find(`.score`).hide();
            $("li.device[guid='"+guid+"']").find(".score-desc").text(score_data.levelname);
            for(let i in list){
                const this_data = iaq_evaluate_rule(list[i].type,list[i].value);
                if(isset(this_data)){
                    $("li.iaq-subdevice[guid='"+guid+"']").find(`.${list[i].type} .box-btn-img`).css({'background-color':this_data.bgcolor})
                }
                $("li.iaq-subdevice[guid='"+guid+"']").find(`.${list[i].type} .iaq-title-big`).text(list[i].value)
            }
            $("li.iaq-subdevice[guid='"+guid+"'] .main-btn").forEach((ele)=>{
                let this_value = $(ele).find(".iaq-title-big").text();
                if(this_value == '--'){
                    $(ele).hide()
                }
                if(this_value != '--'){
                    $(ele).show()
                }
              })
            //push mqtt
            setTimeout(()=>{
                let topic_self = `${mac_address}-${frappe.user.data.currentUsername}`
            core_mqtt_publish("cmd/"+md5(md5(topic_self.toLowerCase())), {
                "command":"Pubmsg",
                "function":"bleHelper.pubmsg",
                "params":"",
                "callback":"",
                "raw":""
            }, 0, false, false, false).then(() => {
                
            }).catch(reject=>{});
            },1000*60)
            //"voc_baseline":0,"eco2_baseline":0,"temp":0,"rh":0,"voc":0,"eco2":0,"h2":0,"etoh":0,"db":0,"lux":0,"pm1":0,"pm2.5":0,"pm4":0,"pm10":0,"score":0}
        }else if(mode == "Gateway"){
            const gatewayData = data.zigbee;
            for(let i in gatewayData){
                let mac = i;
                let status = gatewayData[i].status;
                if(status == 1){
                    $(`li.device[config="${mac}"]`).find(".right i").html("lock_open");
                }else{
                    $(`li.device[config="${mac}"]`).find(".right i").html("lock");
                }
                
            }
        }
    }
    let status_render = (manufacturing_data,gang)=>{
        if (typeof p.manufacturing_data === 'string') {
            let io = "00";
            if(p.manufacturing_data.startsWith("80")){
                io = p.manufacturing_data.substring(2);
            }else if(p.manufacturing_data.startsWith("85")){
                if(p.manufacturing_data.length==26){
                    io = p.manufacturing_data.substring(p.manufacturing_data.length-8, p.manufacturing_data.length-6);
                }else{
                    io = p.manufacturing_data.substring(p.manufacturing_data.length-4, p.manufacturing_data.length-2);
                }
            }else if(p.manufacturing_data.startsWith("8b")){
                io = p.manufacturing_data.substring(2,4);
            }
            
            let   gang1_status = parseInt(io, 16) & 0x02,
                    gang_status = parseInt(io, 16)
                    gang2_status = parseInt(io, 16) & 0x04,
                    gang3_status = parseInt(io, 16) & 0x08,
                    gang4_status = parseInt(io, 16) & 0x10;
            
            let default_connect = $("li.device[guid='"+guid+"']").attr("default-connect");
            if(isset(default_connect) && default_connect*1 == 1){
                gang1_status = parseInt(io, 16) & 0x01,
                gang2_status = parseInt(io, 16) & 0x02,
                gang3_status = parseInt(io, 16) & 0x04,
                gang4_status = parseInt(io, 16) & 0x08;
            }
            let return_gang = "";
            if(gang == 1){
                return_gang = gang1_status;
            }else if(gang == 2){
                return_gang = gang2_status;
            }else if(gang == 3){
                return_gang = gang3_status;
            }else if(gang == 4){
                return_gang = gang4_status;
            }
            return return_gang
        }
    };
    for(let guid in data.Device){
        const p = data.Device[guid];
        console.log(peripheral[guid].prop);
        let new_peripheral = peripheral[guid].prop;
        console.log("p: ",p);
        if(!isset(p.manufacturing_data)){
            continue;
        }
        if(isset(p.manufacturing_data.gang1_status) && !window.iot_ble_mobmob_way){
            // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG1", p.manufacturing_data.gang1_status, p.date);
            // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG2", p.manufacturing_data.gang2_status, p.date);
            // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG3", p.manufacturing_data.gang3_status, p.date);
            // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG4", p.manufacturing_data.gang4_status, p.date);
        }else{
            if (typeof p.manufacturing_data === 'string') {
                let io = "00";
                //if mode is thermostat
                if(isset(new_peripheral) && new_peripheral.device_mode == 'Thermostat'){
                    new_peripheral.manufactureData = p.manufacturing_data;
                    let data = p.manufacturing_data;
                    let thermostat = { 
						power: parseInt(data.substring(4,6), 16),
						model: parseInt(data.substring(6,8), 16),
						fan: parseInt(data.substring(8, 10), 16),
						temp: parseInt(data.substring(10, 12), 16),
                        room_temp: parseInt(data.substring(12,14), 16)
					}
                    console.log('thermostat',thermostat);
                    new_peripheral.status['mobmob'][0][42] = thermostat.power;
                    new_peripheral.status['mobmob'][0][43] = thermostat.model;
                    new_peripheral.status['mobmob'][0][44] = thermostat.fan;
                    new_peripheral.status['mobmob'][0][45] = thermostat.temp;
                    new_peripheral.status['mobmob'][0][46] = thermostat.room_temp;
                    new_peripheral.status['mobmob'][1] = p.date;
                    emitter.emit('on_peripheral_changed', new_peripheral);
                }
                if(p.manufacturing_data.startsWith("80")){
                    io = p.manufacturing_data.substring(2);
                }else if(p.manufacturing_data.startsWith("85")){
                    if(p.manufacturing_data.length==26){
                        io = p.manufacturing_data.substring(p.manufacturing_data.length-8, p.manufacturing_data.length-6);
                    }else{
                        io = p.manufacturing_data.substring(p.manufacturing_data.length-4, p.manufacturing_data.length-2);
                    }
                    //need to check randar status
                    if(erp.info.device[guid].mac_address.toLowerCase() == p.mac_address && erp.info.device[guid].device_mode == "RF Sensor"){
                        io = p.manufacturing_data.substring(p.manufacturing_data.length-4, p.manufacturing_data.length-2);
                        let sensor_ref = parseInt(io,16) & 0x10;
                        console.log('sensor_ref',sensor_ref);
                        if(sensor_ref > 1){
                            //have people;
                            $("li.device[guid='"+guid+"'] .rf-sensor i").html("directions_walk");
                          }else{
                            $("li.device[guid='"+guid+"'] .rf-sensor i").html("block");
                          }
                    }
                    //need to check IAQ 
                    if(erp.info.device[guid].mac_address.toLowerCase() == p.mac_address && erp.info.device[guid].device_mode == "IAQ Sensor"){
                        let iaqData = p.raw_data;
                        if(iaqData && iaqData.startsWith("9380")){
                            let rsList = window.iot_ble_iaq_change_list(iaqData);
                            console.log('rsList',rsList);
                            for(let i in rsList){
                                const str = rsList[i].hex;
                                const type = rsList[i].type;
                                const index = rsList[i].index;
                                let value = core_utils_ieee_float_convert(str);
                                const data = iaq_evaluate_rule(type);
                                console.log("value",value);
                                if(isset(data)){
                                    $("li.iaq-subdevice[guid='"+guid+"']").find(`.${type} .box-btn-img`).css({'background-color':data.bgcolor})
                                }
                                if(type == 'PRESSURE'){
                                    value = parseInt(value/1000);
                                }
                                if(type == 'LUX'){
                                    console.log("LUX value:"+value);
                                    value = parseInt(value*2.5);
                                    }
                                if(type == 'CO2'){
                                    let str1 = str.substring(0,2);
                                    let str2 = str.substring(2,4);
                                    let newstr = parseInt(str2,16)*255 + parseInt(str1,16)*1
                                    value = newstr
                                }
                                $("li.iaq-subdevice[guid='"+guid+"']").find(`.${type} .iaq-title-big`).text(value)
                            }
                            $("li.iaq-subdevice[guid='"+guid+"'] .main-btn").forEach((ele)=>{
                                let this_value = $(ele).find(".iaq-title-big").text();
                                if(this_value == '--'){
                                    $(ele).hide()
                                }
                                if(this_value != '--'){
                                    $(ele).show()
                                }
                            })
                    
                            const score = iaqData.substring(10,12);
                            let score_data = window.iaq_evaluate_rule('score',score);
                            $("li.iaq-subdevice[guid='"+guid+"']").find(".score .box-btn-img").css({'background-color':score_data.bgcolor})
                            $("li.iaq-subdevice[guid='"+guid+"']").find(".score .iaq-title-big").text(parseInt(score,16));
                        }
                    }
                }else if(p.manufacturing_data.startsWith("8b")){
                    io = p.manufacturing_data.substring(2,4);
                }
                console.log(io)
                let   gang1_status = parseInt(io, 16) & 0x02,
                        gang_status = parseInt(io, 16)
                        gang2_status = parseInt(io, 16) & 0x04,
                        gang3_status = parseInt(io, 16) & 0x08,
                        gang4_status = parseInt(io, 16) & 0x10;
                
                default_connect = $("li.device[guid='"+guid+"']").attr("default-connect");
                if(isset(default_connect) && default_connect*1 == 1){
                    gang1_status = parseInt(io, 16) & 0x01,
                    gang2_status = parseInt(io, 16) & 0x02,
                    gang3_status = parseInt(io, 16) & 0x04,
                    gang4_status = parseInt(io, 16) & 0x08;
                }
                console.log("gang_status"+gang_status)
                console.log("gang1_status"+gang1_status)
                console.log("gang2_status"+gang2_status)
                console.log("gang3_status"+gang3_status)
                console.log(guid)
                let now = new Date();
                now.setSeconds(now.getSeconds() + 10);
                now = DateFormatter.format(now, "Y-m-d H:i:s");
                let gateway_date = dayjs(p.date).toDate();
                //gateway_date.setSeconds(gateway_date.getSeconds() - 10);
                if(true){
                    const hexid = guid.substring(guid.length - 6, guid.length - 2).toUpperCase();
                    let mode = "";
                    if(!isset(Object.values(window.scanned_periperals).find((e)=>e.guid == guid))) return;
                    let this_uuid = Object.values(window.scanned_periperals).find((e)=>e.guid == guid).id;
                    if(!this_uuid) continue;
                    for(let i in erp.doctype.device_model){
                        if(i == hexid){
                            mode = erp.doctype.device_model[i].mode;
                            //compare the date and local date
                            try{
                                let mode_list = erp.doctype.device_model[`${hexid}`].device_default_template || [];
                                for(let j in mode_list){
                                    let btn = mode_list[j];
                                    if (btn.mode != erp.doctype.device_model[i].mode) continue;
                                    if(btn.device_button_group.startsWith("ONOFF GANG") && mode !="Multiway Switch"){
                                        let gang = btn.device_button_group.replace("ONOFF GANG","")*1;
                                        let this_ref = '';
                                        if(gang == 1){
                                            this_ref = gang1_status;
                                        }else if(gang == 2){
                                            this_ref = gang2_status;
                                        }else if(gang == 3){
                                            this_ref = gang3_status;
                                        }else if(gang == 4){
                                            this_ref = gang4_status;
                                        }
                                        console.log('ONOFF GANG'+gang)
                                        if(isset(window.scanned_periperals) && isset(window.scanned_periperals[this_uuid])){
                                            //if have the manual
                                            if(isset(window.scanned_periperals[this_uuid].manual) && isset(window.scanned_periperals[this_uuid].manual[`${gang}`])){
                                                let compare_data = dayjs(window.scanned_periperals[this_uuid].manual[`${gang}`]['date']).toDate().getTime();
                                                // console.log("gateway_date",gateway_date.getTime());
                                                // console.log("compare_data",compare_data);
                                                
                                                if(compare_data < gateway_date.getTime()){
                                                    //if the status don't change, don't push the mqtt
                                                    // if(scanned_periperals[this_uuid]['manual'][`${gang}`]['ref'] == (this_ref>0?1:0)){
                                                    //     scanned_periperals_proxy[this_uuid]['manual'][`${gang}`] = {
                                                    //         date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                    //         ref: this_ref>0?1:0,
                                                    //     };
                                                    // }
                                                    scanned_periperals[this_uuid]['manual'][`${gang}`]['date'] = DateFormatter.format(gateway_date, 'Y-m-d H:i:s');
                                                    scanned_periperals[this_uuid]['manual'][`${gang}`]['ref'] = this_ref>0?1:0;                                       
                                                    //$('.home-scanned-peripheral[uuid="'+this_uuid+'"][button_group="ONOFF GANG'+gang+'"]').find(".on_flag").attr('ref',this_ref);
                                                    //console.log($(`'.home-scanned-peripheral[uui="${this_uuid}"]'`).find(".on_flag"))
                                                    //emitter.off('On_Off_Gang_Gateway_status');
                                                    emitter.emit('On_Off_Gang_Gateway_status',{
                                                        uuid : this_uuid,
                                                        gang : gang,
                                                        ref : this_ref>0?1:0,
                                                        date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                    });
                                                }
                                            }else{
                                                if(!isset(window.scanned_periperals[this_uuid].manual)){
                                                    window.scanned_periperals[this_uuid].manual = {};
                                                }
                                                //scanned_periperals_proxy[this_uuid].manual = {};
                                                window.scanned_periperals[this_uuid].manual[`${gang}`] = {
                                                    date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                    ref: this_ref>0?1:0,
                                                }
                                                emitter.emit('On_Off_Gang_Gateway_status',{
                                                    uuid : this_uuid,
                                                    gang : gang,
                                                    ref : this_ref>0?1:0,
                                                    date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                });
                                                //$('.home-scanned-peripheral[uuid="'+this_uuid+'"][button_group="ONOFF GANG'+gang+'"]').find(".on_flag").attr('ref',this_ref);
                                                // scanned_periperals_proxy[this_uuid].manual[`${gang}`] = {
                                                //     date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                //     ref: this_ref>0?1:0,
                                                // }
                                            }
                                        }
                                    }else if(btn.device_button_group.startsWith("TOGGLE GANG")){
                                        
                                    }else if(mode == "On Off IR"){
                                        if(btn.device_button_group.startsWith("ONOFF GANG")){
                                            let gang = btn.device_button_group.replace("ONOFF GANG","")*1;
                                            if(isset(window.scanned_periperals) && isset(window.scanned_periperals[this_uuid])){
                                                //if have the manual
                                                if(isset(window.scanned_periperals[this_uuid].manual) && isset(window.scanned_periperals[this_uuid].manual[`${gang}`])){
                                                    let compare_data = dayjs(window.scanned_periperals[this_uuid].manual[`${gang}`]['date']).toDate().getTime();
                                                    // console.log("gateway_date",gateway_date.getTime());
                                                    // console.log("compare_data",compare_data);
                                                    if(compare_data < gateway_date.getTime()){
                                                        scanned_periperals[this_uuid]['manual'][`${gang}`] = {
                                                            date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                            ref: gang1_status>0?1:0,
                                                        };
                                                        if(scanned_periperals[this_uuid]['manual'][`${gang}`]['ref'] == (gang1_status>0?1:0)){
                                                            scanned_periperals_proxy[this_uuid]['manual'][`${gang}`] = {
                                                                date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                                ref: gang1_status>0?1:0,
                                                            };
                                                        }
                                                        //emitter.off('On_Off_Gang_Gateway_status');
                                                        emitter.emit('On_Off_Gang_Gateway_status',{
                                                            uuid : this_uuid,
                                                            gang : gang,
                                                            ref : gang1_status>0?1:0,
                                                            date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        });
                                                    }
                                                }else{
                                                    if(isset(window.scanned_periperals[this_uuid].manual)){
                                                        window.scanned_periperals[this_uuid].manual[`${gang}`] = {
                                                            date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                            ref: this_ref>0?1:0,
                                                        }
                                                        scanned_periperals_proxy[this_uuid].manual[`${gang}`] = {
                                                            date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                            ref: this_ref>0?1:0,
                                                        }
                                                    }else{
                                                        window.scanned_periperals[this_uuid].manual = {};
                                                        scanned_periperals_proxy[this_uuid].manual = {};
                                                        window.scanned_periperals[this_uuid].manual[`${gang}`] = {
                                                            date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                            ref: this_ref>0?1:0,
                                                        }
                                                        scanned_periperals_proxy[this_uuid].manual[`${gang}`] = {
                                                            date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                            ref: this_ref>0?1:0,
                                                        }
                                                    }
                                                    emitter.emit('On_Off_Gang_Gateway_status',{
                                                        uuid : this_uuid,
                                                        gang : gang,
                                                        ref : gang1_status>0?1:0,
                                                        date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                    });
                                                }
                                            }
                                        }
                                    }else if(mode == "Triac Dimming" || mode == "0-10v Dimming" || mode=="1-10v Dimming"){
                                        let gang = "dimming";
                                        if(isset(window.scanned_periperals) && isset(window.scanned_periperals[this_uuid])){
                                            //if have the manual
                                            if(isset(window.scanned_periperals[this_uuid].manual) && isset(window.scanned_periperals[this_uuid].manual[`${gang}`])){
                                                let compare_data = dayjs(window.scanned_periperals[this_uuid].manual[`${gang}`]['date']).toDate().getTime();
                                                // console.log("gateway_date",gateway_date.getTime());
                                                // console.log("compare_data",compare_data);
                                                if(compare_data < gateway_date.getTime()){
                                                    scanned_periperals[this_uuid]['manual'][`${gang}`] = {
                                                        date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang_status>0?1:0,
                                                        lastref : gang_status
                                                    };
                                                    // scanned_periperals_proxy[this_uuid]['manual'][`${gang}`] = {
                                                    //     date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                    //     ref: gang1_status>0?1:0,
                                                    //     lastref : gang_status
                                                    // };
                                                    //emitter.off('On_Off_Gang_Gateway_status');
                                                    emitter.emit('Dimming_Gateway_status',{
                                                        uuid : this_uuid,
                                                        gang : gang,
                                                        ref : gang_status>0?1:0,
                                                        lastref : gang_status,
                                                        date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                    });
                                                }
                                            }else{
                                                if(isset(window.scanned_periperals[this_uuid].manual)){
                                                    window.scanned_periperals[this_uuid].manual[`${gang}`] = {
                                                        date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang1_status>0?1:0,
                                                        lastref : gang_status
                                                    }
                                                    scanned_periperals_proxy[this_uuid].manual[`${gang}`] = {
                                                        date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang1_status>0?1:0,
                                                        lastref : gang_status
                                                    }
                                                }else{
                                                    window.scanned_periperals[this_uuid].manual = {};
                                                    scanned_periperals_proxy[this_uuid].manual = {};
                                                    window.scanned_periperals[this_uuid].manual[`${gang}`] = {
                                                        date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang1_status>0?1:0,
                                                        lastref : gang_status
                                                    }
                                                    scanned_periperals_proxy[this_uuid].manual[`${gang}`] = {
                                                        date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang1_status>0?1:0,
                                                        lastref : gang_status
                                                    }
                                                }
                                                emitter.emit('Dimming_Gateway_status',{
                                                    uuid : this_uuid,
                                                    gang : gang,
                                                    ref : gang_status>0?1:0,
                                                    lastref : gang_status,
                                                    date : DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                });
                                            }
                                        }
                                    }else if(mode == "Curtain Motor" || mode == "Curtain Motor Reverse"){
                                        let gang = "1";
                                        if(isset(window.scanned_periperals) && isset(window.scanned_periperals[this_uuid])){
                                            //if have the manual
                                            if(isset(window.scanned_periperals[this_uuid].manual) && isset(window.scanned_periperals[this_uuid].manual[`${gang}`])){
                                                let compare_data = dayjs(window.scanned_periperals[this_uuid].manual[`${gang}`]['date']).toDate().getTime();
                                                // console.log("gateway_date",gateway_date.getTime());
                                                // console.log("compare_data",compare_data);
                                                if(compare_data < gateway_date.getTime()){
                                                    scanned_periperals[this_uuid]['manual'][`${gang}`] = {
                                                        date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang_status,
                                                        img_info : gang_status>0?'open-curtain':'close-curtain',
                                                        curtain_status : gang_status>0?0:1,
                                                    };
                                                    emitter.emit('Motor_Gateway_status',{
                                                        uuid : this_uuid,
                                                        gang : 1,
                                                        date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang_status,
                                                        img_info : gang_status>0?'open-curtain':'close-curtain',
                                                        curtain_status : gang_status>0?0:1,
                                                    });
                                                }
                                            }else{
                                                if(isset(window.scanned_periperals[this_uuid].manual)){
                                                    window.scanned_periperals[this_uuid].manual[`${gang}`] = {
                                                        date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang_status,
                                                        img_info : gang_status>0?'open-curtain':'close-curtain',
                                                        curtain_status : gang_status>0?0:1,
                                                    }
                                                    scanned_periperals_proxy[this_uuid].manual[`${gang}`] = {
                                                        date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang_status,
                                                        img_info : gang_status>0?'open-curtain':'close-curtain',
                                                        curtain_status : gang_status>0?0:1,
                                                    }
                                                }else{
                                                    window.scanned_periperals[this_uuid].manual = {};
                                                    scanned_periperals_proxy[this_uuid].manual = {};
                                                    window.scanned_periperals[this_uuid].manual[`${gang}`] = {
                                                        date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang_status,
                                                        img_info : gang_status>0?'open-curtain':'close-curtain',
                                                        curtain_status : gang_status>0?0:1,
                                                    }
                                                    scanned_periperals_proxy[this_uuid].manual[`${gang}`] = {
                                                        date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                        ref: gang_status,
                                                        img_info : gang_status>0?'open-curtain':'close-curtain',
                                                        curtain_status : gang_status>0?0:1,
                                                    }
                                                }
                                                emitter.emit('Motor_Gateway_status',{
                                                    uuid : this_uuid,
                                                    gang : 1,
                                                    date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                                    ref: gang_status,
                                                    img_info : gang_status>0?'open-curtain':'close-curtain',
                                                    curtain_status : gang_status>0?0:1,
                                                });
                                            }
                                        }
                                    }else if(mode == "Multiway Switch"){
                                        let vertify_status =  parseInt(io, 16).toString(2);
                                        gang2_status = parseInt(io, 16) & 0x08;
                                        if(vertify_status.length>5){
                                            gang3_status = parseInt(io, 16) & 0x20;
                                        }
                                        if(isset(default_connect) && default_connect*1 == 1){
                                            gang1_status = parseInt(io, 16) & 0x01;
                                            gang2_status = parseInt(io, 16) & 0x04;
                                            gang3_status = parseInt(io, 16) & 0x10;
                                        }
                                        
                                        emitter.emit('multiway_change_ref',{
                                            gang1_status : gang1_status,
                                            gang2_status : gang2_status,
                                            gang3_status : gang3_status,
                                            guid : guid,
                                            date: DateFormatter.format(gateway_date, 'Y-m-d H:i:s'),
                                        })
                                    }
                                }
                            }catch(err){

                            }
                        }
                    }
                    continue;
                    let obj = window.scanned_periperals;
                    for(let i in obj){
                        if(obj[i].guid == guid){
                            let uuid = i;
                            let this_date = dayjs(obj[i].lastDiscoverDate || '1993-11-30 16:56:45').toDate().getTime();
                            console.log('gateway_date > this_date',gateway_date.getTime() > this_date)
                            if(gateway_date.getTime() > this_date){
                                //obj[i].lastDiscoverDate = DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s");
                                if(mode == "On Off Switch" || mode == "On Off IR"){
                                    // obj[i]["gang_status"]["ONOFF GANG1"].status = gang1_status>0?1:0;
                                    // obj[i]["gang_status"]["ONOFF GANG2"].status = gang2_status>0?1:0;
                                    // obj[i]["gang_status"]["ONOFF GANG3"].status = gang3_status>0?1:0;
                                    // obj[i]["gang_status"]["ONOFF GANG4"].status = gang4_status>0?1:0;
                                    if(!isset(scanned_periperals[uuid]['manual'])){
                                        scanned_periperals[uuid]['manual'] = {}
                                    }
                                    let this_date = new Date();
                                    scanned_periperals[uuid]['manual'][1] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang1_status>0?1:0
                                    };
                                    scanned_periperals[uuid]['manual'][2] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang2_status>0?1:0
                                    };
                                    scanned_periperals[uuid]['manual'][3] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang3_status>0?1:0
                                    };
                                    scanned_periperals[uuid]['manual'][4] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang4_status>0?1:0
                                    };
                                }else if(mode == "Triac Dimming" || mode == "0-10v Dimming" || mode=="1-10v Dimming"){
                                    //obj[i]["gang_status"]["dimming"].status = gang_status;
                                    scanned_periperals[uuid]['manual']['dimming'] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang_status>0?1:0
                                    };
                                }else if(mode == "Multiway Switch"){
                                    console.log("maudata",p.manufacturing_data);
                                    gang2_status = parseInt(io, 16) & 0x08;
                                    let io2 = parseInt(io, 16).toString(2);
                                    console.log("io2",io2)
                                    if(io2.length>5){
                                        gang3_status = parseInt(io, 16) & 0x20;
                                    }else if(isset(default_connect) && default_connect*1 != 1){
                                        gang3_status = parseInt(io, 16) & 0x08;
                                    }else if(isset(default_connect) && default_connect*1 == 1){
                                        gang1_status = parseInt(io, 16) & 0x01;
                                        gang2_status = parseInt(io, 16) & 0x02;
                                        gang3_status = parseInt(io, 16) & 0x04;
                                    }
                                    console.log('emitter.emit')
                                    emitter.emit('multiway_change_ref',{
                                        gang1_status : gang1_status,
                                        gang2_status : gang2_status,
                                        gang3_status : gang3_status,
                                        guid : guid
                                    })
                                    if(!isset(window.scanned_periperals[uuid])){
                                        window.scanned_periperals[uuid]= {};
                                    }
                                    if(!isset(scanned_periperals[uuid]['manual'])){
                                        window.scanned_periperals[uuid]['manual'] = {};
                                    }
                                    if(!isset(window.scanned_periperals[uuid]['manual'][1])){
                                        window.scanned_periperals[uuid]['manual'][1] = {};
                                    }
                                    window.scanned_periperals[uuid]['manual'][1] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang1_status>0?1:0
                                    };
                                    if(!isset(window.scanned_periperals[uuid]['manual'][2])){
                                        window.scanned_periperals[uuid]['manual'][2] = {};
                                    }
                                    window.scanned_periperals[uuid]['manual'][2] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang2_status>0?1:0
                                    };
                                    
                                    if(!isset(window.scanned_periperals[uuid]['manual'][3])){
                                        window.scanned_periperals[uuid]['manual'][3] = {};
                                    }
                                    window.scanned_periperals[uuid]['manual'][3] = {
                                        date: DateFormatter.format((new Date(p.date)), "Y-m-d H:i:s"),
                                        ref: gang3_status>0?1:0
                                    };
                                    
                                }
                                if(mode == "On Off Switch" || mode == "On Off IR"){
                                    $('ul li.home-scanned-peripheral[guid="'+guid+'"]').find('*[gang="1"]').attr('ref', gang1_status>0?1:0);
                                    $('ul li.home-scanned-peripheral[guid="'+guid+'"]').find('*[gang="2"]').attr('ref', gang2_status>0?1:0);
                                    $('ul li.home-scanned-peripheral[guid="'+guid+'"]').find('*[gang="3"]').attr('ref', gang3_status>0?1:0);
                                    $('ul li.home-scanned-peripheral[guid="'+guid+'"]').find('*[gang="4"]').attr('ref', gang4_status>0?1:0);
                                }else if(mode == "Multiway Switch"){
                                    /*the station is :
                                    1.no pairing.
                                    2.pairing other devices
                                    */
                                   
                                }else if(mode == "Triac Dimming" || mode == "0-10v Dimming" || mode=="1-10v Dimming"){
                                    iot_ble_set_ui_status_dimming(guid, "bluetooth", 'DIMMING', gang_status);
                                }
                            }
                            
                        }
                    }
                    
                    
                    // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG1", gang1_status, p.date);
                    // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG2", gang2_status, p.date);
                    // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG3", gang3_status, p.date);
                    // iot_ble_set_ui_status(guid, "bluetooth", "ONOFF GANG4", gang4_status, p.date);
                }
            }
        }
    }
    //window.iot_ble_mobmob_way = false
};