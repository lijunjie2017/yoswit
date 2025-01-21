window.app_erp_save_subdevice = async() => {
	app.dialog.preloader();
	let data = app.form.convertToData('#frappe-form');
	console.log("data",data);
	let device_button_group = data.device_button_group;
	let device_mode = data.device_mode;
	if(device_button_group == 'Door Open'){
		//custom set the device buzzer is disable
		let guid = data.guid;
		let command = '890d00';
		let command_1 = `89020000`;
		//check device setting is null
		//find the device setting pass the api
		try{
			let deviceMap = await http2.request(encodeURI('/api/resource/Device/' + guid), {
				method: 'GET',
				responseType: 'json',
				timeout: 60,
			});
			let device_setting = [];
			if(deviceMap.data.data && deviceMap.data.data.device_setting){
				device_setting = deviceMap.data.data.settings;
			}
			let postStatus = true;
			device_setting.forEach((item)=>{
				if(item.setting_type == 'Buzzer'){
					postStatus = false;
				}
			})
			debugger
			if(postStatus){		
				await window.peripheral[guid].write([{
					service: 'ff80',
					characteristic: 'ff81',
					data: command,
				},{
					service: 'ff80',
					characteristic: 'ff81',
					data: command_1,
				}]);
			}
		}catch(error){
			console.log("error",error);
		}
	}else if(device_mode == 'Geomagnetic' || device_mode == 'Radar Sensor' || device_mode == 'IAQ Sensor' || device_mode == 'Parking Lock' || device_mode == 'Door Sensor'){
		//setting the notification interval 60min
		let notification_interval = 3600;
		let data = `9353000004${iot_utils_to_little_endian_hex(notification_interval,4)}`;
		let guid = data.guid;
		try{
			window.peripheral[guid].write([{
				service: 'ff80',
				characteristic: 'ff81',
				data: data,
			}]);
		}catch(error){
			console.log("error",error);
		}
	}
	//debugger
	let url = '/api/method/save.subdevice';
	let method = 'POST';
	let title = data.title;
	let page_type = data.page_type;
    if(!title){
        const toast = app.toast.create({
            position: 'bottom',
            closeTimeout: 3000,
            text: tran('Device Name cannot be empty.')
        });

        toast.open();
        return
    }
	
	//debugger;
    return http.request(url, {
		method: method,
		serializer: 'json',
        responseType: 'json',
		data:data,
		debug : true
	}).then(async(rs)=>{
		  app.dialog.close();
      console.log(rs)
	    if(rs.data.message=='Invalid Profile'){
	        
	    }else{
				//update the value of device_models
				let data = rs.data.message
				const profile_subdevice = data.profile_subdevice
				// for(let i in profile_subdevice){
				// 	const guid = profile_subdevice[i].device;
				// 	const hexid = guid.substring(guid.length - 6, guid.length - 2);
				// 	if(erp.doctype.device_model[hexid].mode != profile_subdevice[i].device_mode){
				// 		window.device_models[hexid].mode = profile_subdevice[i].device_mode
				// 		//del unassigned same guid device
				// 		$('#room-0-div ul li.home-scanned-peripheral[guid="'+profile_subdevice[i].device+'"]').forEach((ele)=>{
				// 			$(ele).remove()
				// 		})
				// 	}
				// }
				try{
				    let update_status = await ha_profile_ready(2);
				    window.globalUpdate = true;
				    //emitter.off('refresh');
				    
				}catch(err){
				    alert(err);
				}
				if(page_type == 1){
					mainView.router.back(mainView.history[mainView.history.length-3],{force:true});
				}else{
					mainView.router.back();
					app.ptr.refresh(".frappe-detail-ptr-content");
				}
	    }
	}).catch((err)=>{
		app.dialog.close();
		app.dialog.alert(err);
	});
};
