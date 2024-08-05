/********************************************************************************************/
/*                                                                                          */
/* in UI, func="XXXX" without erp.script.                                                   */
/* in code, use erp.script.XXXX()                                                           */
/* if want to use function name directly, please add below line at the end of this textarea */
/* window.XXXX = erp.script.XXXX                                                            */
/*                                                                                          */
/********************************************************************************************/
erp.script.change_property = async (params) => {
    let app_settings = {...erp.doctype.app_settings[params.ref]};
    
    let foundUser = false;
    for(let key in users){
        if(key=='current') continue;
        if(users[key].app_id==params.ref){
            $("#splashScreen").removeClass('hide').show();
            foundUser = true;
            erp.script.switch_account({ref:key});
            break;
        }
    }
    if(!foundUser){
        if(isset(users.current) && isset(users[users.current])  && isset(users[users.current].app_id) && users[users.current].app_id == 'hk.tgt.h1lifestyle'){
            app.dialog.confirm(_('Login with H1 Lifestyle?'), async function(){
                app.preloader.show();
                $("#splashScreen").removeClass('hide').show();
                
                
                let erpUrl = app_settings.app_api_url;
                let appId = params.ref;
        		let networkAppSetting = JSON.parse((await http.request(erpUrl+'/api/method/appv6.getAppSetting?appId='+appId, {
        			timeout:5
        		})).data).config || {};
    
            	if(isset(networkAppSetting.modified)){
            	    if(isset(erp.settings[appId])){ // update
        	    		erp.settings[appId] = {...erp.settings[appId], ...networkAppSetting};
        				await db.set('appSettings', JSON.stringify(erp.settings));
            	    }else{
            	    	erp.settings[appId] = {...networkAppSetting};
            			await db.set('appSettings', JSON.stringify(erp.settings));
            	    }
            	}
        
        		appInfo.virtualId = appId;
        		await theme.setMode(appInfo.themeMode, appId);
        		
        		erp.doctype = {};
        		erp.script = {};
        		erp.pageScript = {};
                erp.doctype = JSON.parse(await db.get(appId+"_master")) || {};
                let timeout = (isset(erp.doctype.app_script) ? 60 : 5);
            	erp.doctype = app.utils.extend(erp.doctype, JSON.parse((await http.request(erpUrl+"/api/method/appv6.getMaster?modified="+encodeURI(erp.doctype.modified||'1970-01-01 00:00:00'), {
            		timeout:timeout,
								cacheStrategy: false
            	})).data));
            	db.set(appId+"_master", JSON.stringify(erp.doctype));
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
                
            	social_login({
            		usr:users[users.current].usr,
            		pwd:users[users.current].pwd,
            		ref:users[users.current].app_api_url
            	});
            }, function(){
                erp.script.download_and_apply_app_setting({ref:app_settings.app_api_url+"|"+params.ref});
            });
        }else{
            //erp.script.download_and_apply_app_setting({ref:app_settings.app_api_url+"|"+params.ref});
            f7.loadWebPage('mobile-app/login', {allow_cancel:true});
        }
    }
};