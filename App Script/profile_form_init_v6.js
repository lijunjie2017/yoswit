window.profile_form_init = function(Lists){
    $('.sure-icon').click(async()=>{
        let thisName = $('input[name=name]').val() || ''
        let THISURL = '/api/resource/Profile'
        let created_form = $('.created-from').val()
        let profile_name = $('.profile-name').val()
        let languages = $('.profile-language').val()
        if(!profile_name){
            app.dialog.alert(`Profile Name is null!`);
            return
        }
        let method = 'POST'
        if(thisName){
            THISURL += '/'+thisName
            method = 'PUT'
        }
        try{
           let res =  await http.request(THISURL,{
                method: method,
                dataType: 'json',
                contentType:'application/json',
                serializer : 'json',
                data : {
                    data:{
                        created_from:created_form,
                        profile_name:`[${languages}]${profile_name}[/${languages}]`
                    }
                }
            })
            console.log("res",res);
            if(!thisName){
                let data = JSON.parse(res.data).data
                console.log(data)
                let namecode = data.name
                for(let i in Lists){
                    let THISURLONE = '/api/resource/Profile%20Room/'
                    setTimeout(async()=>{
                        await http.request(THISURLONE,{
                            method: "POST",
                            dataType: 'json',
                            contentType:'application/json',
                            serializer : 'json',
                            data : {
                                banner:'',
                                current_language:'',
                                parent : namecode,
                                parentfield : 'profile_room',
                                parenttype : 'Profile',
                                title : Lists[i]
                            }
                        })
                    },500)
                }
                //save defalut profile
                await iot_switch_profile_for_save(namecode);
                runtime.success = true;
                mainView.router.back();
                app.toast.show({
                    text: _('Save Successfully'),
                    closeTimeout:2000,
                    position:'center'
                });

                app.preloader.hide();
                app.ptr.refresh('.frappe-list-ptr-content');
                }
        }catch(error){
            app.dialog.alert(_(error));
        }
    })
}