import { List, Space, Divider, App, Form } from "antd";
import useSWR from "swr";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Tag from "@/components/ui/tag";
import { PlusOutlined } from "@ant-design/icons";
import { api, type ApiResponse } from "@/utils/api";

interface RoomsProps {
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
}

export default function Rooms({ currentRoom, setCurrentRoom }: RoomsProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Room[]>>(
    "/rooms",
    () => api.get<ApiResponse<Room[]>>("/rooms")
  );

  const rooms = data?.data || [];

  const handleCreate = (values: { name: string }) => {
    const name = values.name.trim();
    if (!name) return;
    if (rooms.some((r) => r.name === name)) {
      message.info("Channel already exists.");
      return;
    }
    api
      .post<Room>("/rooms", { name })
      .then(() => mutate())
      .then(() => {
        message.success(`Channel "${name}" created`);
        form.resetFields();
      })
      .catch(() => message.error("Error creating channel"));
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <Card
        size="small"
        title={
          <Space size={8}>
            <span>Channels</span>
            <Tag color="blue">{rooms.length}</Tag>
          </Space>
        }
        className="glass"
      >
        <Form form={form} onFinish={handleCreate}>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="name" style={{ marginBottom: 0, flex: 1 }}>
              <Input.Text placeholder="Create channel (eg: general)" allowClear />
            </Form.Item>
            <Button type="primary" icon={<PlusOutlined />} htmlType="submit" />
          </Space.Compact>
        </Form>
        <Divider style={{ margin: "12px 0" }} />
        <List
          size="small"
          loading={isLoading}
          dataSource={rooms}
          renderItem={(room) => {
            const isActive = currentRoom?.id === room.id;
            const memberCount = room.members?.length || 0;
            return (
              <List.Item
                actions={[
                  <Tag key="count" color={isActive ? "blue" : "default"}>
                    {memberCount} user(s)
                  </Tag>,
                  isActive ? (
                    <Button key="leave" size="small" onClick={() => setCurrentRoom(null)}>
                      Leave
                    </Button>
                  ) : (
                    <Button key="join" size="small" type="primary" onClick={() => setCurrentRoom(room)}>
                      Join
                    </Button>
                  ),
                ]}
              >
                <Space wrap={false}>
                  <Tag color={isActive ? "blue" : "default"}>#{room.name}</Tag>
                  <span style={{ fontSize: "12px", color: "#666" }}>by {room.owner.username}</span>
                </Space>
              </List.Item>
            );
          }}
          locale={{ emptyText: error ? "Loading error" : "No channels" }}
        />
      </Card>
    </div>
  );
}
