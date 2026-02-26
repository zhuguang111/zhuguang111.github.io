<template>
	<view class="report-container">
		<view class="report-form">
			<view class="form-item">
				<text class="form-label">举报类型</text>
				<picker :range="reportTypes" :value="typeIndex" @change="handleTypeChange" class="form-picker">
					<view class="picker-text">{{reportTypes[typeIndex]}}</view>
				</picker>
			</view>
			
			<view class="form-item">
				<text class="form-label">举报内容</text>
				<textarea v-model="reportContent" placeholder="请详细描述诈骗情况..." class="form-textarea"></textarea>
			</view>
			
			<view class="form-item">
				<text class="form-label">上传证据</text>
				<view class="upload-area">
					<view class="upload-item" @click="chooseImage" v-if="images.length < 9">
						<text class="upload-icon">📷</text>
						<text>上传图片</text>
					</view>
					<view v-for="(image, index) in images" :key="index" class="uploaded-item">
						<image :src="image" mode="aspectFill" class="uploaded-image"></image>
						<text class="delete-icon" @click="deleteImage(index)">×</text>
					</view>
				</view>
			</view>
			
			<view class="form-item">
				<text class="form-label">上传视频</text>
				<view class="upload-area">
					<view class="upload-item" @click="chooseVideo" v-if="!videoUrl">
						<text class="upload-icon">🎥</text>
						<text>上传视频</text>
					</view>
					<view v-if="videoUrl" class="uploaded-item">
						<text class="video-icon">🎬</text>
						<text class="video-text">已上传视频</text>
						<text class="delete-icon" @click="deleteVideo">×</text>
					</view>
				</view>
			</view>
			
			<view class="form-item">
				<text class="form-label">联系电话</text>
				<input v-model="contactPhone" placeholder="请留下您的联系电话" class="form-input" type="number"></input>
			</view>
			
			<button type="primary" class="submit-button" @click="submitReport">提交举报</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			reportTypes: ['电信诈骗', '网络诈骗', '短信诈骗', '其他诈骗'],
			typeIndex: 0,
			reportContent: '',
			images: [],
			videoUrl: '',
			contactPhone: ''
		};
	},
	methods: {
		handleTypeChange(e) {
			this.typeIndex = e.detail.value;
		},
		chooseImage() {
			uni.chooseImage({
				count: 9 - this.images.length,
				sizeType: ['original', 'compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.images = this.images.concat(res.tempFilePaths);
				}
			});
		},
		deleteImage(index) {
			this.images.splice(index, 1);
		},
		chooseVideo() {
			uni.chooseVideo({
				sourceType: ['album', 'camera'],
				maxDuration: 60,
				success: (res) => {
					this.videoUrl = res.tempFilePath;
				}
			});
		},
		deleteVideo() {
			this.videoUrl = '';
		},
		submitReport() {
			if (!this.reportContent) {
				uni.showToast({
					title: '请填写举报内容',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '提交中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '举报提交成功',
					icon: 'success'
				});
				
				setTimeout(() => {
					uni.navigateTo({
						url: '../my-report/my-report'
					});
				}, 1500);
			}, 1500);
		}
	}
};
</script>

<style scoped>
.report-container {
	flex: 1;
	background-color: #f5f5f5;
}

.report-form {
	background-color: white;
	padding: 30rpx;
	margin-top: 20rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
}

.form-picker {
	border: 1rpx solid #e8e8e8;
	border-radius: 10rpx;
	padding: 20rpx;
	background-color: #f9f9f9;
}

.picker-text {
	font-size: 26rpx;
	color: #666;
}

.form-textarea {
	border: 1rpx solid #e8e8e8;
	border-radius: 10rpx;
	padding: 20rpx;
	background-color: #f9f9f9;
	height: 200rpx;
	font-size: 26rpx;
	color: #333;
}

.form-input {
	border: 1rpx solid #e8e8e8;
	border-radius: 10rpx;
	padding: 20rpx;
	background-color: #f9f9f9;
	font-size: 26rpx;
	color: #333;
}

.upload-area {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.upload-item {
	width: 120rpx;
	height: 120rpx;
	border: 2rpx dashed #e8e8e8;
	border-radius: 10rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #f9f9f9;
}

.upload-icon {
	font-size: 40rpx;
	margin-bottom: 10rpx;
}

.upload-item text {
	font-size: 20rpx;
	color: #999;
}

.uploaded-item {
	position: relative;
	width: 120rpx;
	height: 120rpx;
	border-radius: 10rpx;
	overflow: hidden;
}

.uploaded-image {
	width: 100%;
	height: 100%;
}

.video-icon {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 40rpx;
	z-index: 1;
}

.video-text {
	position: absolute;
	bottom: 10rpx;
	left: 0;
	right: 0;
	text-align: center;
	font-size: 18rpx;
	color: white;
	background-color: rgba(0, 0, 0, 0.5);
	padding: 5rpx;
	z-index: 1;
}

.delete-icon {
	position: absolute;
	top: 5rpx;
	right: 5rpx;
	width: 30rpx;
	height: 30rpx;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.5);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	z-index: 2;
}

.submit-button {
	background-color: #e53935;
	border-radius: 10rpx;
	padding: 25rpx 0;
	font-size: 28rpx;
	color: white;
	margin-top: 30rpx;
}
</style>