import { List, Space, Avatar, Empty, App } from "antd";
import { Typography } from "antd";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { UserOutlined, CloseOutlined } from "@ant-design/icons";
import {useAuth} from "@/hooks/useAuth";
import { api } from "@/utils/api";
import { useRoom } from "@/contexts/RoomContext";

const { Text } = Typography;

export default function Members() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const { currentRoom, mutate } = useRoom();

  const handleKick = async (userId: string) => {
    if (!currentRoom) return;

    try {
      await api.delete(`/rooms/${currentRoom.id}/kick/${userId}`);
      message.success('User removed from channel');
      mutate();
    } catch (error) {
      console.error('Error kicking user:', error);
      message.error('Error removing user');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        size="small"
        title={
          <Space size={8}>
            <span>Users</span>
            {currentRoom ? <Tag color="blue">{currentRoom?.members?.length}</Tag> : null}
          </Space>
        }
        className="glass"
        styles={{ body: { background: 'transparent' } }}
        variant="outlined"
      >
        {currentRoom ? (
          <List
            size="small"
            dataSource={currentRoom?.members ?? []}
            renderItem={(u) => {
              const isAdminSelf = currentRoom?.owner?.id === user?.id;
              const isAdminUser = currentRoom?.owner?.id === u?.id;

              return (
                <List.Item
                  className="user-row"
                  actions={
                    isAdminSelf && u?.id !== user?.id
                      ? [
                          <Button
                            key="kick"
                            size="small"
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleKick(u.id.toString())}
                            title={`Remove ${u?.username}`}
                          />,
                        ]
                      : undefined
                  }
                >
                  <Space size={4}>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <Text strong={u?.id === user?.id}>{u?.username}</Text>
                    {u?.id === user?.id ? <Tag color="blue">you</Tag> : null}
                    {isAdminUser ? <Tag color="gold">admin</Tag> : null}
                  </Space>
                </List.Item>
              );
            }}
            locale={{ emptyText: "No users" }}
          />
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
            <Empty description="Join a channel" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </Card>
    </div>
  );
}
