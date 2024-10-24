window.app_set_device_hidden = function(params) {
	var device_name = params.ref;
	var data = {
		name: device_name,
		hidden: 0
	};
	if (params.obj.hasClass("color-green")) {
		data.hidden = 1;
		params.obj.removeClass("color-green").addClass("color-cust-grey");
		params.obj.find(".material-icons").html("visibility_off");
	} else {
		data.hidden = 0;
		params.obj.removeClass("color-cust-grey").addClass("color-green");
		params.obj.find(".material-icons").html("visibility");
	}
	app.swipeout.close(params.obj.closest('li.swipeout'));
	var url = "/api/resource/Profile%20Subdevice/" + encodeURI(device_name);
	var method = "PUT";
	http.request(url, {
		method: method,
		serializer: 'json',
		data:{data:data},
	}).then(()=>{
        app.ptr.refresh('.frappe-list-ptr-content');
        ha_profile_ready();
    }).then(()=>{
        window.globalUpdate = true;
    })
};

window.app_set_device_hidden_unassigned = (params)=>{
    const TAG = "app_set_device_hidden_unassigned";
    const key = params.ref;
    if(params.obj.hasClass("color-green")){
        params.obj.removeClass("color-green").addClass("color-cust-grey");
		params.obj.find(".material-icons").html("visibility_off");
    }else{
        params.obj.removeClass("color-cust-grey").addClass("color-green");
		params.obj.find(".material-icons").html("visibility");
    }
    let list = [];
    let index = 0;
    for(let i in erp.hidden_peripherals){
        if(i == key){
            delete erp.hidden_peripherals[i];
            index++;
        }
    }
    if(index == 0){
        erp.hidden_peripherals[key] = {"hidden":true}
    }
    for(let i in erp.hidden_peripherals){
        list.push(i);
    }
    db.set('hidden_peripherals',JSON.stringify(list));

    app.ptr.refresh('.frappe-list-ptr-content');
};