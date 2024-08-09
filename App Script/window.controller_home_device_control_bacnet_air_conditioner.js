window.controller_home_device_control_bacnet_air_conditioner = function(params) {
	const TAG = "ERP >>> controller_home_device_control_bacnet_air_conditioner";
	l(TAG, "");
	let configString = params.obj.attr('config');
	let signal = params.obj.attr('button-signal');
	let subdevice_name = params.obj.closest('li').attr('subdevice-name');
	let ref = params.obj.attr('ref');
	l(TAG, "ref=" + ref);
	let config = configString.split("|");
	let airconfig = config[5].split(",");
	let temp = config[0].split(".");
	let deviceCode = temp[0];
	let tagCode = temp[1];
	temp = tagCode.split("_");
	let roomCode = temp[0];
	let message = [];
	if (signal == "1") {
		if (airconfig[0] == "1") {
			$('li.subdevice[subdevice-name="' + subdevice_name + '"]').addClass('refonoff-0');
			airconfig[0] = "0";
		} else {
			$('li.subdevice[subdevice-name="' + subdevice_name + '"]').removeClass('refonoff-0');
			airconfig[0] = "1";
		}
		params.obj.attr('ref', airconfig[0]);
		message.push({
			"operate": "write",
			"deviceCode": deviceCode,
			"tagCode": roomCode + "_ONOFF_CTRL",
			"val": airconfig[0] + ""
		});
	} else if (signal == "2") {
		let button_name = "COOL";
		if (airconfig[1] == 2) {
			button_name = "DRY";
			airconfig[1] = 4;
		} else if (airconfig[1] == 4) {
			button_name = "AIR S";
			airconfig[1] = 8;
		} else if (airconfig[1] == 8) {
			button_name = "HEAT";
			airconfig[1] = 16;
		} else if (airconfig[1] == 16) {
			airconfig[1] = 2;
		}
		params.obj.find('div').html(button_name);
		message.push({
			"operate": "write",
			"deviceCode": deviceCode,
			"tagCode": roomCode + "_MODE_CTRL",
			"val": airconfig[1] + ""
		});
	} else if (signal == "3") {
		let button_name = "HIGH";
		if (airconfig[2] == 2) {
			button_name = "MED";
			airconfig[2] = 4;
		} else if (airconfig[2] == 4) {
			button_name = "LOW";
			airconfig[2] = 8;
		} else if (airconfig[2] == 8) {
			airconfig[2] = 2;
		}
		params.obj.find('div').html(button_name);
		message.push({
			"operate": "write",
			"deviceCode": deviceCode,
			"tagCode": roomCode + "_SPEED_CTRL",
			"val": airconfig[2] + ""
		});
	} else if (signal == "4") {
		airconfig[3] = airconfig[3] * 1;
		if (airconfig[3] <= 16) {
			return;
		}
		airconfig[3]--;
		$('li.device[subdevice-name="' + subdevice_name + '"]').find('a[button-signal="5"]').html(airconfig[3] + '°C');
		$('li.subdevice[subdevice-name="' + subdevice_name + '"]').find('a[button-signal="5"]').html(airconfig[3] + '°C');
		airconfig[3] += "";
		message.push({
			"operate": "write",
			"deviceCode": deviceCode,
			"tagCode": roomCode + "_CONTROL_ROOM_TEMP_SETPOINT",
			"val": airconfig[3] + ""
		});
	} else if (signal == "6") {
		airconfig[3] = airconfig[3] * 1;
		if (airconfig[3] >= 32) {
			return;
		}
		airconfig[3]++;
		$('li.device[subdevice-name="' + subdevice_name + '"]').find('a[button-signal="5"]').html(airconfig[3] + '°C');
		$('li.subdevice[subdevice-name="' + subdevice_name + '"]').find('a[button-signal="5"]').html(airconfig[3] + '°C');
		airconfig[3] += "";
		message.push({
			"operate": "write",
			"deviceCode": deviceCode,
			"tagCode": roomCode + "_CONTROL_ROOM_TEMP_SETPOINT",
			"val": airconfig[3] + ""
		});
	}
	config[5] = airconfig.join(",");
	params.obj.attr('config', config.join("|"));
	$('li.device[subdevice-name="' + subdevice_name + '"]').find('*[config]').attr('config', config.join("|"));
	$('li.subdevice[subdevice-name="' + subdevice_name + '"]').find('*[config]').attr('config', config.join("|"));
	restful.request({
		url: '/api/resource/Profile%20Subdevice/' + subdevice_name,
		method: 'PUT',
		dataType: 'json',
		data: {
			config: config.join("|")
		},
		contentType: 'application/json',
	});
	l(TAG, JSON.stringify(message));
	message = JSON.stringify(message);
	cordova.plugin.innocow.mqtt.execute({
		command: "publish",
		id: (Math.floor(Math.random() * 100000) + 1),
		topic: config[1],
		msg: message,
		qos: 0,
		retained: false
	}, function() {}, function() {});
};