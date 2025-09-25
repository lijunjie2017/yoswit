window.iot_ble_generate_ir_code = function(code, button_signal, data){
	const TAG = "ERP >>> controller_common_get_ir_signal";
	l(TAG, "code="+code);
	l(TAG, "button_signal="+button_signal);
	
	let ircode = "", checkSum = 0;
	
	let sourceHEXArr = code.match(/.{1,2}/g);
	let d_data = [];
	for(var k=0; k<sourceHEXArr.length; k++){
		d_data[k]= ""+parseInt(sourceHEXArr[k], 16);
		d_data[k] *= 1;
	}
	l(TAG, "button_signal3="+button_signal);
	if( button_signal=="ARC_ON_OFF"||
		button_signal=="ARC_MODE"||
		button_signal=="ARC_REDUCE_TEMP"||
		button_signal=="ARC_ADD_TEMP"||
		button_signal=="ARC_SPEED"||
		button_signal=="ARC_DIRECTION"||
		button_signal=="ARC_SWING")
	{
		if(button_signal=="ARC_ON_OFF") action_no = 1;
		else if(button_signal=="ARC_MODE") action_no = 2;
		else if(button_signal=="ARC_REDUCE_TEMP") action_no = 7;
		else if(button_signal=="ARC_ADD_TEMP") action_no = 6;
		else if(button_signal=="ARC_SPEED") action_no = 3;
		else if(button_signal=="ARC_DIRECTION") action_no = 4;
		else if(button_signal=="ARC_SWING") action_no = 5;
		
		checkSum += 48+1+d_data[0]+d_data[1];
		
		ircode += "3001"+d_data[0].toString(16).pad("00");
		ircode += d_data[1].toString(16).pad("00");
		
		var airdata = "25,1,2,1,1,4";
		if(isset(data)) airdata = data;
		
		console.log(airdata);
		let paras = airdata.split(","); //e.g. temp|volumn|menu wind|auto wind|on off|mode //temp+"|1|2|1|1|1"
		let arc_temp = paras[0]*1,
			arc_volumn = paras[1]*1,
			arc_menu_wind = paras[2]*1,
			arc_auto_wind = paras[3]*1,
			arc_on_off = paras[4]*1,
			arc_mode = paras[5]*1;
		
		if(code.length>240){
			let codeArray = JSON.parse(code.replace(/'/g, '"'));
			let codeKey = arc_on_off;
			if(codeKey == "1"){
				if(arc_auto_wind=="1"){
					codeKey = "1|"+arc_mode+"|"+arc_volumn+"|"+arc_auto_wind+"|"+arc_temp;
				}else{
					codeKey = "1|"+arc_mode+"|"+arc_volumn+"|"+arc_menu_wind+"|"+arc_auto_wind+"|"+arc_temp;
				}
			}
			l(TAG, "codeKey="+codeKey);
			
			if(isset(codeArray[codeKey])){
				sourceHEXArr = codeArray[codeKey].match(/.{1,2}/g);
				d_data = [];
				for(var k=0; k<sourceHEXArr.length; k++){
					d_data[k]= ""+parseInt(sourceHEXArr[k], 16);
					d_data[k] *= 1;
				}
				
				ircode = "3003"
				checkSum = 48+3;
				for(var i=1; i<d_data.length; i++){
					checkSum += d_data[i];
					ircode += d_data[i].toString(16).pad("00");
				}
				checkSum = checkSum.toString(16).pad("00");
				checkSum = checkSum.substring(checkSum.length-2);
				ircode += checkSum;
			}else{
				ircode = "";
			}
		}else{
		    //if click the arc_auto_wind
		    // debugger
		    // if(arc_auto_wind == 1){
		    //     if(arc_on_off == 1){
		    //         action_no = 5;
		    //     } 
		    // }
				//如果开启自动风速，默认打开手动风速
				if(arc_auto_wind == 1){
					arc_menu_wind = 1;
				}else{
					arc_menu_wind = 3;
				}
				// if(action_no == 1){
				// 	//需要读取当前状态？
				// 	arc_menu_wind = 3;
				// 	arc_auto_wind = 0;
				// }
			// alert(`arc_menu_wind=${arc_menu_wind}, arc_auto_wind=${arc_auto_wind}, action_no=${action_no}`);
			l(TAG, "checkSum2="+checkSum);
			//7B0
			checkSum += arc_temp;
			l(TAG, "checkSum3="+checkSum);	
			ircode += (arc_temp).toString(16).pad("00");
			l(TAG, "checkSum4="+checkSum);
			//7B1
			checkSum += arc_volumn;
			ircode += (arc_volumn).toString(16).pad("00");
			//7B2（手动风速，如果开启自动风速，需要默认打开手动风速）
			/*
			0x01 向上（打开上下扫风）
			0x02 中
			0x03 向下（停止上下扫风）
			默认02
			*/
			checkSum += arc_menu_wind;
			ircode += (arc_menu_wind).toString(16).pad("00");
            // checkSum += 1;
            // ircode += '01';
			//7B3
			checkSum += arc_auto_wind;
			ircode += (arc_auto_wind).toString(16).pad("00");
			//7B4
			checkSum += arc_on_off;
			ircode += (arc_on_off).toString(16).pad("00");
			//7B5
			checkSum += action_no;
			ircode += (action_no).toString(16).pad("00");
			//7B6
			checkSum += arc_mode;
			ircode += (arc_mode).toString(16).pad("00");
			//7B7
			ircode += '00';
			//7B8
			if(arc_mode == 5){
				checkSum += 1;
				ircode += '01';
			}else{
				ircode += '00';
			}
			//7B9
			checkSum += 1;
			ircode += '01';
			//7B10
			ircode += '00';
			// for(var i=9; i<d_data.length; i++){
			// 	checkSum += d_data[i];
			// 	ircode += d_data[i].toString(16).pad("00");
			// }
			checkSum = checkSum.toString(16).pad("00");
			checkSum = checkSum.substring(checkSum.length-2);
			
			ircode += checkSum;
		}
		
		
	}else{
		var _1b = button_signal*2 + 1, _2b = button_signal*2 + 2;
	
		checkSum = 48+0+d_data[0]+d_data[_1b]+d_data[_2b]+d_data[d_data.length-4]+d_data[d_data.length-3]+d_data[d_data.length-2]+d_data[d_data.length-1];
		checkSum = checkSum.toString(16).pad("00");
		checkSum = checkSum.substring(checkSum.length-2);
	
		ircode += "3000"+d_data[0].toString(16).pad("00");
		ircode += d_data[_1b].toString(16).pad("00") + d_data[_2b].toString(16).pad("00");
		ircode += d_data[d_data.length-4].toString(16).pad("00") + d_data[d_data.length-3].toString(16).pad("00") + d_data[d_data.length-2].toString(16).pad("00") + d_data[d_data.length-1].toString(16).pad("00");

		ircode += checkSum;
	}
	
	l(TAG, "ircode="+ircode);

	return ircode;
};