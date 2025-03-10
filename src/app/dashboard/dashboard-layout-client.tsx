"use client";

import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarInset,
} from "@/components/ui/sidebar";
import { Flower2, Music, ListMusic, SquareLibrary, Telescope, HandCoins } from "lucide-react";
import { AudioProvider } from "@/context/audio";
import { AudioPlayer } from "@/components/audio-player";
import { CreatePlaylist } from "@/components/create-playlist";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { EnokiFlowProvider } from "@mysten/enoki/react"; // Import the EnokiFlowProvider
import { SessionProvider } from "next-auth/react";

const communityItems = [
    {
        title: "Discover",
        url: "/dashboard/discover",
        icon: Telescope,
    },
];

const libraryItems = [
    {
        title: "Tracks",
        url: "/dashboard/tracks",
        icon: Music,
    },
];

const artistItems = [
    {
        title: "Releases",
        url: "/dashboard/releases",
        icon: SquareLibrary,
    },
];

interface Playlist {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    coverUrl: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export const localStorageStore = {
    get: (key: string): string | null => {
        return localStorage.getItem(key);
    },

    set: (key: string, value: string): void => {
        localStorage.setItem(key, value);
    },

    delete: (key: string): void => {
        localStorage.removeItem(key);
    },
};

// Client component wrapper
export default function DashboardLayoutClient({
    children,
    playlists,
}: {
    children: React.ReactNode;
    playlists: Playlist[];
}) {
    return (
        <SessionProvider>
            <EnokiFlowProvider apiKey="enoki_public_6646caa1f30298432565ccca00c4b9a2" store={localStorageStore}>
                <AudioProvider>
                    <SidebarProvider>
                        <Sidebar>
                            <SidebarHeader>
                                <SidebarMenuButton asChild>
                                    <Link href="/" className="py-6">
                                        <Flower2 />
                                        <span className="font-medium text-lg">Flowr</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarHeader>
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarGroupLabel>Community</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {communityItems.map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton asChild>
                                                        <Link href={item.url}>
                                                            <item.icon />
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>

                                <SidebarGroup>
                                    <SidebarGroupLabel>Library</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {libraryItems.map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton asChild>
                                                        <Link href={item.url}>
                                                            <item.icon />
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                                <SidebarGroup>
                                    <SidebarGroupLabel>Playlists</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {playlists.map((playlist) => (
                                                <SidebarMenuItem key={playlist.id}>
                                                    <SidebarMenuButton asChild>
                                                        <Link href={`/dashboard/playlists/${playlist.id}`}>
                                                            <ListMusic />
                                                            <span>{playlist.name}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                            <SidebarMenuItem key="create-playlist">
                                                <CreatePlaylist />
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>

                                <SidebarGroup>
                                    <SidebarGroupLabel>Upload</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            <SidebarMenuItem key={"Upload Music"}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={`/dashboard/upload`}>
                                                        <span>Upload Music</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>

                                <SidebarGroup>
                                    <SidebarGroupLabel>Profile</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            <SidebarMenuItem key={"Profile"}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={`/dashboard/profile`}>
                                                        <span>Profile</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                        </Sidebar>
                        <SidebarInset className="flex flex-col">
                            <div className="flex flex-col flex-1 overflow-auto h-screen">
                                <main className="flex-1 h-screen p-12">{children}</main>
                                <header className="h-16 items-center px-4 border-t">
                                    <AudioPlayer />
                                </header>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                    <Toaster />
                </AudioProvider>
            </EnokiFlowProvider>
        </SessionProvider>
    );
}
