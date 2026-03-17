// 测试检测记录创建
const cloud = require('wx-server-sdk');
cloud.init({  env: cloud.DYNAMIC_CURRENT_ENV});
const db = cloud.database();

async function testDetection() {
  try {
    // 测试数据 - 包含时间戳
    const testData = {
      location_id: 'test-location',
      location_name: '测试监测点',
      frequency: '2400 MHz',
      signal_strength: -40,
      is_drone: true,
      timestamp: Date.now() // 传入当前时间戳
    };
    
    console.log('测试数据:', testData);
    console.log('时间戳:', testData.timestamp);
    
    // 调用云函数
    const result = await cloud.callFunction({
      name: 'reportDetection',
      data: testData
    });
    
    console.log('云函数返回结果:', result);
    
    // 检查数据库
    const records = await db.collection('drone_detection').orderBy('detected_at', 'desc').limit(5).get();
    console.log('最近5条检测记录:', records.data);
    records.data.forEach((r, i) => {
      console.log(`记录${i+1}: detected_at=${r.detected_at}, formatted_time=${r.formatted_time}, 类型=${typeof r.detected_at}`);
    });
    
    // 检查今天的记录
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const todayRecords = await db.collection('drone_detection').where({
      detected_at: db.command.gte(todayStart).and(db.command.lte(todayEnd))
    }).count();
    
    console.log('今日检测记录数量:', todayRecords.total);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDetection();