import json

from channels.generic.websocket import AsyncWebsocketConsumer


class DashboardConsumer(AsyncWebsocketConsumer):
    """Per-user channel: pushes 'plan ready' / feedback acks to the dashboard."""

    async def connect(self):
        user = self.scope.get("user")
        if user is None or not getattr(user, "is_authenticated", False):
            await self.close()
            return
        self.group = f"user_{user.id}"
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group"):
            await self.channel_layer.group_discard(self.group, self.channel_name)

    async def plan_ready(self, event):
        await self.send(text_data=json.dumps({"event": "plan_ready", **event["payload"]}))

    async def feedback_ack(self, event):
        await self.send(text_data=json.dumps({"event": "feedback_ack", **event["payload"]}))
