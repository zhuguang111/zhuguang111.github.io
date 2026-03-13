
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
    const formattedAlerts = res.data.map(item => {
      const date = new Date(item.created_at);
      return {
        ...item,
        formatted_time: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
      };
    });
    this.setData({alerts:formattedAlerts,hasMore:false,loading:false});
  },
  async handleAlert(e){
    const{id,action}=e.currentTarget.dataset;
    const db=wx.cloud.database();
    wx.showModal({title:'确认',content:'确认操作?',success:async(r)=>{
      if(r.confirm){
        const updateData = {
          is_handled: action === 'handle',
          is_read: true,
          handled_at: db.serverDate()
        };
        await db.collection('alerts').doc(id).update({data:updateData});
        wx.showToast({title:'处理成功'});
        this.loadAlerts();
      }
    }});
  }
});