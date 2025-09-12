window.iot_switch_profile = async(params)=>{
    console.log(params)
    const TAG = "ERP >>> window.iot_switch_profile";
	if(!isset(params.ref)) return;
	
	//lastRoomRef = 0
	app.preloader.show();
	//unsubscribe the gateway list 
	if(isset(window.gateway_lists && window.gateway_lists)){
	    for(let i in gateway_lists){
	        let topic = `status/${md5(md5(gateway_lists[i]))}`;
            let will_topic = `will/${md5(md5(gateway_lists[i]))}`;
						try{
							await core_mqtt_unsubscribe(topic,false);
            	await core_mqtt_unsubscribe(will_topic,false);
						}catch(error){
							console.log('error',error);
						}
	    }
	}
	//this new ha flow
	const selfgatewayhash = md5(md5(deviceInfo.getDeviceGateway().toLowerCase()));
	let profile_device = cloneDeep(erp.info.profile.profile_device);
	for(let i in profile_device){
		if (!profile_device[i].gateway || profile_device[i].gateway.trim() == "") continue;
		const gatewayhash = md5(md5(profile_device[i].gateway.toLowerCase()));
		if (selfgatewayhash == gatewayhash) { // self gateway, need to listen to cmd

			const cmd_topic = `cmd/${gatewayhash}`;
			try{
				await core_mqtt_unsubscribe(cmd_topic,false);
				emitter.off(cmd_topic);
			}catch(error){
				console.log('error',error);
			}
		} else { // other gateway, need to listen to status and will

			//check if gateway is online / offline
			try{
				const will_topic = `will/${gatewayhash}`;
				await core_mqtt_unsubscribe(will_topic,false);
				emitter.off(will_topic);
				//get the devices' status from gateway
				const status_topic = `status/${gatewayhash}`;
				await core_mqtt_unsubscribe(status_topic,false);
				emitter.off(status_topic);
			}catch(error){
				console.log('error',error);
			}
		}
	}
	let prev_profile_id = erp.info.profile.name;
	let prev_topic_id = `profile_subdevice_${erp.info.profile.name}`
	try{
	    window.app_guest_registration_comelit_is_activated = false;
		http.request("/api/resource/User%20Settings", {
			method:"POST",
				serializer: 'json',
			data:{"data": {active_profile:params.ref,owner:users[users.current].usr,app_id:appInfo.id}}
		}).then(async (rs)=>{
		   
	}, ()=>{
	    return http.request("/api/resource/User%20Settings/"+encodeURIComponent(appInfo.id+"-"+users[users.current].usr), {
    		method:"PUT",
    		serializer: 'json',
    		data:{"data": {active_profile:params.ref}}
    	})
	}).then(async()=>{
	    //del the local_scanned_periperals
	    window.peripheral = {};
	    //del the loacl db
	    await db.set('peripheral',JSON.stringify({}));
	    try{
	        let originalAppInfo = await Capacitor.Plugins.App.getInfo();
            originalAppInfo.id = originalAppInfo.id == 'hk.tgt.h1' ? 'hk.tgt.h1lifestyle' : originalAppInfo.id;
    	    erp.info = {
              ...erp.info,
              ...JSON.parse(
                (
                  await http.request('/api/method/appv6.afterLogin', {
                    method: 'POST',
                    timeout: 15,
                    cacheStrategy: false,
                    data: {
                      appId: erp.appId,
                      deviceId: deviceInfo.deviceId,
                      user_setting_name: erp.appId + '-' + users[users.current].usr,
                      resident_status: erp.setting.default_account_registration_status || 'Approved',
                      oriAppId: originalAppInfo.id,
                      model: deviceInfo.model,
                      operatingSystem: deviceInfo.operatingSystem,
                      platform: deviceInfo.platform,
                      name: deviceInfo.manufacturer + ' ' + deviceInfo.name,
                      webViewVersion: deviceInfo.webViewVersion,
                      implicitLogin: implicitLogin ? 1 : 0,
                      device_info: JSON.stringify(deviceInfo),
                    },
                  })
                ).data
              ),
            };
            await db.set('afterLoginInfo@' + users.current, JSON.stringify(erp.info));
            voip_push_init();
            return new Promise((resolve,reject)=>{
                resolve(1)
            })
	    }catch(error){
	        return new Promise((resolve,reject)=>{
                reject(1)
            })
	    }
	    
	}).then(async()=>{
	    debugger
	    //await userReady();
			mainView.router.back();
			app.preloader.hide();
// 			window.globalUpdate = true
// 			$(".profile_title").html(tran(erp.info.profile.profile_name));
            setTimeout(()=>{
                mainView.router.refreshPage()
            },500)
	}).catch((e)=>{
	    app.preloader.hide();
	});
	}catch(error){

	}
};
window.iot_switch_profile_for_save = (profile_name)=>{
    const TAG = "ERP >>>iot_switch_profile_for_save";
    console.log(TAG)
    app.preloader.show();
    //let prev_profile_id = frappe.user.data.app_profile_id;
    let prev_profile_id = `profile_subdevice_${erp.info.profile.name}`;
    core_mqtt_unsubscribe(prev_profile_id, false).then(()=>{
	    return core_mqtt_subscribe(profile_name, 0, false);
	}).then(()=>{
	    return http.request("/api/resource/User%20Settings", {
    		method:"POST",
        	serializer: 'json',
    		data:{"data": {active_profile:profile_name,owner:users[users.current].usr,app_id:users[users.current].app_id}}
    	});
	}).then((rs)=>{
	}, ()=>{
	    return http.request("/api/resource/User%20Settings/"+encodeURIComponent(users[users.current].app_id+"-"+users[users.current].usr), {
    		method:"PUT",
    		serializer: 'json',
    		data:{"data": {active_profile:profile_name}}
    	})
	}).then(async()=>{
	    await userReady();  
	    app.preloader.hide();
	}).catch((e)=>{
	    app.preloader.hide();
	    
	    //l(TAG, "EEE="+JSON.stringify(e));
	});

}