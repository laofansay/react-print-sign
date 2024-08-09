#!/bin/bash
# Java服务的名称
SERVICE_NAME="your_java_service_name"
# Java服务的启动命令
START_COMMAND="java -jar /path/to/your/java/application.jar"
# 重启函数
restart_service() {
    echo "正在重启 $SERVICE_NAME..."
    # 停止服务
    pid=$(pgrep -f "$SERVICE_NAME")
    if [ -n "$pid" ]; then
        kill $pid
        sleep 5
        if ps -p $pid > /dev/null; then
            kill -9 $pid
        fi
    fi
    # 启动服务
    nohup $START_COMMAND > /dev/null 2>&1 &
    echo "$SERVICE_NAME 已重启"
}

# 执行重启
restart_service
# 添加每日凌晨5点重启的cron任务
(crontab -l 2>/dev/null; echo "0 5 * * * $(readlink -f $0)") | crontab -

# 添加开机重启
if [ ! -f /etc/systemd/system/$SERVICE_NAME.service ]; then
    cat << EOF | sudo tee /etc/systemd/system/$SERVICE_NAME.service
[Unit]
Description=$SERVICE_NAME
After=network.target

[Service]
ExecStart=$(readlink -f $0)
Restart=always
User=$(whoami)

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME.service
    echo "已添加开机重启服务"
fi