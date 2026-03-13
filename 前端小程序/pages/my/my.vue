<template>
	<view class="my-container">
		<view class="user-info">
			<view class="avatar">
				<text class="avatar-icon">{{userInfo.username.charAt(0)}}</text>
			</view>
			<view class="user-details">
				<text class="username">{{userInfo.username}}</text>
				<text class="points">积分：{{userInfo.points}}</text>
			</view>
		</view>
		
		<view class="menu-list">
			<view class="menu-item" @click="goToMyReport">
				<text class="menu-icon">📋</text>
				<text class="menu-text">我的举报</text>
				<text class="menu-arrow">→</text>
			</view>
			<view class="menu-item">
				<text class="menu-icon">ℹ️</text>
				<text class="menu-text">关于我们</text>
				<text class="menu-arrow">→</text>
			</view>
			<view class="menu-item">
				<text class="menu-icon">🔒</text>
				<text class="menu-text">隐私政策</text>
				<text class="menu-arrow">→</text>
			</view>
			<view class="menu-item" @click="logout">
				<text class="menu-icon">🚪</text>
				<text class="menu-text">退出登录</text>
				<text class="menu-arrow">→</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {
				username: '微信用户',
				avatar: '',
				points: 0
			}
		};
	},
	onLoad() {
		// 获取用户信息
		const userInfo = uni.getStorageSync('userInfo');
		if (userInfo) {
			this.userInfo = userInfo;
		}
	},
	methods: {
		goToMyReport() {
			uni.navigateTo({
				url: '../my-report/my-report'
			});
		},
		logout() {
			uni.showModal({
				title: '退出登录',
				content: '确定要退出登录吗？',
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('userInfo');
						uni.navigateTo({
							url: '../login/login'
						});
					}
				}
			});
		}
	}
};
</script>

<style scoped>
.my-container {
	flex: 1;
	background-color: #f5f5f5;
}

.user-info {
	display: flex;
	align-items: center;
	background-color: #e53935;
	padding: 40rpx;
	color: white;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 30rpx;
}

.avatar-icon {
	font-size: 60rpx;
	font-weight: bold;
}

.user-details {
	flex: 1;
}

.username {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
}

.points {
	font-size: 24rpx;
	opacity: 0.8;
}

.menu-list {
	margin-top: 20rpx;
	background-color: white;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.menu-icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.menu-text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.menu-arrow {
	font-size: 24rpx;
	color: #999;
}
</style>