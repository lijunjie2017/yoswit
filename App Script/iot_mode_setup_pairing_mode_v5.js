window.iot_mode_setup_pairing_mode_picker = {};
window.iot_mode_setup_pairing_mode_auto_init = function(params) {
    const this_guid = params.ref;
    const this_model = params.obj.attr("model");
    const this_device_name = params.obj.attr('device-name')
    const setting_type = params.obj.attr("setting-type");
    const setting_value = params.obj.attr("setting-value");
    const this_subdevice = params.obj.attr("subdevice-name");
    let this_button_group = params.obj.attr("button-group");
    let command = {"No Pairing":""};
    let commandList = {"No Pairing":""}
    let doms = $(".pairing-device li");
    doms.forEach((ele)=>{
      let name = $(ele).attr("name");
      let guid = $(ele).attr("guid");
      let button_group = $(ele).attr("button-group");
      let subdevice_name = $(ele).attr("subdevice-name");
      let title = $(ele).attr("display-name");
      if(guid != this_guid){
        command[name] = guid + "|"+button_group + "|" + subdevice_name;
        commandList[title] = "";
      }
      if(name == setting_value){
        command["No Pairing"] = guid
      }
    })
    const inputEl = params.obj.find("input[name=pairing_name]");

    iot_mode_setup_pairing_mode_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: Object.keys(command),
                displayValues: Object.keys(commandList).map((e) => _(e))
            }
        ],
        formatValue: (values) => {
            return values[0];
        },
        renderToolbar: () => {
            return `
            <div class="toolbar">
                <div class="toolbar-inner">
                    <div class="left"></div>
                    <div class="right">
                        <a href="#" class="link toolbar-save-link">${_("Save")}</a>
                    </div>
                </div>
            </div>
            `;
        },
        on: {
            open: (picker) => {
              iot_mode_setup_pairing_mode_picker.setValue([params.obj.attr("setting-value")]);
                let this_setting_value = params.obj.attr("setting-type");
                doms.forEach((ele)=>{
                  let name = $(ele).attr("name");
                  let guid = $(ele).attr("guid");
                  let button_group = $(ele).attr("button-group");
                  let subdevice_name = $(ele).attr("subdevice-name");
                  let title = $(ele).attr("display-name");
                  if(guid != this_guid){
                    command[name] = guid + "|"+button_group + "|" + subdevice_name;
                    commandList[title] = "";
                  }
                  if(name == setting_value){
                    command["No Pairing"] = guid;
                    command['name'] = subdevice_name;
                  }
                })
                $(picker.$el).find(".toolbar-save-link").on("click", () => {
                  iot_mode_setup_pairing_mode_picker.close();
                  doms.forEach((ele)=>{
                    let name = $(ele).attr("name");
                    let guid = $(ele).attr("guid");
                    let button_group = $(ele).attr("button-group");
                    let subdevice_name = $(ele).attr("subdevice-name");
                    let title = $(ele).attr("display-name");
                    if(guid != this_guid){
                      command[name] = guid + "|"+button_group + "|" + subdevice_name;
                      commandList[title] = "";
                    }
                    if(name == setting_value){
                      command["No Pairing"] = guid;
                      command['name'] = subdevice_name;
                    }
                  })
                    const selected = inputEl.val();
                    console.log("iot_mode_setup_pairing_mode_picker")
                    app.preloader.show();
                    let data = command[selected];
                    let guid = "";
                    let gang = "";
                    let new_mac = "";
                    let ower_mac = ""; 
                    let uuid = "";
                    let target_uuid = '';
                    let command_data = "";
                    let other_command_data = "";
                    let button_group = "";
                    let target_name = "";
                    let this_gang = this_button_group.replace("ONOFF GANG","")*1;
                    for(let i in scanned_periperals){
                      //console.log(scanned_periperals[i].guid)
                      if(scanned_periperals[i].guid == this_guid){
                        uuid = i;
                      }
                    }
                    let this_firmware = window.scanned_periperals[uuid].firmware?window.scanned_periperals[uuid].firmware:0;
                      if(this_firmware<10.0 && this_gang ==2){
                        this_gang = 3;
                      }
                    let server_data = {
                      "Device Pairing" : selected,
                      "pairing_guid" : null
                    }
                    let other_server_data = {
                      "be_pairing" : true
                    }
                    let profile_subdevice_data = {
                      "mapping" : "",
                    };
                    let target_profile_subdevice_data = {
                      "mapping" : "",
                    };
                    let read_cmd = [];
                    read_cmd.push({action:"connect"});
                    // read firmware version 2a26
                    read_cmd.push({action:"read",serv:'180a',char:'2a26'});
                    if(selected == "No Pairing"){
                      guid = command[selected]
                      let other_button_group = setting_value.split('-');
                      let target_name = command["name"];
                      ower_mac = core_utils_get_mac_address_from_guid(this_guid,true);
                      let gang2 = other_button_group.length>2?other_button_group[other_button_group.length-1].replace("ONOFF GANG","")*1:1;
                      
                      for(let i in scanned_periperals){
                        //console.log(scanned_periperals[i].guid)
                        if(scanned_periperals[i].guid == this_guid){
                          uuid = i;
                        }
                      }
                      command_data = `02${ower_mac}81080${this_gang}00`;
                      let cmd = [];
                      cmd.push({action:"connect"});
                      cmd.push({action:"write",data:command_data});
                      ha_process_periperal_cmd(uuid, cmd,true).then(()=>{
                        params.obj.attr("setting-value", selected);
                        params.obj.find(".setting-value").html(_(selected));
                        app.preloader.hide();
                        server_data[this_button_group] = null;
                        //console.log("server_data",server_data);
                        other_server_data["be_pairing"] = null;
                        iot_device_setting_sync_server(this_guid, null, null, true,server_data).then(()=>{
                          iot_device_setting_sync_server(guid,null,null,true,other_server_data);
                          window.iot_update_profile_subdevice_config(this_subdevice,JSON.stringify(profile_subdevice_data)).then(()=>{
                            window.iot_update_profile_subdevice_config(target_name,JSON.stringify({"be_pairing":""}));
                            app.ptr.refresh('.frappe-detail-ptr-content');
                          })
                        })
                      }).catch((error)=>{
                        const toast = app.toast.create({
                          position: 'bottom',
                          closeTimeout: 3000,
                          text: error,
                        });
              
                        toast.open();
                      })
                    }else{
                      let buttonList = data.split('|');
                      guid = buttonList[0];
                      button_group = buttonList[1];
                      target_name = buttonList[2];
                      gang = buttonList[1].replace("ONOFF GANG","")*1;
                      new_mac = core_utils_get_mac_address_from_guid(guid,true);
                      ower_mac = core_utils_get_mac_address_from_guid(this_guid,true);
                      for(let i in scanned_periperals){
                        //console.log(scanned_periperals[i].guid)
                        if(scanned_periperals[i].guid == this_guid){
                          uuid = i;
                        }
                        if(scanned_periperals[i].guid == guid && guid){
                          target_uuid = i
                        }
                      }
                      //get target firmware
                      ha_process_periperal_cmd(target_uuid, read_cmd,true).then(()=>{
                        let target_firmware = window.scanned_periperals[target_uuid].firmware?window.scanned_periperals[target_uuid].firmware:0;
                        if(target_firmware <10.0 && gang == 2){
                          gang = 3;
                        }
                        command_data = `02${ower_mac}81080${this_gang}fe${new_mac}ff0${gang}00`;
                        other_command_data = `81080${gang}fe${ower_mac}ff0${this_gang}00`;
                        server_data["pairing_guid"] = guid;
                        server_data[this_button_group] = button_group;
                        profile_subdevice_data = {
                            "mapping" : target_name,
                            "virtual" : ""
                        }
                        target_profile_subdevice_data = {
                            "mapping" : this_subdevice,
                            "virtual" : ""
                        };
                        
                          if (command_data) {
                              let cmd = [];
                              cmd.push({action:"connect"});
                              cmd.push({action:"write",data:command_data});
                              //console.log("uuid",uuid)
                              
                              ha_process_periperal_cmd(uuid, cmd,true).then(()=>{
                                params.obj.attr("setting-value", selected);
                                params.obj.find(".setting-value").html(_(selected));
                                
                                app.preloader.hide();
                                iot_device_setting_sync_server(this_guid, null, null, true,server_data).then(()=>{
                                  iot_device_setting_sync_server(guid,null,null,true,other_server_data);
                                  window.iot_update_profile_subdevice_config(this_subdevice,JSON.stringify(profile_subdevice_data)).then(()=>{
                                    window.iot_update_profile_subdevice_config(target_name,JSON.stringify({'be_pairing':true}));
                                  })
                                  app.ptr.refresh('.frappe-detail-ptr-content');
                                })
                              },(e)=>{
                                  if(e!="Password is not correct"){
                                    const toast = app.toast.create({
                                      position: 'bottom',
                                      closeTimeout: 3000,
                                      text: error,
                                    });
                          
                                    toast.open();
                                  }
                                  app.preloader.hide();
      
                                  if (!iot_ble_exception_message(err)) {
                                      app.dialog.alert(err, runtime.appInfo.name);
                                  }
                              });
                          } else {
                              return Promise.reject(new Error("Unsupport option!"));
                          }
                      })
                    }
                    
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
      iot_mode_setup_pairing_mode_picker.open();
    });
}