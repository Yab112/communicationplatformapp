"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  chatMessages: z.boolean(),
  resourceUpdates: z.boolean(),
  announcements: z.boolean(),
  groupMentions: z.boolean(),
  directMessages: z.boolean(),
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

export function NotificationSettings() {
  const { toast } = useToast()

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      chatMessages: true,
      resourceUpdates: true,
      announcements: true,
      groupMentions: true,
      directMessages: true,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (data: NotificationFormValues) => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">Manage how and when you receive notifications.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={form.watch("emailNotifications")}
                  onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications" className="font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={form.watch("pushNotifications")}
                  onCheckedChange={(checked) => form.setValue("pushNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Select which types of activities you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="chatMessages" className="font-medium">
                    Chat Messages
                  </Label>
                  <p className="text-sm text-muted-foreground">Notifications for new messages in group chats</p>
                </div>
                <Switch
                  id="chatMessages"
                  checked={form.watch("chatMessages")}
                  onCheckedChange={(checked) => form.setValue("chatMessages", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="directMessages" className="font-medium">
                    Direct Messages
                  </Label>
                  <p className="text-sm text-muted-foreground">Notifications for private messages</p>
                </div>
                <Switch
                  id="directMessages"
                  checked={form.watch("directMessages")}
                  onCheckedChange={(checked) => form.setValue("directMessages", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="resourceUpdates" className="font-medium">
                    Resource Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">Notifications when new resources are added</p>
                </div>
                <Switch
                  id="resourceUpdates"
                  checked={form.watch("resourceUpdates")}
                  onCheckedChange={(checked) => form.setValue("resourceUpdates", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="announcements" className="font-medium">
                    Announcements
                  </Label>
                  <p className="text-sm text-muted-foreground">Notifications for important announcements</p>
                </div>
                <Switch
                  id="announcements"
                  checked={form.watch("announcements")}
                  onCheckedChange={(checked) => form.setValue("announcements", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="groupMentions" className="font-medium">
                    Group Mentions
                  </Label>
                  <p className="text-sm text-muted-foreground">Notifications when you&apos;re mentioned in a group</p>
                </div>
                <Switch
                  id="groupMentions"
                  checked={form.watch("groupMentions")}
                  onCheckedChange={(checked) => form.setValue("groupMentions", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Preferences
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
