
Page({
  data:{records:[],locations:[],selectedLocationId:'',selectedLocationName:'',filterDrone:'',page:1,hasMore:true,loading:false},
  onLoad(){this.loadLocations();this.loadRecords();},
  async loadLocations(){
    const db=wx.cloud.database();
    const res=await db.collection('detection_locations').where({status:'active',is_deleted:false}).get();
    this.setData({locations:[{location_id:'',location_name:'全部'},...res.data]});
  },
  async loadRecords(){
    if(this.data.loading)return;
    this.setData({loading:true});
    const db=wx.cloud.database();
    let query={};
    if(this.data.selectedLocationId)query.location_id=this.data.selectedLocationId;
    if(this.data.filterDrone!=='')query.is_drone=this.data.filterDrone==='true';
    const res=await db.collection('drone_detection').where(query).orderBy('detected_at','desc').get();
    const formattedRecords = res.data.map(item => {
      const date = new Date(item.detected_at);
      return {
        ...item,
        formatted_time: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
      };
    });
    this.setData({records:formattedRecords,hasMore:false,loading:false});
  },
  onLocationChange(e){
    const idx = e.detail.value;
    const loc = this.data.locations[idx];
    this.setData({selectedLocationId:loc.location_id,selectedLocationName:loc.location_name,page:1,records:[]});
    this.loadRecords();
  },
  switchFilter(e){
    this.setData({filterDrone:e.currentTarget.dataset.drone,page:1,records:[]});
    this.loadRecords();
  }
});