# SDR无人机检测系统对接指南

本文档说明如何将树莓派+SDR设备对接至微信小程序云开发，实现无人机信号检测和警报。

## 系统架构

```
树莓派 + SDR接收机 → 检测无人机信号 → 上报云函数 → 小程序显示警报
```

## 硬件要求

1. **树莓派**: 3B/4B/5B 或其他型号
2. **SDR设备**: RTL-SDR、HackRF、BladeRF等
3. **天线**: 相应频段天线（2.4GHz/5.8GHz）

## 软件安装

### 1. 安装RTL-SDR驱动

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y git cmake build-essential libusb-1.0-0-dev

# 克隆并编译rtl-sdr
git clone https://github.com/osmocom/rtl-sdr.git
cd rtl-sdr/
mkdir build && cd build
cmake ..
make
sudo make install
sudo ldconfig
```

### 2. 安装Python依赖

```bash
# 安装Python
sudo apt install -y python3 python3-pip

# 安装必要的库
pip3 install numpy scipy rtl-sdr requests
```

## 检测程序

### 主程序 drone_detector.py

```python
#!/usr/bin/env python3
import os
import sys
import time
import json
import signal
import requests
import numpy as np
from rtlsdr import RtlSdr

# 配置参数
APP_ID = "wx6b4f24f7e154d8b5"
APP_SECRET = "your_app_secret"
ENV_ID = "your-env-id"
LOCATION_ID = "device_001"  # 与小程序后台设置的监测点ID一致
LOCATION_NAME = "梅边"  # 监测点名称

class DroneDetector:
    def __init__(self, frequency_min=2400, frequency_max=2500, threshold=-70):
        self.frequency_min = frequency_min * 1_000_000  # 转换为Hz
        self.frequency_max = frequency_max * 1_000_000
        self.threshold = threshold
        self.access_token = None
        self.running = True
        
        signal.signal(signal.SIGINT, self.signal_handler)
        
    def signal_handler(self, sig, frame):
        print("\n收到退出信号，正在关闭...")
        self.running = False
        
    def get_access_token(self):
        url = f"https://api.weixin.qq.com/cgi-bin/token"
        params = {
            "grant_type": "client_credential",
            "appid": APP_ID,
            "secret": APP_SECRET
        }
        response = requests.get(url, params=params)
        data = response.json()
        return data.get("access_token")
    
    def report_detection(self, frequency, signal_strength, is_drone):
        if not self.access_token:
            self.access_token = self.get_access_token()
            
        url = f"https://{ENV_ID}.weixin.qq.com/tcb/invokecloudfunction"
        params = {
            "env": ENV_ID,
            "name": "reportDetection"
        }
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "location_id": LOCATION_ID,
            "location_name": LOCATION_NAME,
            "frequency": round(frequency / 1_000_000, 2),  # 转换为MHz
            "signal_strength": signal_strength,
            "is_drone": is_drone,
            "timestamp": int(time.time() * 1000)
        }
        
        try:
            response = requests.post(url, params=params, headers=headers, json=data, timeout=10)
            result = response.json()
            
            if result.get("errcode") == 0:
                response_data = result.get("response_data", {})
                if response_data.get("success"):
                    print(f"[{time.strftime('%H:%M:%S')}] 上报成功 - 频率: {data['frequency']}MHz, 信号: {signal_strength}dBm, 无人机: {is_drone}")
                    if response_data.get("data", {}).get("is_alert"):
                        print("⚠️  检测到无人机信号！已发出警报！")
            else:
                print(f"上报失败: {result}")
                if "access_token" in str(result):
                    self.access_token = None
        except Exception as e:
            print(f"上报出错: {e}")
    
    def scan_frequency(self, sdr):
        """扫描指定频段"""
        center_freq = (self.frequency_min + self.frequency_max) / 2
        sample_rate = 2_048_000
        sdr.center_freq = center_freq
        sdr.sample_rate = sample_rate
        sdr.gain = 'auto'
        
        samples = sdr.read_samples(256 * 1024)
        
        # 计算功率谱
        fft_data = np.fft.fft(samples)
        power = np.abs(fft_data)
        power_db = 10 * np.log10(power)
        
        # 找出峰值
        peak_idx = np.argmax(power_db)
        peak_freq = center_freq - (sample_rate / 2) + (peak_idx * sample_rate / len(power))
        peak_power = power_db[peak_idx]
        
        return peak_freq, peak_power
    
    def detect_drone(self, frequency):
        """判断是否为无人机信号"""
        # 2.4GHz频段: 遥控器常用2400-2480MHz
        # 5.8GHz频段: 图传常用5725-5850MHz
        
        drone_bands = [
            (2400, 2480),   # 2.4GHz遥控
            (5725, 5850),  # 5.8GHz图传
        ]
        
        freq_mhz = frequency / 1_000_000
        
        for band_min, band_max in drone_bands:
            if band_min <= freq_mhz <= band_max:
                return True
        
        return False
    
    def run(self):
        """运行检测程序"""
        print(f"无人机检测系统启动")
        print(f"监测频段: {self.frequency_min/1_000_000}-{self.frequency_max/1_000_000} MHz")
        print(f"警报阈值: {self.threshold} dBm")
        print(f"监测点: {LOCATION_NAME} ({LOCATION_ID})")
        print("-" * 50)
        
        try:
            sdr = RtlSdr(0)  # 第一个RTL-SDR设备
            
            while self.running:
                try:
                    frequency, signal_strength = self.scan_frequency(sdr)
                    
                    # 判断是否为无人机频段
                    is_drone = self.detect_drone(frequency)
                    
                    # 如果是无人机频段且信号强度超过阈值，则上报
                    if is_drone and signal_strength >= self.threshold:
                        self.report_detection(frequency, signal_strength, True)
                    
                    # 也可以上报所有检测到的信号（可选）
                    # self.report_detection(frequency, signal_strength, is_drone)
                    
                    time.sleep(1)  # 每秒检测一次
                    
                except Exception as e:
                    print(f"检测出错: {e}")
                    time.sleep(5)
                    
        except Exception as e:
            print(f"程序出错: {e}")
        finally:
            sdr.close()
            print("程序已退出")

