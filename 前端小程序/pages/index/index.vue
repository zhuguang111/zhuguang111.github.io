<template>
	<view class="container">
		<view class="header">
			<image src="../../static/logo.png" mode="aspectFit"></image>
			<text class="header-title">电信诈骗举报</text>
		</view>
		<view class="banner">
			<view class="banner-content">
				<text class="banner-title">电信诈骗举报</text>
				<text class="banner-subtitle">打击诈骗，共建平安</text>
			</view>
		</view>
		<view class="report-section">
			<text class="section-title">举报诈骗线索</text>
			<text class="section-desc">发现电信诈骗行为？立即举报，共同打击犯罪</text>
			<button type="primary" class="report-button" @click="goToReport">
				<text class="report-button-text">我要举报</text>
			</button>
		</view>
		<view class="tips-section">
			<text class="tips-title">防诈小贴士</text>
			<view class="tips-list">
				<view class="tip-item">
					<text class="tip-icon">1</text>
					<text class="tip-text">不要轻易相信陌生电话和短信</text>
				</view>
				<view class="tip-item">
					<text class="tip-icon">2</text>
					<text class="tip-text">不要随意点击陌生链接</text>
				</view>
				<view class="tip-item">
					<text class="tip-icon">3</text>
					<text class="tip-text">不要向陌生账户转账汇款</text>
				</view>
				<view class="tip-item">
					<text class="tip-icon">4</text>
					<text class="tip-text">遇到可疑情况及时报警</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
		};
	},
	onLoad() {
		// 检查是否已经登录
		if (!uni.getStorageSync('userInfo')) {
			uni.navigateTo({
				url: '../login/login'
			});
		}
	},
	methods: {
		goToReport() {
			// 检查是否已经登录
			if (!uni.getStorageSync('userInfo')) {
				uni.navigateTo({
					url: '../login/login'
				});
				return;
			}
			uni.navigateTo({
				url: '../report/report'
			});
		}
	}
};
</script>

<style scoped>
.container {
	flex: 1;
	background-color: #f5f5f5;
}

.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 0;
	background-color: white;
}

.header image {
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 20rpx;
}

.header-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #e53935;
}

.banner {
	width: 100%;
	height: 200rpx;
	margin-bottom: 20rpx;
	background-color: #e53935;
	display: flex;
	align-items: center;
	justify-content: center;
}

.banner-content {
	test-align: center;
}

.banner-title {
	font-size: 36rpx;
	font-weight: bold;
	color: white;
	margin-bottom: 10rpx;
	display: block;
}

.banner-subtitle {
	font-size: 24rpx;
	color: white;
	opacity: 0.9;
	display: block;
	text-align: center;
}

.report-section {
	background-color: white;
	padding: 40rpx;
	margin-bottom: 20rpx;
	text-align: center;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.section-desc {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 30rpx;
}

.report-button {
	background-color: #e53935;
	border-radius: 10rpx;
	padding: 20rpx 0;
}

.report-button-text {
	font-size: 28rpx;
	color: white;
}

.tips-section {
	background-color: white;
	padding: 40rpx;
}

.tips-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.tips-list {
	margin-top: 20rpx;
}

.tip-item {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.tip-icon {
	width: 36rpx;
	height: 36rpx;
	background-color: #e53935;
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
	margin-right: 15rpx;
}

.tip-text {
	font-size: 24rpx;
	color: #666;
	flex: 1;
}
</style>
