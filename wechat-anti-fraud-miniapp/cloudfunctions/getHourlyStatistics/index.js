const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { location_id, date } = event;

  if (!date) {
    return {
      success: false,
      error: '缺少必要参数：date'
    };
  }

  try {
    const startDate = new Date(date + ' 00:00:00');
    const endDate = new Date(date + ' 23:59:59');

    let matchCondition = {
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (location_id) {
      matchCondition.location_id = location_id;
    }

    const statistics = await db.collection('person_location')
      .aggregate()
      .match(matchCondition)
      .group({
        _id: {
          hour: $.hour('$timestamp'),
          location_id: '$location_id',
          location_name: '$location_name',
          person_id: '$person_id',
          person_name: '$person_name'
        },
        count: $.sum(1)
      })
      .sort({
        '_id.hour': 1,
        '_id.location_name': 1
      })
      .end();

    const result = statistics.list.map(item => ({
      hour: item._id.hour,
      location_id: item._id.location_id,
      location_name: item._id.location_name,
      person_id: item._id.person_id,
      person_name: item._id.person_name,
      count: item.count
    }));

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const locationMap = new Map();
    const personMap = new Map();

    result.forEach(item => {
      if (!locationMap.has(item.location_id)) {
        locationMap.set(item.location_id, item.location_name);
      }
      if (!personMap.has(item.person_id)) {
        personMap.set(item.person_id, item.person_name);
      }
    });

    return {
      success: true,
      data: {
        statistics: result,
        locations: Array.from(locationMap.entries()).map(([id, name]) => ({ location_id: id, location_name: name })),
        persons: Array.from(personMap.entries()).map(([id, name]) => ({ person_id: id, person_name: name })),
        hours: hours
      }
    };
  } catch (err) {
    console.error('统计失败:', err);
    return {
      success: false,
      error: err.message || '统计失败'
    };
  }
};