if __name__ == "__main__":
    # 可以通过命令行参数配置
    freq_min = int(sys.argv[1]) if len(sys.argv) > 1 else 2400
    freq_max = int(sys.argv[2]) if len(sys.argv) > 2 else 2500
    threshold = int(sys.argv[3]) if len(sys.argv) > 3 else -70
    
    detector = DroneDetector(freq_min, freq_max, threshold)
    detector.run()
```

### 使用方法

```bash
# 运行检测程序
python3 drone_detector.py

# 指定参数: 最小频率 最大频率 阈值
python3 drone_detector.py 2400 2500 -70
```

## 无人机信号特征

### 2.4GHz频段
- **频率范围**: 2400-2480 MHz
- **特点**: 遥控器信号，跳频模式
- **信号特征**: 短时突发，频率快速变化

### 5.8GHz频段
- **频率范围**: 5725-5850 MHz
- **特点**: 图传信号，连续传输
- **信号特征**: 相对稳定的频率，功率较高

## 阈值设置建议

| 环境 | 阈值(dBm) | 说明 |
|------|-----------|------|
| 城市 | -60 | 信号较多，需要较高阈值 |
| 郊区 | -70 | 默认设置 |
| 农村 | -80 | 信号较少，可降低阈值 |

## 常见问题

### Q1: RTL-SDR无法识别

**解决方法**:
```bash
# 检查设备
lsusb

# 禁止原生rtl-sdr驱动
sudo bash -c 'echo -e "blacklist dvb_usb_rtl28xxu\nblacklist rtl2832\nblacklist rtl2830" > /etc/modprobe.d/rtl-sdr.conf'
```

### Q2: 上报失败

**可能原因**:
- Access Token过期
- 网络问题
- 云函数未部署

**解决方法**:
1. 检查网络连接
2. 确认云函数已部署
3. 查看小程序后台日志

### Q3: 误报率高

**解决方法**:
1. 调整检测阈值
2. 增加检测确认（连续多次检测到才上报）
3. 使用更窄的频段范围

## 部署步骤

1. **创建小程序**: 在微信开发者工具中导入 `wechat-drone-detection` 项目
2. **开通云开发**: 创建云开发环境
3. **创建数据库集合**:
   - `drone_detection` - 检测记录
   - `detection_locations` - 监测点
   - `alerts` - 警报记录
4. **创建索引**: 为集合创建适当索引
5. **部署云函数**: 上传并部署所有云函数
6. **添加监测点**: 在小程序管理后台添加监测点
7. **启动检测**: 在树莓派上运行检测程序
