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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

const privacyFormSchema = z.object({
  profileVisibility: z.enum(["public", "students", "none"]),
  allowDirectMessages: z.enum(["everyone", "connections", "none"]),
  showOnlineStatus: z.boolean(),
  showReadReceipts: z.boolean(),
  allowTagging: z.boolean(),
})

type PrivacyFormValues = z.infer<typeof privacyFormSchema>

export function PrivacySettings() {
  const { toast } = useToast()

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues: {
      profileVisibility: "public",
      allowDirectMessages: "everyone",
      showOnlineStatus: true,
      showReadReceipts: true,
      allowTagging: true,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (data: PrivacyFormValues) => {
    toast({
      title: "Privacy settings updated",
      description: "Your privacy preferences have been saved.",
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Privacy Settings</h1>
        <p className="text-muted-foreground">Control who can see your information and contact you.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility</CardTitle>
              <CardDescription>Control who can see your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-4">
                  <Label className="font-medium">Who can see your profile?</Label>
                  <p className="text-sm text-muted-foreground">Choose who can view your profile information</p>
                </div>
                <RadioGroup
                  value={form.watch("profileVisibility")}
                  onValueChange={(value: "public" | "students" | "none") => form.setValue("profileVisibility", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Everyone (Public)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="students" id="students" />
                    <Label htmlFor="students">Students and Faculty Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">No One (Private)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <div className="mb-4">
                  <Label className="font-medium">Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">Control who can send you direct messages</p>
                </div>
                <RadioGroup
                  value={form.watch("allowDirectMessages")}
                  onValueChange={(value: "everyone" | "connections" | "none") =>
                    form.setValue("allowDirectMessages", value)
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="everyone" id="dm-everyone" />
                    <Label htmlFor="dm-everyone">Everyone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="connections" id="dm-connections" />
                    <Label htmlFor="dm-connections">Connections Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="dm-none" />
                    <Label htmlFor="dm-none">No One</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat Privacy</CardTitle>
              <CardDescription>Control your visibility and interaction in chats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showOnlineStatus" className="font-medium">
                    Show Online Status
                  </Label>
                  <p className="text-sm text-muted-foreground">Allow others to see when you&apos;re online</p>
                </div>
                <Switch
                  id="showOnlineStatus"
                  checked={form.watch("showOnlineStatus")}
                  onCheckedChange={(checked) => form.setValue("showOnlineStatus", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showReadReceipts" className="font-medium">
                    Show Read Receipts
                  </Label>
                  <p className="text-sm text-muted-foreground">Let others know when you&apos;ve read their messages</p>
                </div>
                <Switch
                  id="showReadReceipts"
                  checked={form.watch("showReadReceipts")}
                  onCheckedChange={(checked) => form.setValue("showReadReceipts", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowTagging" className="font-medium">
                    Allow Tagging
                  </Label>
                  <p className="text-sm text-muted-foreground">Allow others to tag you in posts and comments</p>
                </div>
                <Switch
                  id="allowTagging"
                  checked={form.watch("allowTagging")}
                  onCheckedChange={(checked) => form.setValue("allowTagging", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Privacy Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
