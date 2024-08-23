window.iot_ble_change_password = (params) => {
    const guid = params.ref;
    const device_name = params.obj.attr('device-name');
    
    app.dialog.login (_("Please enter a password with length = 6"), function(username,password){
        if(username.length == 6){
            if(username == password){
                let oripassword = iot_ble_get_password(guid);
                if(oripassword!=password){
                    iot_ble_perform_password(guid, password, device_name);
                }else{
                    app.dialog.alert(_("Update Successfully."));
                }
            }else{
                app.dialog.alert(_("Password is not same."));
            }
        }else{
            app.dialog.alert(_("Invalid Password Format."));
        }
        
    });
    setTimeout(()=>{
        $(`.dialog-input-field input[name="dialog-username"]`).attr('type','password');
        $(`.dialog-input-field input[name="dialog-username"]`).attr('placeholder','New Password');
        $(`.dialog-input-field input[name="dialog-password"]`).attr('placeholder','Confirm Password');
    },0)
};

window.iot_ble_perform_password = (guid, password, device_name) => {
    let errorflag = false;
    let p = Object.values(scanned_periperals).find(item=>item.guid == guid && item.advertising);
    
    $(".bluetooth-icons").attr("ref", 2);
    iot_ble_do_pre_action(guid).then(()=>{
        $(".bluetooth-icons").attr("ref", 1);
        ble.startNotification(p.id, "ff80", "ff82", function(rs){
            console.log(p.guid+"="+rs);
            let gguid = p.guid;
            if(rs.startsWith("82")){
                if(rs.endsWith("00") || rs.endsWith("02") || rs.endsWith("03")){
                    scanned_periperals[p.id].password = password;
                    if(!isset(runtime.peripherals_password)){
                        runtime.peripherals_password = {}
                    }
                    if(!isset(runtime.peripherals_password[guid])){
                        runtime.peripherals_password[guid] = {}
                    }
                    runtime.peripherals_password[guid].password = password;
                    runtime.peripherals_password[guid].updatedPassword = password;
                    db.set("peripherals_password", JSON.stringify(runtime.peripherals_password));
                    
                	let data = {
                		name: device_name,
                		password: password
                	};
                	var url = "/api/resource/Profile%20Device/" + encodeURI(device_name);
                	var method = "PUT";
                	
                	http.request(url, {
                		method: method,
                		serializer: 'json',
                		data:{data:data},
                	}).then(()=>{
                        let url = `/api/resource/Device/${guid}`;
                        let data = {
                            password : password
                        };
                        return http.request(url, {
                            method: method,
                            responseType: "json",
                            serializer: 'json',
                            data:data,
                        })
                	}).then(()=>{
                        app.dialog.alert(_("Update Successfully."));
                        ha_profile_ready();
                    }).catch(()=>{
                        app.dialog.alert(_("Update Failed."));
                	});
                }else{
                    app.dialog.alert(_("Update failed."));
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
                $("li.device[guid='"+gguid+"'] .item-content .pvi").remove();
                $("li.device[guid='"+gguid+"'] .item-content .item-inner").append(text);
                $("li.device[guid='"+gguid+"']").css({'height':90+'px'});
            }
        });
    }).catch((error)=>{
        errorflag = true;
        $(".bluetooth-icons").attr("ref", 0);
        if(error=="Password is not correct"){
            app.dialog.password(_('Please enter the password'), function (password) {
                runtime.peripherals_password[guid].updatedPassword = password;
                db.set("peripherals_password", JSON.stringify(runtime.peripherals_password));
                iot_ble_perform_password(guid, password, device_name);
            });
        }else{
            app.dialog.alert(_(error));
        }
    }).then(()=>{
        if(!errorflag){
	        let oripassword = iot_ble_get_password(guid);
	        return iot_ble_write(guid, "ff80", "ff81", ("82"+(oripassword.substring(0,6)+password.substring(0,6)).convertToHex()));
        }
    });
};


