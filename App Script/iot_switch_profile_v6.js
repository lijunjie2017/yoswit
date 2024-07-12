window.iot_switch_profile = async(params)=>{
    const TAG = "ERP >>> window.iot_switch_profile";
	if(!isset(params.ref)) return;
	
	//lastRoomRef = 0
	app.preloader.show();
	//unsubscribe the gateway list 
	if(isset(window.gateway_lists && window.gateway_lists)){
	    for(let i in gateway_lists){
	        let topic = `status/${md5(md5(gateway_lists[i]))}`;
            let will_topic = `will/${md5(md5(gateway_lists[i]))}`;
            await core_mqtt_unsubscribe(topic,false);
            await core_mqtt_unsubscribe(will_topic,false);
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
			await core_mqtt_unsubscribe(cmd_topic,false);
			emitter.off(cmd_topic);
		} else { // other gateway, need to listen to status and will

			//check if gateway is online / offline
			const will_topic = `will/${gatewayhash}`;
			await core_mqtt_unsubscribe(will_topic,false);
			emitter.off(will_topic);
			//get the devices' status from gateway
			const status_topic = `status/${gatewayhash}`;
			await core_mqtt_unsubscribe(status_topic,false);
			emitter.off(status_topic);
		}
	}
	let prev_profile_id = erp.info.profile.name;
	let prev_topic_id = `profile_subdevice_${erp.info.profile.name}`
	core_mqtt_unsubscribe(prev_profile_id, false).then(()=>{
	    return core_mqtt_subscribe(params.ref, 0, false);
	}).then(()=>{
		return core_mqtt_unsubscribe(prev_topic_id, false);
	}).then(()=>{
	    return http.request("/api/resource/User%20Settings", {
    		method:"POST",
        	serializer: 'json',
    		data:{"data": {active_profile:params.ref,owner:users[users.current].usr,app_id:appInfo.id}}
    	});
	}).then((rs)=>{
	}, ()=>{
	    return http.request("/api/resource/User%20Settings/"+encodeURIComponent(appInfo.id+"-"+users[users.current].usr), {
    		method:"PUT",
    		serializer: 'json',
    		data:{"data": {active_profile:params.ref}}
    	})
	}).then(()=>{
	    //del the local_scanned_periperals
	    window.peripheral = {};
	}).then(async()=>{
	    await userReady();
			mainView.router.back();
			app.preloader.hide();
	}).catch((e)=>{
	    app.preloader.hide();
	});
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