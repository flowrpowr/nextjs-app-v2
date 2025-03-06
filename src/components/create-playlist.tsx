"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { createPlaylist } from "@/actions/playlist";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Playlist name is required"),
});

export function CreatePlaylist() {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("name", values.name);

            const result = await createPlaylist(formData);

            if (result.error) {
                toast.error("Failed to create playlist. Please try again.");
            } else {
                toast.success("Playlist created successfully!");
                setOpen(false);
                form.reset();
            }
        });
    }

    return (
        <>
            <SidebarMenuButton onClick={() => setOpen(true)}>
                <PlusIcon className="size-4 shrink-0" />
                <span>New Playlist</span>
            </SidebarMenuButton>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Playlist</DialogTitle>
                        <DialogDescription>Enter a name for your new playlist.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Playlist name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Favorites" type="text" {...field} />
                                        </FormControl>
                                        <FormDescription>This is the display name.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Creating..." : "Create Playlist"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
