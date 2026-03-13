
Page({
  data: { alerts: [], filterType: 'all', page: 1, hasMore: true, loading: false },
  onShow() { this.loadAlerts(); },
  switchFilter(e) { this.setData({filterType:e.currentTarget.dataset.type,page:1,alerts:[]}); this.loadAlerts(); },
  async loadAlerts() {
    if(this.data.loading)return;
    this.setData({loading:true});
    const db=wx.cloud.database();
    let query={};
    if(this.data.filterType==='unread')query.is_read=false;
    else if(this.data.filterType==='pending')query.is_handled=false;
    const res=await db.collection('alerts').where(query).orderBy('created_at','desc').get();
    this.setData({alerts:res.data,hasMore:false,loading:false});
  },
  async handleAlert(e){
    const{id,action}=e.currentTarget.dataset;
    const db=wx.cloud.database();
    wx.showModal({title:'确认',content:'确认操作?',success:async(r)=>{
      if(r.confirm){
        await db.collection('alerts').doc(id).update({data:{is_handled:action==='handle'}});
        wx.showToast({title:'成功'});
        this.loadAlerts();
      }
    }});
  }
});