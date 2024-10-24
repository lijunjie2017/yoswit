window.core_device_replace_update = false;
window.core_device_replace_update_timer1 = null;
window.core_device_replace_update_timer2 = null;
window.core_device_replace_update_timer3 = null;
window.core_device_replace_device_obj = null;
window.core_device_replace_update_search_device = (device_obj) => {
    let new_device_obj = device_obj;
	//iot_ble_scan();
	if(device_obj){
	   core_device_replace_device_obj = device_obj;
	}else{
	    new_device_obj = core_device_replace_device_obj;
	}
    core_device_replace_update = true;
	app.preloader.show();
	_core_device_replace_update_search_device(new_device_obj);
	clearTimeout(core_device_replace_update_timer1);
	clearTimeout(core_device_replace_update_timer2);
	clearTimeout(core_device_replace_update_timer3);
	core_device_replace_update_timer2 = setTimeout(function(){
	    core_device_replace_update = false;
	}, 3000);
	
	core_device_replace_update_timer3 = setTimeout(function(){
	    app.preloader.hide();
	    ble.stopScan(function(){
        }, function(){
        });
	    clearTimeout(core_device_replace_update_timer1);
	}, 6000);
};
window.core_device_replace_update_show_more_device = ()=>{
    let more_satatus = $('.show-more-button').attr("show-more");
    console.log(more_satatus)
    if(more_satatus == "false"){
        $('.show-more-button i').removeClass("text-color-gray");
        $('.show-more-button i').text("toggle_on");
        $('.show-more-button').attr("show-more","true");
        window.core_device_replace_device_obj.show_more = true;
        
    }else{
        $('.show-more-button i').addClass("text-color-gray");
        $('.show-more-button i').text("toggle_off");
        $('.show-more-button').attr("show-more","false");
        window.core_device_replace_device_obj.show_more = false;
    }
    core_device_replace_update_search_device(window.core_device_replace_device_obj);
}
window._core_device_replace_update_search_device = (device_obj) => {
    let rssi_sort = function(a, b) {
        if(a.rssi === b.rssi){
            return 0;
        }else{
            return (a.rssi > b.rssi) ? -1 : 1;
        }
    };
    let ps = [];
    runtime.peripherals = window.peripheral;
    let modeList = cloneDeep(erp.doctype.device_model);
    let erp_device = cloneDeep(erp.info.device);
    let map_device = Object.keys(erp_device);
		if(device_obj.ori_model.includes("-IR")){
			device_obj.mode = "On Off IR"
		}
    for(let guid in runtime.peripherals){
        let p = runtime.peripherals[guid].prop;
        if(!p || !p.rssi || p.rssi >= 0 ) continue;
				console.log("device_obj",device_obj);
				console.log("modeList",modeList);
				console.log("p",p);
				let p_model = Object.values(modeList).find((e)=>e.hexid.toLowerCase() === p.hexModel.toLowerCase())
				console.log("p_model",p_model);
				if(!p_model || device_obj.mode != p_model.mode) continue;
				if(map_device.indexOf(p.guid) != -1) continue;
        ps.push(app.utils.extend({model : p_model.model_code}, p));
    }
    ps.sort(rssi_sort);
    let p2 = {};
    for(let k in ps){
        p2[ps[k].guid] = app.utils.extend({}, ps[k]);
    }
  let html = ``;
	html = `
	<div class="list media-list" style="margin-top:0px;">
		<ul>
		</ul>
	</div>
	`;
	$(".replace-device-page-content").html(html);
	let itemHtml = ``;
	let i = 0;
	for(let i in ps){
	    if(!ps[i]){
	        continue;
	    }
		if(!ps[i].rssi){
			continue;
		}
		//i++;
		//fillter the first 3
		let show_status = device_obj.show_more;
		if(i > 2 && !show_status){
			continue;
		}
		itemHtml += `
		<li>
			<div class="item-content" style="padding-left:5px;">
				<div class="item-media" style="width:75px;height:75px;background-image:url(${ps[i].img_url?ps[i].img_url:'https://my.yoswit.com/files/products/YO2086-1G.svg'});"></div>
				<div class="item-inner">
							<div class="item-title-row">
								<div class="item-title">(${ps[i].rssi}) <b>${ ps[i].model }</b></div>
							</div>
							<div class="item-subtitle">${ps[i].name.substring(0,12)}</div>
        </div>
				<div style="float:right;margin-right:10px;width:560px;">
						<a func="core_device_replace_device" ref="${ps[i].guid}|${ ps[i].model }|${ 'YO0012' }|${ ps[i].hexModel }|${ ps[i].hexBatch }" class="button button-raised button-round color-theme-bg-blue" style="width:50px;float:right;margin-left:10px;">
								<span class="material-icons">
										upgrade
								</span>    
						</a>
						<a func="core_device_flash_led" ref="${ps[i].guid}" class="button button-raised button-round button-preloader color-theme-bg-blue" style="width:50px;float:right;margin-left:10px;">
								<span class="material-icons">
										flare
								</span>    
						</a>
						<a func="iot_reset_password_peripheral" ref="${ps[i].guid}" class="button button-raised button-round button-preloader color-theme-bg-blue" style="width:50px;float:right;">
								<span class="material-icons">
										restart_alt
								</span>    
						</a>
				</div>
			</div>
		</li>
		`;
	}
	if(!itemHtml){
	    itemHtml = `
	    <div class="block" style="text-align: center">
          <span class="material-icons" style="font-size: 100px; color: #ddd">meeting_room</span>
          <p>${_('You do not have any devices')}</p>
        </div>
	    `
	    $(".replace-device-page-content .media-list").html(itemHtml);
	     $(".replace-device-page-content .media-list").removeClass("list");
	}else{
	    $(".replace-device-page-content .media-list ul").html(itemHtml);
	}
	// frappe.print.out("replace-device-page-content", true, {peripherals:p2}, "APP_HA_Replace_Device_List_V3").then((rs)=>{
	//     //alert(JSON.stringify(rs));				
	// 	//app.preloader.hide();
	// }, (error)=>{
	//     //alert(JSON.stringify(error));
	//     //app.preloader.hide();
	// }).then(()=>{
	//     if(core_device_replace_update){
	//         core_device_replace_update_timer1 = setTimeout(function(){
	//             _core_device_replace_update_search_device();
	//         }, 1000)
	//     }else{
	//         app.preloader.hide();
	//     }
	// });
};