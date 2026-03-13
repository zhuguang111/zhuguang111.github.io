
Page({
  data:{records:[],locations:[],selectedLocationId:'',filterDrone:'',page:1,hasMore:true,loading:false},
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
    this.setData({records:res.data,hasMore:false,loading:false});
  },
  onLocationChange(e){
    const loc=this.data.locations[e.detail.value];
    this.setData({selectedLocationId:loc.location_id,page:1,records:[]});
    this.loadRecords();
  },
  switchFilter(e){
    this.setData({filterDrone:e.currentTarget.dataset.drone,page:1,records:[]});
    this.loadRecords();
  }
});