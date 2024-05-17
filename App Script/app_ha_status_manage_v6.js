window.standard_status = {};
window.app_ha_status_manage = async(peripheral)=>{
    const TAG = "app_ha_status_manage";
    /*
    1.create a status object for manage the best new status.
    2.only compare 2 object to sure the best new status.
    3.compare the best new status to the status object
    4.setting local db to save the best new status
    */
   //load local data
   if(!isset(peripheral)){
    let local_status = await window.db.get("local_scanned_periperals");
    if(local_status){
        let data = JSON.parse(local_status);
        for(let i in data){
            standard_status[i] = data[i];
        }
    }
   }
   let mode = isset(window.device_models[peripheral.hexModel])?window.device_models[peripheral.hexModel].mode:"";
   let name = isset(window.device_models[peripheral.hexModel])?window.device_models[peripheral.hexModel].name:"";
   if(!isset(standard_status[peripheral.id])){
    if(!isset(window.device_models[peripheral.hexModel])){
        return
    }
    standard_status[peripheral.id] = {
        hexModel : peripheral.hexModel,
        mode : mode,
        model : name,
        uuid : peripheral.id,
        guid : peripheral.guid,
        date : peripheral.lastDiscoverDate,
        upload_date : "",
        gang_status:{
            
        }
    }
    let default_template = window.device_models[peripheral.hexModel].default_template;
    for(let i in default_template){
        let manufactureData = isset(peripheral.manufactureData) ? peripheral.manufactureData : "000000000000000000";
        let ref = 0;
        let gang = isset(default_template[i].gang)?default_template[i].gang:1;
        
        if(gang == 'dimming'){
            ref = manufactureData.substring(4, 6) == '00' ? '0' : '1';
        }else if(gang == "thermostat"){
            ref = parseInt(manufactureData.substring(4, 6),16)
        }else if(mode == 'IAQ Sensor'){
            ref = parseInt(manufactureData.substring(4, 6),16)
        }else if(mode == "On Off IR"){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x02;
        }else if(gang*1==1){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x02;
        }else if(gang*1==2){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x04;
        }else if(gang*1==3){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x08;
        }else if(gang*1==4){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x10;
        }
        standard_status[peripheral.id]["gang_status"][i] = {
            status : ref>0?1:0
        }
    }
   }else{
    let default_template = window.device_models[peripheral.hexModel].default_template;
    for(let i in default_template){
        let manufactureData = isset(peripheral.manufactureData) ? peripheral.manufactureData : "000000000000000000";
        let ref = 0;
        let gang = isset(default_template[i].gang)?default_template[i].gang:1;
        
        if(gang == 'dimming'){
            ref = manufactureData.substring(4, 6) == '00' ? '0' : '1';
        }else if(gang == "thermostat"){
            ref = parseInt(manufactureData.substring(4, 6),16)
        }else if(mode == 'IAQ Sensor'){
            ref = parseInt(manufactureData.substring(4, 6),16)
        }else if(mode == "On Off IR"){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x02;
        }else if(gang*1==1){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x02;
        }else if(gang*1==2){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x04;
        }else if(gang*1==3){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x08;
        }else if(gang*1==4){
            ref = parseInt(manufactureData.substring(16, 18), 16) & 0x10;
        }
        let this_date = standard_status[peripheral.id]["gang_status"][i]["date"];
        if( dayjs(peripheral.lastDiscoverDate).toDate().getTime() > dayjs(this_date).toDate().getTime()){
            standard_status[peripheral.id]["gang_status"][i] = {
                status : ref>0?1:0
            }
        }
    }
   }
   //runtime.standard_status = {};
}
//device startNotification listener
window.iot_emitter_device = ()=>{
    emitter.on("startNotification", (data)=>{
        console.log(data)
        let rs = data.rs;
        let guid = data.guid;
        let gang_status_render = (self_guid,button_group,status)=>{
            let obj = window.standard_status;
            for(let i in obj){
                if(self_guid == obj[i].guid){
                    let ld = dayjs(obj[i].date).toDate().getTime();
                    let now = new Date();
                    now.setSeconds(now.getSeconds() - 10);
                    if(now.getTime() > ld){
                        obj[i].date = DateFormatter.format((new Date()), "Y-m-d H:i:s");
                        if(isset(obj[i]["gang_status"][button_group])){
                            obj[i]["gang_status"][button_group].status = status;
                        }
                        
                    }
                }
            }
        };
        let status_list = ['e1','e3','ed','e5','e7','e9','eb','ef','f1','f3','f7','f9','fd','fb','ff'];
        if(status_list.indexOf(rs) != -1){
            let io = parseInt(rs, 16).toString(2);
            let gang1_status = io & 0x02;
            let gang2_status = io.substring(5,6);
            let gang3_status = io.substring(4,5);
            let gang4_status = io.substring(3,4);
            let this_date = new Date();
            let uuid = '';
            console.log('gang3_status',gang3_status)
            for(let i in scanned_periperals){
                if(scanned_periperals[i].guid == guid){
                    uuid = i;
                }
            }
            if(isset(scanned_periperals[uuid]['manual'][1]) && new Date(scanned_periperals[uuid]['manual'][1].date) < this_date){
                scanned_periperals[uuid]['manual'][1] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang1_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').find('.on_flag').attr('ref',gang1_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG1",gang1_status>0?1:0);
                }
            }else if(!isset(scanned_periperals[uuid]['manual'][1])){
                scanned_periperals[uuid]['manual'][1] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang1_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').find('.on_flag').attr('ref',gang1_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG1",gang1_status>0?1:0);
                }
            }
            if(isset(scanned_periperals[uuid]['manual'][2]) && new Date(scanned_periperals[uuid]['manual'][2].date) < this_date){
                scanned_periperals[uuid]['manual'][2] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang2_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').find('.on_flag').attr('ref',gang2_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG2",gang2_status>0?1:0);
                }
            }else if(!isset(scanned_periperals[uuid]['manual'][2])){
                scanned_periperals[uuid]['manual'][2] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang2_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').find('.on_flag').attr('ref',gang2_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG2",gang2_status>0?1:0);
                }
            }
            if(isset(scanned_periperals[uuid]['manual'][3]) && new Date(scanned_periperals[uuid]['manual'][3].date) < this_date){
                scanned_periperals[uuid]['manual'][3] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang3_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').find('.on_flag').attr('ref',gang3_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG3",gang3_status>0?1:0);
                }
            }else if(!isset(scanned_periperals[uuid]['manual'][3])){
                scanned_periperals[uuid]['manual'][3] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang3_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').find('.on_flag').attr('ref',gang3_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG3",gang3_status>0?1:0);
                }
            }
            if(isset(scanned_periperals[uuid]['manual'][4]) && new Date(scanned_periperals[uuid]['manual'][4].date) < this_date){
                scanned_periperals[uuid]['manual'][4] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang4_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').find('.on_flag').attr('ref',gang4_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG4",gang4_status>0?1:0);
                }
            }else if(!isset(scanned_periperals[uuid]['manual'][4])){
                scanned_periperals[uuid]['manual'][4] = {
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                    ref: gang4_status>0?1:0
                };
                if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').attr('onoff_ref'))){
                    $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').find('.on_flag').attr('ref',gang4_status>0?1:0);
                    gang_status_render(guid,"ONOFF GANG3",gang4_status>0?1:0);
                }
            }
        }else if(rs.startsWith("8b")){
            //find the mode of the device
            let mode = $(`.home-scanned-peripheral[guid="${guid}"]`).attr('mode');
            let uuid = $(`.home-scanned-peripheral[guid="${guid}"]`).attr('uuid');
            console.log(mode);
            if(mode == 'Curtain Motor' || mode == 'Curtain Motor Ac' || mode == 'Curtain Motor Reverse'){
                let io = parseInt(rs.substring(2,4), 16);
                let status = io;
                if(mode == 'Curtain Motor Reverse'){
                    status = 100 - parseInt(io);
                }
                console.log("status",status);
                //update the time
                let currentDate = new Date();
                let compare_data = dayjs(window.scanned_periperals[uuid].manual[`1`]['date']).toDate().getTime();
                if(compare_data < currentDate.getTime()){
                    window.scanned_periperals[uuid].manual[1] = {
                        date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                        ref: status,
                        img_info : status>0 ? 'open-curtain' : 'close-curtain',
                        curtain_status : status>0?0:1,
                    }
                    //due to the notify have delay,can not set the superior status
                    if(status>0){
                        $(`.home-scanned-peripheral[guid="${guid}"]`).find(".control-panel-right").find(".op").parent().attr("ref",0)
                    }else{
                        $(`.home-scanned-peripheral[guid="${guid}"]`).find(".control-panel-right").find(".op").parent().attr("ref",1);
                    }
                    iot_ble_set_ui_status_curtain(guid,status);
                }
            }else{
                let img_url = erp.setting.app_api_url+'/files/';
                if(rs.startsWith( "8b00") && rs.length == 4){
                    $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".material-icons").text("sensor_door")
                    $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".button img").attr('src',img_url+'door_close.svg')
                    $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".on_flag").attr("ref",0)
                }else if(rs.length == 4){
                    $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".on_flag").attr("ref",1)
                    $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".material-icons").text("open_in_full")
                    $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".button img").attr('src',img_url+'door_open.svg')
                }
            }
            let status = parseInt(rs.substring(2,4), 16);
            //$("li.device[guid='"+gguid+"']").find(".control-panel-right").find(".on_flag").attr("ref",status)
            gang_status_render(guid,"DIMMING",status)
            for(let i in scanned_periperals){
                if(scanned_periperals[i].guid == guid){
                    if(!isset(scanned_periperals[i]['manual'])){
                        scanned_periperals[i]['manual'] = {}
                    }
                    let this_date = new Date();
                    if(isset(scanned_periperals[i]['manual']['dimming'] ) && new Date(scanned_periperals[i]['manual']['dimming'].date) < this_date){
                        scanned_periperals[i]['manual']['dimming'] = {
                            date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                            ref: status>0?1:0,
                            lastref : status
                        };
                        iot_ble_set_ui_status_dimming(guid, "bluetooth", 'DIMMING', status);
                    }
                }
            }
        }else if(rs.startsWith("80")){
            //defalut ON OFF and the Mutiway ON OFF have defferent status
            let device_mode = 'On Off Switch';
            let p = Object.values(scanned_periperals).find(item=>item.guid == guid && item.advertising);
            let hexid = p.hexModel.toUpperCase();
            for(let i in erp.doctype.device_model){
                if(hexid == i){
                    device_mode = erp.doctype.device_model[i].mode;
                }
            }
            let io = parseInt(rs.substring(2,4), 16);
            let gang1_status = io & 0x01;
            let gang2_status = io & 0x02;
            let gang3_status = io & 0x04;
            console.log('device_mode',device_mode)
            if(device_mode == 'Multiway Switch'){
                gang2_status = io & 0x04;
                //toString(2)
                let io2 = io.toString(2);
                if(io2.length>4){
                    gang3_status = io & 0x10;
                }else{
                    gang3_status = io & 0x04;
                }
                
                console.log('gang2_status',gang2_status);
                emitter.emit('multiway_change_ref',{
                    gang1_status : gang1_status,
                    gang2_status : gang2_status,
                    gang3_status : gang3_status,
                    guid : guid,
                    date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                })
            }
            let gang4_status = io & 0x08;
            for(let i in scanned_periperals){
                if(scanned_periperals[i].guid == guid){
                    //check the date
                    if(!isset(scanned_periperals[i]['manual'])){
                        scanned_periperals[i]['manual'] = {}
                    }
                    //check is nor ref of the light
                    if(Object.keys(scanned_periperals[i]['manual']).length != 0 && device_mode == 'Multiway Switch'){
                        
                    }else{
                        let this_date = new Date();
                        //this_date.setSeconds(this_date.getSeconds() - 10);
                        console.log(dayjs(scanned_periperals[i]['manual'][1].date).toDate().getTime());
                        console.log(this_date.getTime());
                        console.log(dayjs(scanned_periperals[i]['manual'][1].date).toDate().getTime() < this_date.getTime());
                        if(isset(scanned_periperals[i]['manual'][1]) && dayjs(scanned_periperals[i]['manual'][1].date).toDate().getTime() < this_date.getTime()){
                            scanned_periperals[i]['manual'][1] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang1_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').find('.on_flag').attr('ref',gang1_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG1",gang1_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][1])){
                            scanned_periperals[i]['manual'][1] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang1_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').find('.on_flag').attr('ref',gang1_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG1",gang1_status>0?1:0);
                            }
                        }
                        if(isset(scanned_periperals[i]['manual'][2]) && new Date(scanned_periperals[i]['manual'][2].date) < this_date){
                            scanned_periperals[i]['manual'][2] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang2_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').find('.on_flag').attr('ref',gang2_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG2",gang2_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][2])){
                            scanned_periperals[i]['manual'][2] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang2_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').find('.on_flag').attr('ref',gang2_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG2",gang2_status>0?1:0);
                            }
                        }
                        if(isset(scanned_periperals[i]['manual'][3]) && new Date(scanned_periperals[i]['manual'][3].date) < this_date){
                            scanned_periperals[i]['manual'][3] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang3_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').find('.on_flag').attr('ref',gang3_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG3",gang3_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][3])){
                            scanned_periperals[i]['manual'][3] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang3_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').find('.on_flag').attr('ref',gang3_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG3",gang3_status>0?1:0);
                            }
                        }
                        if(isset(scanned_periperals[i]['manual'][4]) && new Date(scanned_periperals[i]['manual'][4].date) < this_date){
                            scanned_periperals[i]['manual'][4] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang4_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').find('.on_flag').attr('ref',gang4_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG4",gang4_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][4])){
                            scanned_periperals[i]['manual'][4] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang4_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').attr('ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').find('.on_flag').attr('ref',gang4_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG4",gang4_status>0?1:0);
                            }
                        }
                    }
                    
                }
            }
            // if(device_mode == 'Multiway Switch'){
            //     //check is not pairing device.
            //     let pair_on_off = $(`ul li.home-scanned-peripheral[pairing-guid="${guid}"][pairing-gang="ONOFF GANG1"]`).attr('onoff_ref');
            //     if(isset(pair_on_off)){
            //         console.log('pair_on_off',pair_on_off)
            //         console.log('gang1_status',gang1_status)
            //         if(pair_on_off == (gang1_status>0?1:0)){
            //             //gang_status_render(guid,"ONOFF GANG1",0);
            //         }else{
            //             //gang_status_render(guid,"ONOFF GANG1",1);
            //         }
            //     }
            // }
            
            
            
            
            
        }else if(rs.startsWith("85")){
            let io = parseInt(rs.substring(2,4), 16);
            let gang1_status = parseInt(io, 16) & 0x02;
            let gang2_status = parseInt(io, 16) & 0x04;
            let gang3_status = parseInt(io, 16) & 0x08;
            let gang4_status = parseInt(io, 16) & 0x10;
            return
            for(let i in scanned_periperals){
                if(scanned_periperals[i].guid == guid){
                    if(!isset(scanned_periperals[i]['manual'])){
                        scanned_periperals[i]['manual'] = {}
                    }
                    scanned_periperals[i]['manual'][1] = {
                        date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                        ref: gang1_status>0?1:0
                    };
                    scanned_periperals[i]['manual'][2] = {
                        date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                        ref: gang2_status>0?1:0
                    };
                    scanned_periperals[i]['manual'][3] = {
                        date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                        ref: gang3_status>0?1:0
                    };
                    scanned_periperals[i]['manual'][4] = {
                        date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                        ref: gang4_status>0?1:0
                    };
                }
            }
            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').attr('onoff_ref'))){
                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').find('.on_flag').attr('ref',gang1_status>0?1:0);
                gang_status_render(guid,"ONOFF GANG1",gang1_status>0?1:0);
            }
            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').attr('onoff_ref'))){
                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').find('.on_flag').attr('ref',gang2_status>0?1:0);
                gang_status_render(guid,"ONOFF GANG2",gang2_status>0?1:0);
            }
            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').attr('onoff_ref'))){
                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').find('.on_flag').attr('ref',gang3_status>0?1:0);
                gang_status_render(guid,"ONOFF GANG2",gang3_status>0?1:0);
            }
            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').attr('onoff_ref'))){
                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').find('.on_flag').attr('ref',gang4_status>0?1:0);
                gang_status_render(guid,"ONOFF GANG2",gang4_status>0?1:0);
            }
        }else if(rs.startsWith("86")){
            if(rs.includes('05010103')){
                let uuid = '';
                for(let i in scanned_periperals){
                    if(scanned_periperals[i].guid == guid){
                        uuid = i;
                    }
                }
                let cmd = [];
                cmd.push({action:"connect"});
                let data = `55aa040200`;
                data += core_util_calculate_crc16_modbus_for_doa(data);
                console.log(data);
                cmd.push({action:"write",data:`${data}`});
                ha_process_periperal_cmd(uuid, cmd).then(()=>{
                    
                  },error=>{
                    const toast = app.toast.create({
                        position: 'bottom',
                        closeTimeout: 3000,
                        text: error,
                      });
          
                      toast.open();
                  })
            }else if(rs.includes('55aa')){

            }
        }else if(rs.startsWith("87")){
            let temp_p = parseInt(rs.substr(8,2)+rs.substr(6,2)+rs.substr(4,2)+rs.substr(2,2), 16);
            let temp_v = parseInt(rs.substr(16,2)+rs.substr(14,2)+rs.substr(12,2)+rs.substr(10,2), 16);
            let temp_i = parseInt(rs.substr(24,2)+rs.substr(22,2)+rs.substr(20,2)+rs.substr(18,2), 16);
            let pvi_cf = 0.0;
            if(temp_p>0){
                pvi_cf = (1.0 / (temp_p /1000000.0));
            }
            let pvi_cf1_0 = (1.0 / (temp_v /1000000.0));
            let pvi_cf1_1 = (1.0 / (temp_i /1000000.0));
            let p = pvi_cf / 0.1209;
            let v = (pvi_cf1_0 * 2.43 * 512.0 * 1880.0) / (3579000.0 * 2.0);
            let i = (pvi_cf1_1 * 2.43 * 512.0) / (3579000.0 * 24.0 * 0.001);
            if(p<5){
                i = (p*1.0) / (v*1.0);
            }
            
            let kwh = 0;
            if(rs.length>=34){
                kwh = parseInt(rs.substr(32,2)+rs.substr(30,2)+rs.substr(28,2)+rs.substr(26,2), 16) / 100000.0;
            }

            let text = '<div class="pvi" style="font-size:12px">P:'+p.toFixed(2)+' &nbsp; V:'+v.toFixed(2)+' &nbsp; I:'+i.toFixed(2)+' &nbsp; Kwh:'+kwh.toFixed(2)+'</div>';
            $("li.home-scanned-peripheral.swipeout[guid='"+guid+"'] .item-content .pvi").remove();
            $("li.home-scanned-peripheral.swipeout[guid='"+guid+"'] .item-content .item-inner").append(text);
            $("li.home-scanned-peripheral.swipeout[guid='"+guid+"']").css({'height':90+'px'});
        }else if(rs.startsWith("9380")){
            let rsList = window.iot_ble_iaq_change_list(rs);
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

            const score = rs.substring(10,12);
            let score_data = window.iaq_evaluate_rule('score',score);
            $("li.iaq-subdevice[guid='"+guid+"']").find(".score .box-btn-img").css({'background-color':score_data.bgcolor})
            $("li.iaq-subdevice[guid='"+guid+"']").find(".score .iaq-title-big").text(parseInt(score,16));
        }else if(rs.startsWith("94110000")){
            let this_date = new Date();
            
            let uuid = '';
            for(let i in scanned_periperals){
                if(scanned_periperals[i].guid == guid){
                    uuid = i;
                }
            }
            const thermostat_power = parseInt(rs.substring(10, 12),16),
                  thermostat_model = parseInt(rs.substring(12, 14),16),
                  thermostat_fan = parseInt(rs.substring(14, 16),16),
                  thermostat_temp = parseInt(rs.substring(16, 18),16),
                  thermostat_room_temp = parseInt(rs.substring(18, 20),16),
                  thermostat_room_hum = parseInt(rs.substring(20, 22),16);
                  
                  if(isset(scanned_periperals[uuid]) && isset(scanned_periperals[uuid]['manual']) && isset(scanned_periperals[uuid]['manual']['Thermostat'])){
                    let scan_date = new Date(scanned_periperals[uuid]['manual']['Thermostat'].date);
                    if(true){
                        scanned_periperals[uuid]['manual']['Thermostat'] = {
                            date: DateFormatter.format(this_date, "Y-m-d H:i:s"),
                            ref: thermostat_power,
                            config : `${thermostat_power}|${thermostat_model}|${thermostat_fan}|${thermostat_temp}|${thermostat_room_temp}`
                        };
                    }
                  }else{
                    scanned_periperals[uuid]['manual'] = {};
                    scanned_periperals[uuid]['manual']['Thermostat'] = {
                        date: DateFormatter.format(this_date, "Y-m-d H:i:s"),
                        ref: thermostat_power,
                        config : `${thermostat_power}|${thermostat_model}|${thermostat_fan}|${thermostat_temp}|${thermostat_room_temp}`
                    };
                  }
                controller_thermostat_refresh_status(guid, '', thermostat_power,thermostat_model,thermostat_fan,thermostat_temp,thermostat_room_temp,thermostat_room_hum); 
            
        }else if(rs.startsWith("9502000009")){
            const byteStrings = rs.match(/.{1,2}/g);
            const targetStatus = parseInt(byteStrings[5], 16);
            if(targetStatus){
                $("li.device[guid='"+guid+"'] .rf-sensor i").html("directions_walk");
            }else{
                $("li.device[guid='"+guid+"'] .rf-sensor i").html("block");
            }
            
        }else if(rs.startsWith("95FF000001")){
            const byteStrings = rs.match(/.{1,2}/g);
            const targetStatus = parseInt(byteStrings[5], 16);
            if(targetStatus){
                $("li.device[guid='"+guid+"'] .rf-sensor i").html("directions_walk");
            }else{
                $("li.device[guid='"+guid+"'] .rf-sensor i").html("block");
            }
        }
    })
}


window.dataToUpload = [1,2,3,4,5,6,7,8,9]
window.uploadDataWhenIdle = (deadline)=>{
    if (performance && performance.now() < 50) {
        // 如果浏览器处于空闲状态，上传 log 数据
        if (dataToUpload.length > 0) {
            const chunk = dataToUpload.shift();
            uploadDataChunk(chunk);
        }
      }
      requestAnimationFrame(uploadDataWhenIdle);
};
//uploadDataWhenIdle();
window.uploadDataChunk = (chunk)=>{
    console.log('Uploading chunk:', chunk);
}
