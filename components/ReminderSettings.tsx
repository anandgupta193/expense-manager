"use client";

import { useState } from "react";
import { Switch, TimePicker, message, theme, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { storage } from "@/lib/storage";
import type { ReminderConfig } from "@/lib/types";

const { Text } = Typography;

export default function ReminderSettings() {
  const { token } = theme.useToken();
  const [config, setConfig] = useState<ReminderConfig>(() =>
    storage.getReminder()
  );

  async function handleToggle(checked: boolean) {
    if (checked) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        message.warning("Notification permission denied. Enable it in browser settings.");
        return;
      }
    }
    const next = { ...config, enabled: checked };
    setConfig(next);
    storage.setReminder(next);
  }

  function handleTimeChange(value: dayjs.Dayjs | null) {
    if (!value) return;
    const next = { ...config, time: value.format("HH:mm") };
    setConfig(next);
    storage.setReminder(next);
  }

  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: token.paddingLG,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <BellOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
        <span style={{ color: token.colorText, fontWeight: 600, fontSize: 16 }}>
          Daily Reminder
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Text style={{ color: token.colorText }}>Enable reminder</Text>
          <Switch checked={config.enabled} onChange={handleToggle} />
        </div>

        <div className="flex items-center justify-between">
          <Text style={{ color: config.enabled ? token.colorText : token.colorTextDisabled }}>
            Reminder time
          </Text>
          <TimePicker
            value={dayjs(config.time, "HH:mm")}
            format="HH:mm"
            use12Hours={false}
            disabled={!config.enabled}
            onChange={handleTimeChange}
            allowClear={false}
          />
        </div>

        <Text style={{ color: token.colorTextSecondary, fontSize: 12 }}>
          Notification fires while the app is open in your browser.
        </Text>
      </div>
    </div>
  );
}
