window.in_searching_replace_device = false;
window.core_device_replace_original_device = {};
window.core_device_replace_simple_flag = false;
window.core_device_replace_search_device = function(params){
	//controller_replace_current_ref = params.ref;
	
	
	let temp = params.ref.split("|");
	if(!isset(temp[3])){
	    core_device_replace_simple_flag = true;
	}else{
	    core_device_replace_simple_flag = false;
	}
	
	if(core_device_replace_simple_flag){
    	core_device_replace_original_guid = "";
    	core_device_replace_original_device.device_name = temp[0];
    	core_device_replace_original_device.password = temp[1]=="000000" ? "000000" : temp[1];
	}else{
    	core_device_replace_original_guid = temp[0];
    	core_device_replace_original_device.guid = temp[0];
    	core_device_replace_original_device.device_name = temp[1];
    	core_device_replace_original_device.password = iot_ble_get_password(temp[0]);
    	core_device_replace_original_device.mode = temp[2];
    	core_device_replace_original_device.settings = temp[3].split(",");
    	core_device_replace_original_device.hex_model = temp[4];
    	core_device_replace_original_device.hex_batch = temp[5];
    	core_device_replace_original_device.ori_model = temp[6];
    	core_device_replace_original_device.ori_batch = temp[7];
			core_device_replace_original_device.name = temp[8];
	}
	
	
	// Create dynamic Sheet
	var dynamicSheet = app.sheet.create({
		content: 	'<div class="sheet-modal">'+
						'<div class="toolbar">'+
							'<div class="toolbar-inner">'+
								'<div class="right">'+
									'<a class="link" func="core_device_replace_update_search_device"><i class="material-icons">refresh</i></a>'+
								'</div>'+
								'<div class="right">'+
									'<a class="link show-more-button" func="core_device_replace_update_show_more_device" show-more="false"><span style="font-size:18px;">'+_('more')+'</span><i class="material-icons text-color-gray" style="font-size:50px;">toggle_off</i></a>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="sheet-modal-inner"><div class="page-content replace-device-page-content"><div class="block">'+
						'</div></div></div>'+
					'</div>',
		// Events
		on: {
			open: function (sheet) {
				in_searching_replace_device = true;
				core_device_replace_update_search_device(core_device_replace_original_device);
			},
			opened: function (sheet) {
				console.log('Sheet opened');
	            //alert(JSON.stringify(core_device_replace_original_device));
			},
			close: function (sheet) {
			    /*
				console.log('Sheet close');
				controller_replace_current_ref = "";
				controller_replace_peripheral_detail = ""
				controller_replace_target_peripheral = null;
				controller_replace_final_guid = "";
				clearTimeout(window.timers.controller_replace_refresh);
				*/
				in_searching_replace_device = false;
			},
			closed: function (sheet) {
			    /*
				console.log('Sheet closed');
				controller_replace_current_ref = "";
				controller_replace_peripheral_detail = ""
				controller_replace_target_peripheral = null;
				controller_replace_final_guid = "";
				clearTimeout(window.timers.controller_replace_refresh);
				*/
			},
		}
	});

	// Open dynamic sheet
	dynamicSheet.open();
};