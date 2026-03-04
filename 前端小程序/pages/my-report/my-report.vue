<template>
	<view class="my-report-container">
		<view class="status-filter">
			<view class="filter-item" :class="{ active: activeStatus === -1 }" @click="switchStatus(-1)">
				<text>全部</text>
			</view>
			<view class="filter-item" :class="{ active: activeStatus === 0 }" @click="switchStatus(0)">
				<text>待处理</text>
			</view>
			<view class="filter-item" :class="{ active: activeStatus === 1 }" @click="switchStatus(1)">
				<text>处理中</text>
			</view>
			<view class="filter-item" :class="{ active: activeStatus === 2 }" @click="switchStatus(2)">
				<text>已完成</text>
			</view>
			<view class="filter-item" :class="{ active: activeStatus === 3 }" @click="switchStatus(3)">
				<text>未通过</text>
			</view>
		</view>
		
		<view class="report-list">
			<view v-if="filteredReports.length === 0" class="empty">
				<text class="empty-icon">📭</text>
				<text>暂无举报记录</text>
			</view>
			<view v-for="(report, index) in filteredReports" :key="index" class="report-item">
				<view class="report-header">
					<text class="report-type">{{report.type}}</text>
					<text class="report-status" :class="{'status-pending': report.status === 0, 'status-processing': report.status === 1, 'status-completed': report.status === 2, 'status-rejected': report.status === 3}">{{getStatusText(report.status)}}</text>
				</view>
				<view class="report-content">
					<text>{{report.content}}</text>
				</view>
				<view class="report-footer">
					<text class="report-time">{{report.time}}</text>
					<text class="report-id">举报编号：{{report.id}}</text>
				</view>
				<view class="report-images" v-if="report.images && report.images.length > 0">
					<image v-for="(image, imgIndex) in report.images" :key="imgIndex" :src="image" mode="aspectFit" class="report-image"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			activeStatus: -1,
			reports: [
				{
					id: '20240224001',
					type: '电信诈骗',
					content: '今天收到一个陌生电话，对方自称是公安局的，说我涉嫌洗钱，需要转账到安全账户。我感觉不对劲，就挂了电话。',
					status: 0,
					time: '2024-02-24 10:30',
					images: []
				},
				{
					id: '20240223001',
					type: '网络诈骗',
					content: '在网上看到一个兼职刷单的广告，按照要求完成任务后，对方不仅没返钱，还让我继续充值。',
					status: 1,
					time: '2024-02-23 15:45',
					images: []
				}
			]
		};
	},
	computed: {
		filteredReports() {
			if (this.activeStatus === -1) {
				return this.reports;
			}
			return this.reports.filter(report => report.status === this.activeStatus);
		}
	},
	methods: {
		switchStatus(status) {
			this.activeStatus = status;
		},
		getStatusText(status) {
			const statusMap = {
				0: '待处理',
				1: '处理中',
				2: '已完成',
				3: '未通过'
			};
			return statusMap[status] || '';
		}
	}
};
</script>

<style scoped>
.my-report-container {
	flex: 1;
	background-color: #f5f5f5;
}

.status-filter {
	display: flex;
	background-color: white;
	padding: 20rpx;
	border-bottom: 1rpx solid #e8e8e8;
}

.filter-item {
	flex: 1;
	text-align: center;
	padding: 10rpx;
	border-radius: 20rpx;
}

.filter-item.active {
	background-color: #e53935;
}

.filter-item.active text {
	color: white;
}

.filter-item text {
	font-size: 24rpx;
	color: #666;
}

.report-list {
	padding: 20rpx;
}

.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 20rpx;
	display: block;
}

.empty text {
	font-size: 24rpx;
	color: #999;
}

.report-item {
	background-color: white;
	border-radius: 10rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.report-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.report-type {
	font-size: 26rpx;
	font-weight: bold;
	color: #333;
}

.report-status {
	font-size: 22rpx;
	padding: 5rpx 15rpx;
	border-radius: 15rpx;
}

.status-pending {
	background-color: #f0f0f0;
	color: #666;
}

.status-processing {
	background-color: #e6f7ff;
	color: #1890ff;
}

.status-completed {
	background-color: #f6ffed;
	color: #52c41a;
}

.status-rejected {
	background-color: #fff2f0;
	color: #ff4d4f;
}

.report-content {
	font-size: 24rpx;
	color: #666;
	line-height: 36rpx;
	margin-bottom: 15rpx;
}

.report-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 15rpx;
	border-top: 1rpx solid #f0f0f0;
}

.report-time {
	font-size: 20rpx;
	color: #999;
}

.report-id {
	font-size: 20rpx;
	color: #999;
}

.report-images {
	display: flex;
	flex-wrap: wrap;
	margin-top: 15rpx;
}

.report-image {
	width: 120rpx;
	height: 120rpx;
	margin-right: 10rpx;
	margin-bottom: 10rpx;
	border-radius: 5rpx;
}
</style>