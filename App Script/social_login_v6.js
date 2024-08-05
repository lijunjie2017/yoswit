/********************************************************************************************/
/*                                                                                          */
/* in UI, func="XXXX" without erp.script.                                                   */
/* in code, use erp.script.XXXX()                                                           */
/* if want to use function name directly, please add below line at the end of this textarea */
/* window.XXXX = erp.script.XXXX                                                            */
/*                                                                                          */
/********************************************************************************************/
window.social_login = async (params) => {
	implicitLogin = params.implicit || false;
	
	let data = {usr:"", pwd:"", device:"mobile"};
	if(isset(params.usr) && isset(params.pwd)){
		data.usr = params.usr;
		data.pwd = params.pwd;
	}else{
		data = app.utils.extend(data, app.form.convertToData('#social-login-form'));

		if(data.usr.trim() == '' || data.pwd.trim() == ''){
			return;
		}
		app.preloader.show();
	}
	let erpUrl = params.ref;


	// logout current user in current erp to get oauth link (logout dev.mob-mob.com to get iotapphp.tgt.hk)

	try{
		await http.request('/api/method/logout', {
			method: "POST",
			dataType: 'json',
			data:{},
		});
	}catch(e){
	}

	let content = {};
	try{
		content = await http.request('/login');
	}catch(e){}

	if(!isset(content.data)){ // fail to get the page which have oauth link
		
	}

	let oauthUrl = "";
	let div = document.createElement("div");
	div.innerHTML = content.data;
	$(div).find('a').each(function(){
		if($(this).attr('href') && $(this).attr('href').includes(erpUrl)){
			oauthUrl = $(this).attr('href');
		}
	});

	// login provider's erp to get oauth token (logout and login iotapphp.tgt.hk to get token)
	let userInfo;
	try{
		await http.request(erpUrl+'/api/method/logout', {
			method: "POST",
			dataType: 'json',
			data:{},
		});
	}catch(e){
	}
	try{
		userInfo = await http.request(erpUrl+'/api/method/login', {
			method: "POST",
			data: data,
			xhrFields: { withCredentials: true },
			cache: false,
			ContentType:'application/json',
			responseType: 'json'
		});
	}catch(e){
		app.preloader.hide();
		let message = JSON.parse(e)['message'];
		if(message && !isset(params.implicit)){
			app.dialog.alert(_(message));
			return;
		}
	}
	
	if(userInfo){
		let redirectUrl = "";
		try {
			let info = await http.request(oauthUrl, {
				method: "GET"
			});
			console.log("info="+JSON.stringify(info));
		} catch (e) {
			if(e.includes('Redirecting...')){
				div = document.createElement("div");
				div.innerHTML = e;
				$(div).find('a').each(function(){
					if($(this).attr('href')){
						redirectUrl = $(this).attr('href');
						redirectUrl = redirectUrl.replace('http://', 'https://')
						redirectUrl = redirectUrl.replace(erpUrl, '');
					}
				});
			}
		}
		if(redirectUrl==""){ // no redirect link

		}

		console.log("redirectUrl="+erpUrl+redirectUrl);

		// let authInfo;

		try {
			cordova.plugin.http.setFollowRedirect(false);
			let authInfo = await http.request(erpUrl+redirectUrl, {
				method:'GET',
				xhrFields: { withCredentials: true },
				cache: false
			});
		} catch (e) {
			console.log(JSON.stringify(e));
			if(e.includes('Redirecting...')){
				div = document.createElement("div");
				div.innerHTML = e;
				$(div).find('a').each(function(){
					if($(this).attr('href')){
						redirectUrl = $(this).attr('href');
					}
				});
			}
		}
		
		console.log("redirectUrl="+redirectUrl);

		try {
			cordova.plugin.http.setFollowRedirect(false);
			await http.request(redirectUrl,{
				method: 'GET'
			});
		} catch (error) {
			console.log(JSON.stringify(error));
		}

		let logged_user;
		try {
			logged_user = await http.request('/api/method/frappe.auth.get_logged_user',{
				method: 'GET',
			});
		} catch (error) {
		}
		
		// get cookie detail
		let temp = logged_user['headers']['set-cookie'].split(';');
		for(let i in temp){
			if(temp[i].trim().startsWith('Path=/,') || temp[i].trim().startsWith('SameSite=Lax,')){
				let keypair = temp[i].trim().replace('Path=/,','').replace('SameSite=Lax,','').split('=');
				if(keypair.length<2) continue;
				
				keypair[0] = keypair[0].trim();
				keypair[1] = keypair[1].trim();
				if(keypair[0]=='user_id'){
					data.usr = keypair[1].replace('%40','@');
					break;
				}
			}
		}
		let key = data.usr + '@' + erp.appId;

		//login success
		if(!isset(users[key])){
			users[key] = {};
		}
		delete data.device;


		// set erp detail
		users[key] = app.utils.extend(users[key], data);
		users[key].gateway = deviceInfo.deviceId+'-'+data.usr;
		users[key].app_id = erp.appId;
		users[key].app_api_url = erp.setting.app_api_url;
		users[key].logo = erp.setting.logo;
		users[key].social_login = true;
		users[key].social_app_api_url = erpUrl;
		users[key].social_usr = data.usr;
		users[key].social_pwd = data.pwd;
		
		
		if(erp.setting.app_api_url.startsWith('https://h1.tgt.hk')){
		    let url = `https://h1.tgt.hk/api/resource/User/${encodeURI(data.usr)}`;
		    let newdata = {
                "new_password": data.pwd,
                "logout_all_sessions": 0
            };
            let method = 'PUT';
            
            try{
                await http.request(url, {
            		method: method,
            		serializer: 'json',
            		data:{data:newdata}
            	});
    			users[key].social_login = false;
    			users[key].social_app_api_url = '';
    			users[key].social_usr = '';
    			users[key].social_pwd = '';
        		users[key].usr = data.usr;
        		users[key].pwd = data.pwd;
            }catch(e){
            }
		}

		// set cookie detail
		for(let i in temp){
			if(temp[i].trim().startsWith('Path=/,') || temp[i].trim().startsWith('SameSite=Lax,')){
				let keypair = temp[i].trim().replace('Path=/,','').replace('SameSite=Lax,','').split('=');
				if(keypair.length<2) continue;

				keypair[0] = keypair[0].trim();
				keypair[1] = keypair[1].trim();
				users[key][keypair[0]] = decodeURI(keypair[1]);
				try {
					if(keypair[0]=='user_image'){
						users[key][keypair[0]] = await http.downloadToFile(erp.setting.app_api_url+keypair[1], md5(keypair[1]));
					}
				} catch (error) {
					
				}
			}
		}
		users['current'] = key;

		// change the default app to current login one
		if(isset(appInfo.virtualId) && appInfo.virtualId!=""){
			appInfo.id = appInfo.virtualId;
			appInfo.virtualId = null;
			await db.set('appInfo', JSON.stringify(appInfo));
		}
		
		// reload app setting
		let networkAppSetting = JSON.parse((await http.request('/api/method/appv6.getAppSetting?appId='+erp.appId, {
			timeout:60
		})).data).config;
		if(isset(erp.settings[erp.appId])){ // update
			erp.settings[erp.appId] = {...erp.settings[erp.appId], ...networkAppSetting};
			await db.set('appSettings', JSON.stringify(erp.settings));
		}else{
			erp.settings[erp.appId] = {...networkAppSetting};
			await db.set('appSettings', JSON.stringify(erp.settings));
		}
	
		// reload master
		erp.doctype = {};
		erp.script = {};
		erp.pageScript = {};
		erp.doctype = JSON.parse(await db.get(erp.appId+"_master")) || {};
		let timeout = 5;
		erp.doctype = app.utils.extend(erp.doctype, JSON.parse((await http.request("/api/method/appv6.getMaster?modified="+(erp.doctype.modified||'1970-01-01 00:00:00'), {
			timeout:timeout,
			cacheStrategy: false
		})).data));
		db.set(erp.appId+"_master", JSON.stringify(erp.doctype));
		if(isset(erp.doctype.app_script)){
			let errorScript = [];
			for(let i in erp.doctype.app_script){
				if(erp.doctype.app_script[i].status == 'Deprecated') continue;
				try {
					eval(erp.doctype.app_script[i].javascript);
				} catch (e) {
					errorScript.push(i);
				}
			}
			if(errorScript.length>0)
				app.dialog.alert(_('The below script(s) have error, please fixed.<br />')+errorScript.join("<br />\n"));
		}

		await theme.setMode(appInfo.themeMode, appInfo.id);
	}else{
		let key = data.usr + '@' + erp.appId;
		delete users[key];
		users['current'] = null;
	}

	await db.set('users', JSON.stringify(users));

	app.preloader.hide();
	everythingReady();
};