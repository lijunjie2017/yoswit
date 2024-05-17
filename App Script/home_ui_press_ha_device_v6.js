/**
 *
 * @param {import('types/listener').CommonListenerParams} params
 * @returns
 */
window.home_ui_press_ha_device_v5 = async(params)=>{
    const TAG = "ERP >>> home_ui_press_ha_device_v5";
    console.log(TAG)
    //variables
    const obj = params.obj.closest('li.device');
    const guid = obj.attr('guid');
    const gateway = obj.attr('gateway');
    const subdevice = obj.attr('subdevice-name');
    const password = iot_ble_get_password(guid);
    let uuid = obj.attr("uuid");
    
    for(let i in scanned_periperals){
        if(scanned_periperals[i].guid==guid){
            uuid = i;
            break;
        }
    }
    
    const p = scanned_periperals[uuid];
    const bluetooth = obj.attr("bluetooth")*1;
    const signal = obj.attr("signal")*1;
    const mesh = obj.attr("mesh")*1;
    const mobmob = obj.attr("mobmob")*1;
    const network_id = obj.attr("network-id")*1;
    const button_group = obj.attr("button_group");
    const slot_index = obj.attr("slot-index");
    const command_type = params.obj.attr("command-type");
    const command = params.obj.attr("command");
    const mac = core_utils_get_mac_address_from_guid(guid,true);
    let config = obj.attr('config') == 'None'?'':obj.attr('config');
    //return;
    if(command_type=="Bluetooth"){
        const now = DateFormatter.format((new Date()), "Y-m-d H:i:s");
        let ref = "";
        let control_ref = 0;
        if(button_group.startsWith("OPENCLOSE GANG")){
            const gang = button_group.replace("OPENCLOSE GANG", "");
            let direction = params.direction;
            console.log(direction)
            if(typeof(direction) == 'undefined'){
                console.log(params.obj.hasClass("op"))
                if(params.obj.hasClass("op")){
                    if(gang=="1_2"){
                        ref = "80001100000000ffff0000";
                    }else if(gang=="2_1"){
                        ref = "80002200000000ffff0000";
                    }else if(gang=="3_4"){
                        ref = "80004400000000ffff0000";
                    }else if(gang=="4_3"){
                        ref = "80008800000000ffff0000";
                    }
                }else if(params.obj.hasClass("cl")){
                    if(gang=="1_2"){
                        ref = "80002200000000ffff0000";
                    }else if(gang=="2_1"){
                        ref = "80001100000000ffff0000";
                    }else if(gang=="3_4"){
                        ref = "80008800000000ffff0000";
                    }else if(gang=="4_3"){
                        ref = "80004400000000ffff0000";
                    }
                }else{
                    ref = "8000f000000000ffff0000";
                }
            }
            if(direction=="hold"){
                if(params.obj.find(".button").hasClass("op")){
                    if(gang=="1_2"){
                        ref = "80001100000000ffff0000";
                    }else if(gang=="2_1"){
                        ref = "80002200000000ffff0000";
                    }else if(gang=="3_4"){
                        ref = "80004400000000ffff0000";
                    }else if(gang=="4_3"){
                        ref = "80008800000000ffff0000";
                    }
                }else{
                    if(gang=="1_2"){
                        ref = "80002200000000ffff0000";
                    }else if(gang=="2_1"){
                        ref = "80001100000000ffff0000";
                    }else if(gang=="3_4"){
                        ref = "80008800000000ffff0000";
                    }else if(gang=="4_3"){
                        ref = "80004400000000ffff0000";
                    }
                }
            }else if(direction=="release"){
                ref = "8000f000000000ffff0000";
            }
        }else if(button_group.startsWith("TOGGLE GANG")){
          const gang = button_group.replace("TOGGLE GANG", "");
          let direction = params.direction;
          console.log(direction)
          if(direction=="hold"){
            if(params.obj.find(".button").hasClass("op")){
              if(gang == "1" || gang == "2"){
                ref = "8000f100000000ffff0000";
              }else if(gang == "3" || gang == "4"){
                ref = "8000f400000000ffff0000"
              }
            }else if(params.obj.find(".button").hasClass("cl")){
              if(gang == "1" || gang == "2"){
                ref = "8000f200000000ffff0000";
              }else if(gang == "3" || gang == "4"){
                ref = "8000f800000000ffff0000";
              }
              
            }
          }else if(direction=="release"){
              ref = "8000f000000000ffff0000";
          }else{
            if(params.obj.find(".button").hasClass("op")){
              if(gang == "1"){
                ref = "8000f100000000ffff0000";
              }else if(gang == "2"){
                ref = "8000f400000000ffff0000"
              }
            }else if(params.obj.find(".button").hasClass("cl")){
              if(gang == "1"){
                ref = "8000f200000000ffff0000";
              }else if(gang == "2"){
                ref = "8000f800000000ffff0000";
              }
            }
          }
        }else if(button_group.startsWith("OPENCLOSE UART")){
            const gang = button_group.replace("OPENCLOSE UART", "");
            let reverse = params.obj.attr("direction")?params.obj.attr("direction"):obj.attr('direction');
            
            let direction = params.direction;
            console.log('direction',reverse)
            console.log("params.ref",params.ref);
            console.log("config",config);
            let uart_data = "";
            let data = "";
            let local_value = "";
            const this_ref = await db.get('curtain_motor_'+guid);
            local_value = this_ref?this_ref:100;
            let current_value = '';
            let curtain_status = "";
            let img_info = '';
            console.log("this_ref",this_ref);
            //change icon 
            if(params.ref=="1"){
                params.obj.attr('ref',0);
                curtain_status = 0;
                params.obj.find("img").attr('src','https://my.yoswit.com'+'/files/app/open-curtain.svg');
                console.log(params.obj.find("img"))
                console.log("open-curtain", params.obj.find("img").attr('src'));
                img_info = 'open-curtain';
            }else if(params.ref=="0"){
                params.obj.attr('ref',1);
                curtain_status = 1;
                params.obj.find("img").attr('src','https://my.yoswit.com'+'/files/app/close-curtain.svg');
                console.log(params.obj.find("img"))
                console.log("close-curtain", params.obj.find("img").attr('src'));
                img_info = 'close-curtain';
            }else{
                let img_url =  params.obj.next().find("img").attr('src');
                if(img_url.includes('close-curtain')){
                    img_info = "close-curtain"
                }else{
                    img_info = "open-curtain"
                }
            }
            //save local value
            if(!isset(scanned_periperals[uuid]['manual']))
                scanned_periperals[uuid]['manual'] = {}
            let currentDate = new Date();
            currentDate.setSeconds(currentDate.getSeconds() + 10);    
            scanned_periperals[uuid]['manual'][1] = {
                date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
                ref: local_value
            };
            iot_ble_set_ui_status_curtain(guid,local_value);
            //check the reverse value
            if(params.ref=="1" && reverse == 'standard'){
                data = "55AA060102"+local_value.toString(16).pad("00")+"FF";
                current_value = local_value;
            }else if(params.ref=="1" && reverse == 'reverse'){
                data = "55AA060102"+(100-local_value).toString(16).pad("00")+"FF";
                current_value = local_value;
            }else if(params.ref=="0" && reverse == 'reverse'){
                data = "55AA060102"+(100-local_value).toString(16).pad("00")+"FF";
                current_value = local_value;
            }else if(params.ref=="2"){
                data = "55AA050101036DDC";
            }else{
                data = "55AA0601020000";
                iot_ble_set_ui_status_curtain(guid,0);
                scanned_periperals[uuid]['manual'][1] = {
                    date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
                    ref: 0
                };
                current_value = 0;
            }
            if(params.ref!="2"){
                scanned_periperals[uuid]['manual'][1] = {
                    date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
                    ref: current_value,
                    curtain_status : curtain_status,
                    img_info : img_info
                };
                scanned_periperals_proxy[uuid]['manual'][1] = {
                    date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
                    ref: `${current_value}`,
                    curtain_status : `${curtain_status}`,
                    img_info : img_info
                };
            }else{
                currentDate.setSeconds(currentDate.getSeconds() - 15);
                scanned_periperals[uuid]['manual'][1] = {
                    date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
                    ref: current_value,
                    curtain_status : curtain_status,
                    img_info : img_info
                };
                scanned_periperals_proxy[uuid]['manual'][1] = {
                    date: DateFormatter.format(currentDate, "Y-m-d H:i:s"),
                    ref: `${current_value}`,
                    curtain_status : `${curtain_status}`,
                    img_info : img_info
                };
            }
            console.log("org:",data);
            data += core_util_calculate_crc16_modbus_for_doa(data);
            ref = "8602"+data.toLowerCase();
            control_ref = local_value+'';
        }else if(button_group.startsWith("RCU")){
            let this_gang = button_group.replace("RCU OPENCLOSE GANG", "");
            const gang = this_gang - ((parseInt(slot_index)-1)*2);
            let direction = params.direction;
            console.log(direction)
            if(typeof(direction) == 'undefined'){
                console.log(params.obj.hasClass("op"))
                if(params.obj.hasClass("op")){
                    if(gang=="1"){
                        ref = "8000f100000000ffff0000";
                    }else if(gang=="2"){
                        ref = "8000f400000000ffff0000";
                    }
                }else if(params.obj.hasClass("cl")){
                    if(gang=="1"){
                        ref = "8000f200000000ffff0000";
                    }else if(gang=="2"){
                        ref = "8000f800000000ffff0000";
                    }
                }else{
                    ref = "8000f000000000ffff0000";
                }
            }
            if(direction=="hold"){
                if(params.obj.find(".button").hasClass("op")){
                    if(gang=="1"){
                        ref = "8000f100000000ffff0000";
                    }else if(gang=="2"){
                        ref = "8000f400000000ffff0000";
                    }
                }else{
                    if(gang=="1"){
                        ref = "8000f200000000ffff0000";
                    }else if(gang=="2"){
                        ref = "8000f800000000ffff0000";
                    }
                }
            }else if(direction=="release"){
                ref = "8000f000000000ffff0000";
            }
            ref = `971f${slot_index}${ref}`;
        }
        window.throttle_ha_home_local_status_save.cancel();
        window.throttle_ha_home_local_status_save('local_scanned_periperals',JSON.stringify(window.scanned_periperals));
        const mackey = core_utils_get_mac_address_from_guid(guid,true)
        let newRef = `02${mackey}${ref}`
        let cmd = [];
        cmd.push({action:"connect"});
          cmd.push({action:"write",data:newRef});
          
        //   if(isset(scanned_periperals[uuid])){
        //       scanned_periperals[uuid] = app.utils.extend(scanned_periperals[uuid], p);
        //   }else{
        //       scanned_periperals[uuid] = p;
        //   }
          ha_process_periperal_cmd(uuid, cmd).then(()=>{
            if(subdevice){
                let control_type = mobmob==1?'MobMob':network_id>0?"Network":'Bluetooth';
                window.upload_device_control_log(guid,1,control_type,subdevice);
                //window.iot_update_profile_subdevice_status(subdevice,control_ref);
              }
              if(params.ref=="2"){
                let new_cmd = [];
                new_cmd.push({action:"connect"});
                let data = `55AA040301`;
                data += core_util_calculate_crc16_modbus_for_doa(data);
                new_cmd.push({action:"write",data:`8602${data}`});
                ha_process_periperal_cmd(uuid, new_cmd).then(()=>{

                })
              }
          },error=>{
            const toast = app.toast.create({
                position: 'bottom',
                closeTimeout: 3000,
                text: error,
              });
  
              toast.open();
          })
    }
  };
  