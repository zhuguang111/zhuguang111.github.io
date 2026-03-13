const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { location_id, location_name, person_id, person_name, timestamp, imageData } = event;

  if (!location_id || !location_name || !timestamp) {
    return {
      success: false,
      error: '缺少必要参数：location_id, location_name, timestamp'
    };
  }

  try {
    const recordTime = new Date(timestamp);
    const formattedTime = `${recordTime.getFullYear()}-${String(recordTime.getMonth() + 1).padStart(2, '0')}-${String(recordTime.getDate()).padStart(2, '0')} ${String(recordTime.getHours()).padStart(2, '0')}:${String(recordTime.getMinutes()).padStart(2, '0')}`;

    let finalPersonId = person_id || 'unknown';
    let finalPersonName = person_name || '未知人员';
    let imageUrl = '';

    if (imageData) {
      try {
        const upload = await cloud.uploadFile({
          cloudPath: `faces/${Date.now()}.jpg`,
          fileContent: Buffer.from(imageData, 'base64')
        });
        imageUrl = upload.fileID;
      } catch (uploadErr) {
        console.error('图片上传失败:', uploadErr);
      }
    }

    const locationCheck = await db.collection('locations').where({
      location_id: location_id
    }).get();

    if (locationCheck.data.length === 0) {
      await db.collection('locations').add({
        data: {
          location_id: location_id,
          location_name: location_name,
          description: '',
          created_at: new Date()
        }
      });
    }

    if (person_id && person_id !== 'unknown') {
      const personCheck = await db.collection('persons').where({
        person_id: person_id
      }).get();

      if (personCheck.data.length === 0) {
        await db.collection('persons').add({
          data: {
            person_id: person_id,
            person_name: person_name || '未命名',
            face_data: '',
            created_at: new Date()
          }
        });
      } else if (person_name && person_name !== personCheck.data[0].person_name) {
        await db.collection('persons').where({
          person_id: person_id
        }).update({
          data: {
            person_name: person_name
          }
        });
      }
    }

    const res = await db.collection('person_location').add({
      data: {
        location_id: location_id,
        location_name: location_name,
        person_id: finalPersonId,
        person_name: finalPersonName,
        timestamp: recordTime,
        formatted_time: formattedTime,
        image_url: imageUrl,
        created_at: new Date()
      }
    });

    return {
      success: true,
      data: {
        record_id: res._id,
        message: '记录成功'
      }
    };
  } catch (err) {
    console.error('记录失败:', err);
    return {
      success: false,
      error: err.message || '记录失败'
    };
  }
};
