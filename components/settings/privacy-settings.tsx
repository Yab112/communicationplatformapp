"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const privacyFormSchema = z.object({
  profileVisibility: z.enum(["public", "private", "connections-only"]),
  dataCollection: z.boolean(),
  personalizedAds: z.boolean(),
  searchVisibility: z.boolean(),
})

type PrivacyFormValues = z.infer<typeof privacyFormSchema>

export function PrivacySettings() {
  const { toast } = useToast()

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues: {
      profileVisibility: "connections-only",
      dataCollection: true,
      personalizedAds: false,
      searchVisibility: true,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (data: PrivacyFormValues) => {
    toast({
      title: "Privacy settings updated",
      description: "Your privacy preferences have been saved successfully.",
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Privacy Settings</h1>
        <p className="text-muted-foreground">Control your privacy and data sharing preferences.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Privacy</CardTitle>
            <CardDescription>Control who can see your profile and information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="profileVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Visibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">Public (Anyone can view)</SelectItem>
                            <SelectItem value="connections-only">Connections Only</SelectItem>
                            <SelectItem value="private">Private (Only you)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose who can see your profile and activity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="searchVisibility"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Search Visibility</FormLabel>
                          <FormDescription>
                            Allow your profile to appear in search results
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dataCollection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Data Collection</FormLabel>
                            <FormDescription>
                              Allow us to collect anonymous usage data to improve our services
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalizedAds"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Personalized Ads</FormLabel>
                            <FormDescription>
                              Show personalized advertisements based on your activity
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Save Privacy Settings
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}