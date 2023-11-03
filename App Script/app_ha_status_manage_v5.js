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
        if( new Date(peripheral.lastDiscoverDate).getTime() > new Date(this_date).getTime()){
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
    _emitter.on("startNotification", (data)=>{
        console.log(data)
        let rs = data.rs;
        let guid = data.guid;
        let gang_status_render = (self_guid,button_group,status)=>{
            let obj = window.standard_status;
            for(let i in obj){
                if(self_guid == obj[i].guid){
                    let ld = new Date(obj[i].date).getTime();
                    let now = new Date().getTime();
                    if(now > ld){
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
            console.log('gang4_status',gang4_status)
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
            }else if(!isset(isset(scanned_periperals[uuid]['manual'][3]))){
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
            let img_url = runtime.appConfig.app_api_url+'/files/';
            if(rs.startsWith( "8b00")){
                $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".material-icons").text("sensor_door")
                $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".button img").attr('src',img_url+'door_close.svg')
                $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".on_flag").attr("ref",0)
            }else{
                $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".on_flag").attr("ref",1)
                $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".material-icons").text("open_in_full")
                $("li.device[guid='"+guid+"']").find(".control-panel-right").find(".button img").attr('src',img_url+'door_open.svg')
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
            let hexid = window.runtime.peripherals[guid].hexModel;
            for(let i in window.device_models){
                if(hexid == i){
                    device_mode = window.device_models[i].mode
                }
            }
            let io = parseInt(rs.substring(2,4), 16);
            let gang1_status = io & 0x01;
            let gang2_status = io & 0x02;
            let gang3_status = io & 0x04;
            if(device_mode == 'Multiway Switch'){
                gang2_status = io & 0x04;
                //toString(2)
                let io2 = io.toString(2);
                if(io2.length>4){
                    gang3_status = io & 0x10;
                }else{
                    gang3_status = io & 0x04;
                }
                
                console.log('gang2_status',gang2_status)
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
                        //find next device ui
                        let target_guid_dom = $(`ul li.home-scanned-peripheral[guid="${guid}"]`);
                        target_guid_dom.forEach(ele=>{
                            let this_gang = $(ele).attr("button_group");
                            let target_guid = $(ele).attr('pairing-guid');
                            let target_gang = $(ele).attr('pairing-gang');
                            let gang = this_gang.replace("ONOFF GANG","");
                            let uuid = $(ele).attr("uuid");
                            let status = $(ele).hasClass("pair-subdevice");
                            let currentDate = new Date();
                            let new_date = new Date(currentDate.getTime()+5*1000);
                            let ref = "";
                            if(this_gang == "ONOFF GANG1"){
                                ref = gang1_status>0?1:0;
                            }else if(this_gang == "ONOFF GANG2"){
                                ref = gang2_status>0?1:0;
                            }else if(this_gang == "ONOFF GANG3"){
                                ref = gang3_status>0?1:0;
                            }
                            if(!status){
                                if(this_gang && target_gang){
                                    let target_ref = $(ele).next().find('.home-scanned-peripheral').attr('onoff_ref');
                                    let next_uuid = $(ele).next().find('.home-scanned-peripheral').attr('uuid');
                                    $(ele).attr('onoff_ref',ref);
                                    if(ref == target_ref){
                                        $(ele).next().find('.home-scanned-peripheral').find(".on_flag").attr("ref",0);   
                                    }else{
                                        $(ele).next().find('.home-scanned-peripheral').find(".on_flag").attr("ref",1);
                                    }
                                    scanned_periperals[uuid]['manual'][gang] = {
                                        date: DateFormatter.format(new_date, "Y-m-d H:i:s"),
                                        ref: ref
                                    };
                                }
                            }else{
                                if(this_gang && target_gang){
                                    let target_ref = $(ele).parent().prev().find('.home-scanned-peripheral').attr('onoff_ref');
                                    let next_uuid = $(ele).parent().prev().find('.home-scanned-peripheral').attr('uuid');
                                    $(ele).attr('onoff_ref',ref);
                                    if(ref == target_ref){
                                        $(ele).find('.home-scanned-peripheral').find(".on_flag").attr("ref",0);   
                                    }else{
                                        $(ele).find('.home-scanned-peripheral').find(".on_flag").attr("ref",1);
                                    }
                                    scanned_periperals[uuid]['manual'][gang] = {
                                        date: DateFormatter.format(new_date, "Y-m-d H:i:s"),
                                        ref: ref
                                    };
                                }
                            }
                        })
                    }else{
                        let this_date = new Date();
                        console.log(scanned_periperals[i]['manual'][1].date);
                        console.log(this_date);
                        console.log(new Date(scanned_periperals[i]['manual'][1].date) < this_date)
                        if(isset(scanned_periperals[i]['manual'][1]) && new Date(scanned_periperals[i]['manual'][1].date) < this_date){
                            scanned_periperals[i]['manual'][1] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang1_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').attr('onoff_ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').find('.on_flag').attr('ref',gang1_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG1",gang1_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][1])){
                            scanned_periperals[i]['manual'][1] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang1_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').attr('onoff_ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG1"]').find('.on_flag').attr('ref',gang1_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG1",gang1_status>0?1:0);
                            }
                        }
                        if(isset(scanned_periperals[i]['manual'][2]) && new Date(scanned_periperals[i]['manual'][2].date) < this_date){
                            scanned_periperals[i]['manual'][2] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang2_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').attr('onoff_ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').find('.on_flag').attr('ref',gang2_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG2",gang2_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][2])){
                            scanned_periperals[i]['manual'][2] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang2_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').attr('onoff_ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG2"]').find('.on_flag').attr('ref',gang2_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG2",gang2_status>0?1:0);
                            }
                        }
                        if(isset(scanned_periperals[i]['manual'][3]) && new Date(scanned_periperals[i]['manual'][3].date) < this_date){
                            scanned_periperals[i]['manual'][3] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang3_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').attr('onoff_ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').find('.on_flag').attr('ref',gang3_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG3",gang3_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][3])){
                            scanned_periperals[i]['manual'][3] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang3_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').attr('onoff_ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG3"]').find('.on_flag').attr('ref',gang3_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG3",gang3_status>0?1:0);
                            }
                        }
                        if(isset(scanned_periperals[i]['manual'][4]) && new Date(scanned_periperals[i]['manual'][4].date) < this_date){
                            scanned_periperals[i]['manual'][4] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang4_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').attr('onoff_ref'))){
                                $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').find('.on_flag').attr('ref',gang4_status>0?1:0);
                                gang_status_render(guid,"ONOFF GANG4",gang4_status>0?1:0);
                            }
                        }else if(!isset(scanned_periperals[i]['manual'][4])){
                            scanned_periperals[i]['manual'][4] = {
                                date: DateFormatter.format((new Date()), "Y-m-d H:i:s"),
                                ref: gang4_status>0?1:0
                            };
                            if(isset( $('ul li.home-scanned-peripheral[guid="'+guid+'"][button_group="ONOFF GANG4"]').attr('onoff_ref'))){
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
                // let cmd = [];
                // cmd.push({action:"connect"});
                // let data = `55aa040200`;
                // data += core_util_calculate_crc16_modbus_for_doa(data);
                // console.log(data);
                // cmd.push({action:"write",data:`${data}`});
                // ha_process_periperal_cmd(uuid, cmd).then(()=>{
                    
                //   },error=>{
                //     const toast = app.toast.create({
                //         position: 'bottom',
                //         closeTimeout: 3000,
                //         text: error,
                //       });
          
                //       toast.open();
                //   })
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
            $("li.device[guid='"+guid+"'] .item-content .pvi").remove();
            $("li.device[guid='"+guid+"'] .item-content .item-inner").append(text);
            $("li.device[guid='"+guid+"']").css({'height':90+'px'});
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
