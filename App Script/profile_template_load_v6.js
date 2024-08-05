window.profile_template_load = function(){
    return new Promise((solve,reject)=>{
        let ALLLIST = []
        let THISURL = '/api/resource/Profile%20Template?fields='+encodeURI('["*"]')
        http.request(THISURL,{
        method: "GET",
        responseType: "json",
        serializer : 'json',
        data : {
            
        }
    }).then((resData)=>{
       console.log(resData) 
       <!-- change the picker value -->
       let dataList = []
       let list = resData.data.data
       list.forEach((item,index)=>{
        dataList.push(item.profile_name)
       })
       profile_template_picker.setValue(dataList)
       let dataObjList = [
        {
            textAlign : 'center',
            values : dataList
        }
       ]
       profile_template_picker.cols = dataObjList

       <!-- accept the data for the room by template name -->
       let THISURL2 = '/api/resource/Profile%20Template/'+list[0].name + '?fields='+encodeURI('["*"]')
       http.request(THISURL2,{
            method: "GET",
            responseType: "json",
            serializer : 'json',
            data : {
                
            }
        }).then(roomData=>{
            let roomList = roomData.data.data.profile_room
            let newRoomList = []
            let thisLanguage = $('.profile-language').val()
            let htmls = ''
            roomList.forEach(datas=>{
                let thisDocs = `[${thisLanguage}]${datas.title}[/${thisLanguage}]`
                <!-- htmls+= `<input type="hidden" class="profile-room" name="profile_room[]" value="${thisDocs}">` -->
                newRoomList.push(thisDocs)
            })
            ALLLIST = newRoomList
            solve(ALLLIST)
            <!-- $('.hidden-box').append(htmls) -->
        }).catch(error=>{
            solve([])
        })
    }).catch((err)=>{
        solve([])
        console.log(err)
    })
    })
}