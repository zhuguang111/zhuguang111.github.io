

Page({
  data:{locations:[],loading:false,showModal:false,isEdit:false,form:{location_id:'',location_name:'',location_desc:'',frequency_min:'',frequency_max:'',threshold:''}},
  onShow(){this.loadLocations();},
  async loadLocations(){
    this.setData({loading:true});
    const db=wx.cloud.database();
    const res=await db.collection('detection_locations').where({is_deleted:false}).get();
    this.setData({locations:res.data,loading:false});
  },
  showAddModal(){this.setData({showModal:true,isEdit:false,form:{location_id:'',location_name:'',location_desc:'',frequency_min:'',frequency_max:'',threshold:''}});},
  showEditModal(e){
    const i=e.currentTarget.dataset.item;
    this.setData({showModal:true,isEdit:true,form:{location_id:i.location_id,location_name:i.location_name,location_desc:i.location_desc||'',frequency_min:i.frequency_min,frequency_max:i.frequency_max,threshold:i.threshold}});
  },
  hideModal(){this.setData({showModal:false});},
  onInput(e){this.setData({[`form.${e.currentTarget.dataset.field}`]:e.detail.value});},
  async submitForm(){
    const{form,isEdit}=this.data;
    if(!form.location_id||!form.location_name||!form.frequency_min||!form.frequency_max||!form.threshold){wx.showToast({title:'请填写完整',icon:'none'});return;}
    const db=wx.cloud.database();
    try{
      if(isEdit){
        const res=await db.collection('detection_locations').where({location_id:form.location_id}).get();
        if(res.data.length>0)await db.collection('detection_locations').doc(res.data[0]._id).update({data:{location_name:form.location_name,location_desc:form.location_desc,frequency_min:parseInt(form.frequency_min),frequency_max:parseInt(form.frequency_max),threshold:parseInt(form.threshold),updated_at:db.serverDate()}});
      }else{
        await db.collection('detection_locations').add({data:{...form,frequency_min:parseInt(form.frequency_min),frequency_max:parseInt(form.frequency_max),threshold:parseInt(form.threshold),status:'active',is_deleted:false,created_at:db.serverDate(),updated_at:db.serverDate()}});
      }
      wx.showToast({title:'成功',icon:'success'});
      this.hideModal();this.loadLocations();
    }catch(err){wx.showToast({title:'失败',icon:'none'});}
  },
  deleteLocation(e){
    wx.showModal({title:'确认删除',content:'确定删除?',success:async(r)=>{
      if(r.confirm){
        const db=wx.cloud.database();
        await db.collection('detection_locations').doc(e.currentTarget.dataset.id).update({data:{is_deleted:true}});
        wx.showToast({title:'已删除'});this.loadLocations();
      }
    }});
  }
});