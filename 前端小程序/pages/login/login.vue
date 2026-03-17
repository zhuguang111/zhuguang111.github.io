```vue
<template>
	<view class="login-container">
		<view class="logo">
			<image src="../../static/logo.png" mode="aspectFit"></image>
			<text class="title">电信诈骗举报</text>
		</view>
		
		<view class="login-form">
			<button type="primary" class="wechat-login" @click="wechatLogin">
				<text class="wechat-icon">💬</text>
				<text>微信一键登录</text>
			</button>
			
			<view class="agreement">
				<label class="checkbox-label">
					<checkbox :checked="isAgreed" @change="onAgreeChange" color="#e53935" style="transform: scale(0.8)"/>
					<text>我已阅读并同意</text>
					<text class="link" @click.stop="goToAgreement">《用户协议》</text>
				</label>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isAgreed: false,
			isLogging: false
		};
	},
	methods: {
		onAgreeChange(e) {
			this.isAgreed = e.detail.value;
		},
		
		async wechatLogin() {
			if (!this.isAgreed) {
				uni.showToast({
					title: '请先阅读并同意用户协议',
					icon: 'none',
					duration: 2000
				});
				uni.vibrateShort();
				return;
			}
			
			if (this.isLogging) return;
			this.isLogging = true;
			
			try {
				uni.showLoading({
					title: '登录中...',
					mask: true
				});
				
				const loginResult = await this.doWechatLogin();
				
				uni.hideLoading();
				uni.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 1500
				});
				
				uni.setStorageSync('userInfo', {
					username: loginResult.userInfo.nickName || '微信用户',
					avatar: loginResult.userInfo.avatarUrl || '',
					openid: loginResult.openid,
					loginTime: Date.now()
				});
				
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index',
						fail: (err) => {
							uni.navigateTo({
								url: '/pages/index/index'
							});
						}
					});
				}, 1000);
				
			} catch (error) {
				uni.hideLoading();
				console.error('登录失败:', error);
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				this.isLogging = false;
			}
		},
		
		doWechatLogin() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve({
						code: 'mock_code_123456',
						openid: 'mock_openid_789',
						userInfo: {
							nickName: '微信用户',
							avatarUrl: ''
						}
					});
				}, 1500);
			});
		},
		
		goToAgreement() {
			uni.navigateTo({
				url: '/pages/agreement/agreement',
				fail: () => {
					uni.showToast({
						title: '协议页面不存在',
						icon: 'none'
					});
				}
			});
		}
	}
};
</script>

<style scoped>
.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 30rpx;
	min-height: 100vh;
	background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.logo {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 100rpx;
	margin-top: 80rpx;
}

.logo image {
	width: 180rpx;
	height: 180rpx;
	margin-bottom: 30rpx;
	border-radius: 20rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #e53935;
	letter-spacing: 4rpx;
}

.login-form {
	width: 100%;
	max-width: 600rpx;
	padding: 0 40rpx;
}

.wechat-login {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
	border-radius: 50rpx;
	padding: 24rpx 0;
	margin-bottom: 50rpx;
	box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.3);
	border: none;
}

.wechat-login:active {
	opacity: 0.9;
	transform: scale(0.98);
}

.wechat-icon {
	font-size: 40rpx;
	margin-right: 16rpx;
}

.wechat-login text {
	font-size: 32rpx;
	font-weight: 500;
	color: white;
}

.agreement {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}

.checkbox-label {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.checkbox-label text {
	margin: 0 4rpx;
}

.link {
	color: #e53935;
	text-decoration: none;
}

.link:active {
	opacity: 0.7;
}
</style>
```<template>
	<view class="login-container">
		<view class="logo">
			<image src="../../static/logo.png" mode="aspectFit"></image>
			<text class="title">电信诈骗举报</text>
		</view>
		<view class="login-form">
			<button type="primary" class="wechat-login" @click="wechatLogin">
				<text class="wechat-icon">💬</text>
				<text>微信登录</text>
			</button>
			<view class="agreement">
				<checkbox-group v-model="checkboxValue">
					<checkbox value="agree"></checkbox>
					<text>我已阅读并同意</text>
					<text class="link" @click="goToAgreement">《用户协议》</text>
				</checkbox-group>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			checkboxValue: []
		};
	},
	methods: {
		wechatLogin() {
			console.log('checkboxValue:', this.checkboxValue);
			if (this.checkboxValue.length === 0) {
				uni.showToast({
					title: '请阅读并同意用户协议',
					icon: 'none'
				});
				return;
			}
			// 模拟微信登录
			uni.showLoading({
				title: '登录中...'
			});
			setTimeout(() => {
				uni.hideLoading();
				uni.setStorageSync('userInfo', {
					username: '微信用户',
					avatar: '',
					points: 0
				});
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});
				setTimeout(() => {
					uni.switchTab({
						url: '../index/index'
					});
				}, 1000);
			}, 1500);
		},
		goToAgreement() {
			uni.navigateTo({
				url: '../agreement/agreement'
			});
		}
	}
};
</script>

<style scoped>
.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 0;
}

.logo {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 80rpx;
}

.logo image {
	width: 160rpx;
	height: 160rpx;
	margin-bottom: 20rpx;
}

.title {
	font-size: 32rpx;
	font-weight: bold;
	color: #e53935;
}

.login-form {
	width: 80%;
}

.wechat-login {
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #e53935;
	border-radius: 10rpx;
	padding: 20rpx 0;
	margin-bottom: 40rpx;
}

.wechat-icon {
	font-size: 40rpx;
	margin-right: 10rpx;
}

.wechat-login text {
	font-size: 28rpx;
	color: white;
}

.agreement {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #666;
}

.link {
	color: #e53935;
	margin-left: 5rpx;
}
</style>