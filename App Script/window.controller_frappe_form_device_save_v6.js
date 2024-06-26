window.controller_frappe_form_device_save = function(){
    const TAG = "ERP >>> controller_frappe_form_device_save";
    app.preloader.show();
	let data = app.form.convertToData('#frappe-form');
	let profile_id = erp.info.profile.name;
	let guid = data.guid;
  let mac = window.core_utils_get_mac_address_from_guid(guid).replace(/:/g, '');
	let model = data.model
	let mode = "";
	let hide_device = data.hide_device;
	//if check the device hide
	let list = [];
	let dbkey = 'hidden_peripherals';
	let itemkey = `IR Setup_hidden_${guid}`;
	//first get the exist data
	db.get('hidden_peripherals').then((rs)=>{
			if(rs){
					list = JSON.parse(rs);
					let check_status = hide_device.length>0?true:false;
					let index = list.indexOf(itemkey);
					if(list.indexOf(itemkey) == -1 && check_status){
							list.push(itemkey);
					}
					db.set(dbkey,JSON.stringify(list))
			}else{
					list.push(itemkey);
					db.set(dbkey,JSON.stringify(list))
			}
	})
	//data.hide_device = '';
	let device_models = erp.doctype.device_model
  for(let i in device_models){
    if(device_models[i].name == model){
      mode = device_models[i].mode
    }
  }
	console.log(data)
	//delete data.guid;
	//l(TAG, "guid="+guid);
	let subdevice_name = data.name;
	let device_batch = erp.doctype.device_batch[peripheral[guid].getProp().hexBatch.toUpperCase()];
	//get the profile device name
	//post to the erp
	//let url = '/api/method/save.subdevice';
	//let method = 'POST';
	let postData = {
		title:data.title,
		guid : guid,
		model:model,
		device_mode:mode,
		peripheral:core_utils_get_mac_address_from_guid(guid).replace(/:/g, ''),
		device_button_group : data.device_button_group,
		parent : erp.info.profile.name,
		batch : isset(device_batch)?device_batch.batch_id:'YO0012',
		firmware : peripheral[guid].getProp().firmware || 0,
		profile_room : data.profile_room,
		password : peripheral[guid].getProp().password,
		mac_address: core_utils_get_mac_address_from_guid(guid),
		subdevice_name : subdevice_name
	}
	http.request('/api/method/save.subdevice', {
		method: 'POST',
		serializer: 'json',
    responseType: 'json',
		data:postData,
	}).then(async(rs)=>{
		if(rs.data.message !='Invalid Profile'){
			let rsData = rs.data.message;
			const profile_device = rsData.profile_device;
			let profile_device_name = '';
			profile_device.forEach(item => {
				if(item.device == guid){
					profile_device_name = item.name;
				}
			});
			try{
				//change the ir setting
				let check_status = hide_device.length>0?true:false;
				if(check_status && profile_device_name){
					let this_url = "/api/resource/Profile%20Device/"+encodeURI(profile_device_name);
					await http.request(this_url, {
						method: 'PUT',
						serializer: 'json',
						responseType: 'json',
						data:{
							"hidden_scan" : 1
						},
					})
				}
				let update_status = await ha_profile_ready();
				app.preloader.hide();
				mainView.router.back(mainView.history[mainView.history.length-6],{force:true});
				//emitter.off('refresh');
				setTimeout(()=>{
					emitter.emit('refresh',{page : 'save_subdevice'});
				},500)
				
			}catch(err){
					app.dialog.alert(_(err));
			}
		}
	}).catch((error)=>{
		app.dialog.alert(_(error))
	})
	return;

	var url = "/api/resource/Device/"+guid;
	var method = "GET";
	l(TAG, "url="+url);
	app.preloader.show();
	http.request(url,{
		method: method,
		dataType: 'json',
		contentType:'application/json',
	}).then((rs)=>{
	    l(TAG, JSON.stringify(rs.data));
	}, (error)=>{
		l(TAG, JSON.stringify(rs.data));
    	url = "/api/resource/Device";
    	method = "POST";
    	let pddata = {guid:guid,password:"000000",batch:"YO0007"};
		return http.request(url,{
			method: method,
			dataType: 'json',
			serializer: "json",
			data:pddata,
			contentType:'application/json',
		});
	}).then((rs)=>{
		console.log('device is:')
		console.log(rs)
        url = "/api/resource/Profile%20Device?parent=Profile&fields=%5B%22*%22%5D&"+encodeURI('filters=[["parent", "=", "'+profile_id+'"], ["device","=","'+guid+'"]]');
	    method = 'GET';
	    
	    return http.request(url,{
    		method: method,
    		dataType: 'json',
    		contentType:'application/json',
			serializer: "json",
			responseType : 'json'
    	});
	}).then((rs)=>{
		console.log('Profile Device is:')
		console.log(rs)
		url = "/api/resource/Profile%20Device";
		method = "POST";
		
		if(isset(rs.data) && isset(rs.data.data) && isset(rs.data.data[0])){
			url = "/api/resource/Profile%20Device/"+encodeURI(rs.data.data[0]['name']);
			method = "PUT";
		}
		
		var pddata = {device:guid,password:"000000",parenttype:'Profile',parent:profile_id,parentfield:'profile_device',device_name:mac,"device_model":model,"device_mode" : mode};

		return http.request(url,{
			method: method,
			dataType: 'json',
			serializer: "json",
			data:pddata,
			contentType:'application/json',
		});
	}).then((rs)=>{
		let resdata = JSON.parse(rs.data)
		data['profile_device'] = resdata.data.name;
    data['device_mode'] = mode;
		console.log('create profile_device success')
		console.log(rs)
		url = data['url'];
		method = data['method'];
    	delete data['url'];
    	delete data['doctype'];
    	delete data['method'];
		delete data['idx'];
		console.log("this data is :")
		console.log(resdata)
		return http.request(url,{
			method: method,
			dataType: 'json',
			serializer: "json",
			data:data,
			contentType:'application/json',
		});
	}).catch((error)=>{
		//l(TAG, window.sprintf("Load %s with error %s",mainView.router.currentRoute.url,error));
		console.log(error,"error");
	}).then(()=>{
		//mainView.router.back('/');
		setTimeout(()=>{
        app.ptr.refresh('.frappe-detail-ptr-content');
        //userReady();
        ha_profile_ready();
				setTimeout(()=>{
					app.preloader.hide();
					mainView.router.back(mainView.history[mainView.history.length-6],{force:true});
				},500)
		},500)
	});
	
	
	/*
	var url = "/api/resource/Profile%20Device?parent=Profile&fields=%5B%22*%22%5D&"+encodeURI('filters=[["parent", "=", "'+profile_id+'"], ["device","=","'+guid+'"]]');
	var method = 'GET';
	
	l(TAG, "url="+url);
	
	app.preloader.show();
	http.request({
		url: url,
		method: method,
		dataType: 'json',
		contentType:'application/json',
	}).then((rs)=>{
		url = "/api/resource/Profile%20Device";
		method = "POST";
		
		if(isset(rs.data) && isset(rs.data.data) && isset(rs.data.data[0])){
			url = "/api/resource/Profile%20Device/"+encodeURI(rs.data.data[0]['name']);
			method = "PUT";
		}
		
		var pddata = {device:guid,password:"000000",parenttype:'Profile',parent:profile_id,parentfield:'profile_device',device_name:guid};

		return http.request({
			url: url,
			method: method,
			dataType: 'json',
			data:pddata,
			contentType:'application/json',
		});
	}).then((rs)=>{
		data['profile_device'] = rs.data.data.name;

		url = data['url'];
		method = data['method'];
    	delete data['url'];
    	delete data['doctype'];
    	delete data['method'];

		return http.request({
			url: url,
			method: method,
			dataType: 'json',
			data:{"data":data},
			contentType:'application/json',
		});
	}).catch((error)=>{
		//l(TAG, window.sprintf("Load %s with error %s",mainView.router.currentRoute.url,error));
		print_r(error,"error");
	}).then(()=>{
		mainView.router.back('/',{ignoreCache:true, force:true});
		app.preloader.hide();
	});
	*/
};