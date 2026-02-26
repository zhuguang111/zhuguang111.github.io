<template>
	<view class="agreement-container">
		<view class="agreement-content">
			<text class="agreement-title">用户协议</text>
			<text class="agreement-section">1. 协议概述</text>
			<text class="agreement-text">本协议是用户与电信诈骗举报平台之间的法律协议，旨在规范用户使用本平台的行为，保护用户的合法权益，维护平台的正常运营秩序。</text>
			
			<text class="agreement-section">2. 用户权利与义务</text>
			<text class="agreement-text">2.1 用户有权使用本平台进行电信诈骗线索的举报。</text>
			<text class="agreement-text">2.2 用户应当提供真实、准确、完整的举报信息。</text>
			<text class="agreement-text">2.3 用户不得利用本平台进行任何违法违规活动。</text>
			<text class="agreement-text">2.4 用户应当遵守本协议及平台的其他相关规定。</text>
			
			<text class="agreement-section">3. 平台权利与义务</text>
			<text class="agreement-text">3.1 平台有权对用户提交的举报信息进行审核和处理。</text>
			<text class="agreement-text">3.2 平台应当对用户的个人信息进行保密。</text>
			<text class="agreement-text">3.3 平台应当为用户提供必要的技术支持和服务。</text>
			
			<text class="agreement-section">4. 违约责任</text>
			<text class="agreement-text">用户违反本协议的，平台有权采取相应的措施，包括但不限于警告、限制使用、终止服务等。</text>
			
			<text class="agreement-section">5. 协议修改</text>
			<text class="agreement-text">平台有权根据法律法规的变化和运营需要对本协议进行修改，修改后的协议将在平台上公布，用户继续使用本平台视为接受修改后的协议。</text>
			
			<text class="agreement-section">6. 法律适用与争议解决</text>
			<text class="agreement-text">本协议的订立、履行、解释及争议的解决均适用中华人民共和国法律。如发生争议，双方应协商解决；协商不成的，任何一方均有权向有管辖权的人民法院提起诉讼。</text>
			
			<text class="agreement-section">7. 其他条款</text>
			<text class="agreement-text">本协议自用户点击同意之日起生效，对双方具有法律约束力。</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
		};
	}
};
</script>

<style scoped>
.agreement-container {
	flex: 1;
	background-color: #f5f5f5;
	padding: 30rpx;
}

.agreement-content {
	background-color: white;
	padding: 40rpx;
	border-radius: 10rpx;
}

.agreement-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 40rpx;
	display: block;
}

.agreement-section {
	font-size: 26rpx;
	font-weight: bold;
	color: #333;
	margin-top: 30rpx;
	margin-bottom: 15rpx;
	display: block;
}

.agreement-text {
	font-size: 24rpx;
	color: #666;
	line-height: 36rpx;
	margin-bottom: 15rpx;
	display: block;
}
</style>