window.iot_ble_generate_ir_code_for_rw = function(json_data, button_signal, data){
	//'ir|0|25,1,2,1,0,1'; //ir|0|tem,speed,direction,swing,onoff,mode
	const TAG = "ERP >>> controller_common_get_ir_signal_for_rw";
	console.log("data",data)
	l(TAG, "code="+json_data);
	let json_map = null;
	let configList = data.split(',');
	try{
		json_map = JSON.parse(json_data);
	}catch(error){
		json_map = {
			"file_code" : ''
		}
	}
	//get the key code
	let key_code = 0;
	if(button_signal == 'ARC_MODE'){
		key_code = 1;
	}else if(button_signal == 'ARC_ADD_TEMP'){
		key_code = 2;
	}else if(button_signal == 'ARC_REDUCE_TEMP'){
		key_code = 3;
	}else if(button_signal == 'ARC_SPEED'){
		key_code = 9;
	}else if(button_signal == 'ARC_SWING'){
		key_code = 11;
	}
	//get the file code
	let ircode = '';
	let file_code = json_map['file_code'];
	let airDefaultValue = {
		temp: configList[0]?configList[0]:25,//default temp	
		mode: configList[5]?configList[5]:0,//default mode 
		fan: configList[1]?configList[1]:0,//default fan
		swing: 1,//default swing
		power: isset(configList[4])?configList[4]:1,//default power
		wind: isset(configList[3])?configList[3]:0,//default wind
	}
	//get the air status
	const getAirCommand = (obj)=>{

		//old code : 2 cool 5 heat 4 fan   
		// fan 2 (1speed) 3(2speed) 4(3speed) 1(auto)
		/* 
		972107+01+sub_category+key_code+ac_power+ac_temp+ac_mode+ac_wind_dir+ac_wind_speed+change_wind_direction+file
		key_code: 0 电源 1 模式 2 温度+ 3 温度-  7 	温度+ 8 温度- 9 风力 10 扫风 11 固定风
		ac_power: 0 开启，1 关闭
		mode(ac_mode): 0 制冷，1 制热，2 自动，3 送风，4 除湿
		ac_wind_speed : 0 自动，1 弱风，2 中风，3 强风
		ac_temp: 0-14, 16-30
		ac_wind_dir: 0,1
		change_wind_direction: 0 不切换；1 切换
		*/
		let mode = obj.mode;
		if(mode == 2){
			mode = 0;
		}else if(mode == 5){
			mode = 1;
		}else if(mode == 4){
			mode = 3;
		}
		let fan = obj.fan;
		if(fan == 2){
			fan = 1;
		}else if(fan == 3){
			fan = 2;
		}else if(fan == 4){
			fan = 3;
		}else if(fan == 1){
			fan = 0;
		}
		let command = '';
    let pre_command = `972107`;
		let onoff = obj.power == 0 ? '01' : '00';
		command = `${pre_command}0101${parseInt(key_code).toString(16).padStart(2, '0')}${onoff}${parseInt(obj.temp - 16).toString(16).padStart(2, '0')}${parseInt(mode).toString(16).padStart(2, '0')}${parseInt(obj.swing).toString(16).padStart(2, '0')}${parseInt(fan).toString(16).padStart(2, '0')}${parseInt(obj.wind == 0?1:0).toString(16).padStart(2, '0')}${file_code}`;
		return command;
	}
	ircode = getAirCommand(airDefaultValue);
	l(TAG, "ircode="+ircode);
	return ircode;
};