"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  message,
  theme,
} from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { storage } from "@/lib/storage";
import type { Category } from "@/lib/types";

const { Title, Text } = Typography;

interface FormValues {
  description: string;
  amount: number;
  categoryId: string;
  date: Dayjs;
  notes?: string;
}

export default function AddExpense() {
  const { token } = theme.useToken();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    setCategories(storage.getCategories());
  }, []);

  function handleSubmit(values: FormValues) {
    const expenses = storage.getExpenses();
    const newExpense = {
      id: crypto.randomUUID(),
      description: values.description.trim(),
      amount: values.amount,
      categoryId: values.categoryId,
      date: values.date.format("YYYY-MM-DD"),
      notes: values.notes?.trim() || undefined,
    };
    storage.setExpenses([newExpense, ...expenses]);
    message.success("Expense added!");
    router.push("/");
  }

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: (
      <span className="flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: c.color }}
        />
        {c.name}
      </span>
    ),
  }));

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="flex items-center"
        />
        <div>
          <Title level={3} className="!mb-0">
            Add Expense
          </Title>
          <Text type="secondary">Record a new expense</Text>
        </div>
      </div>

      {/* Form card */}
      <div
        className="rounded-xl p-6"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ date: dayjs(), categoryId: "cat-other" }}
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Enter a description" }]}
          >
            <Input
              placeholder="e.g. Grocery shopping at BigBazaar"
              maxLength={120}
              size="large"
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label="Amount (₹)"
              name="amount"
              rules={[
                { required: true, message: "Enter an amount" },
                { type: "number", min: 0.01, message: "Must be greater than 0" },
              ]}
            >
              <InputNumber
                className="w-full"
                min={0.01}
                precision={2}
                placeholder="0.00"
                size="large"
                prefix="₹"
              />
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Pick a date" }]}
            >
              <DatePicker className="w-full" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: "Select a category" }]}
          >
            <Select options={categoryOptions} size="large" />
          </Form.Item>

          <Form.Item label="Notes (optional)" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Any additional details..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => router.back()}
              size="large"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              size="large"
              className="flex-1 sm:flex-none"
            >
              Add Expense
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
