"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music, Upload } from "lucide-react";
import Dropzone from "react-dropzone";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { createAlbum } from "@/actions/album"; // Import the server action
import { toast } from "sonner"; // Assuming you use sonner for toasts, adjust if using something else
import { useRouter } from "next/navigation";

const GENRE_OPTIONS = [
    "Pop",
    "Rock",
    "Hip Hop",
    "R&B",
    "Country",
    "Electronic",
    "Jazz",
    "Classical",
    "Reggae",
    "Folk",
    "Metal",
    "Blues",
    "Other",
];

const validationSchema = z.object({
    albumTitle: z.string().min(1, {
        message: "Album title is required",
    }),
    genre: z.string().min(1, {
        message: "Genre is required",
    }),
    albumCover: z.any().refine((val) => val?.length > 0, {
        message: "Album cover is required",
    }),
    songs: z
        .array(
            z.object({
                file: z.any(),
                title: z.string().min(1, { message: "Song title is required" }),
            })
        )
        .nonempty({ message: "At least one song is required" }),
});

type FormValues = z.infer<typeof validationSchema>;

export default function MusicUploadForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(validationSchema),
        mode: "onBlur",
        defaultValues: {
            albumTitle: "",
            genre: "",
            albumCover: undefined,
            songs: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "songs",
        control: form.control,
    });

    const onSubmit = async (values: FormValues) => {
        try {
            setIsSubmitting(true);
            toast.loading("Creating your album...");

            // Create FormData object
            const formData = new FormData();

            // Add text fields
            formData.append("albumTitle", values.albumTitle);
            formData.append("genre", values.genre);

            // Add album cover
            if (values.albumCover?.[0]) {
                formData.append("albumCover", values.albumCover[0]);
            }

            // Add songs (with their titles)
            values.songs.forEach((song, index) => {
                formData.append(`songFile${index}`, song.file);
                formData.append(`songTitle${index}`, song.title);
            });

            // Add song count so server knows how many to process
            formData.append("songCount", values.songs.length.toString());

            // Call the server action with FormData
            await createAlbum(formData);

            toast.success("Album created successfully!");
            router.push("/dashboard/discography");
            router.refresh();
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to create album. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center">
            <Form {...form}>
                <form action="" onSubmit={form.handleSubmit(onSubmit)} className="flex-1">
                    <h2 className="text-3xl font-bold">Create</h2>

                    <div className="grid grid-cols-2 gap-10 mt-5">
                        <div className="space-y-3">
                            {/* Album Cover Upload */}
                            <div className="relative album-cover mb-6">
                                <FormField
                                    control={form.control}
                                    name="albumCover"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Album Cover</FormLabel>
                                            <FormControl>
                                                <Dropzone
                                                    accept={{
                                                        "image/*": [".jpg", ".jpeg", ".png"],
                                                    }}
                                                    onDropAccepted={(acceptedFiles) => {
                                                        field.onChange(acceptedFiles);
                                                    }}
                                                    multiple={false}
                                                    maxSize={5000000}
                                                >
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div
                                                            {...getRootProps({
                                                                className: cn(
                                                                    "p-6 mb-4 flex flex-col items-center justify-center w-full rounded-md cursor-pointer border border-dashed border-gray-300 hover:border-primary transition-colors",
                                                                    field.value?.length > 0 ? "bg-gray-50" : ""
                                                                ),
                                                            })}
                                                        >
                                                            <div className="flex flex-col items-center gap-y-2">
                                                                <Upload className="h-10 w-10 text-gray-400" />
                                                                {field.value?.[0]?.name ? (
                                                                    <div className="text-sm text-center">
                                                                        <p className="font-medium">
                                                                            {field.value[0].name}
                                                                        </p>
                                                                        <p className="text-gray-500 text-xs">
                                                                            {(
                                                                                field.value[0].size /
                                                                                1024 /
                                                                                1024
                                                                            ).toFixed(2)}{" "}
                                                                            MB
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm text-center text-gray-500">
                                                                        <p className="font-medium">
                                                                            Drop your album cover here or click to
                                                                            browse
                                                                        </p>
                                                                        <p>JPG, PNG up to 5MB</p>
                                                                    </div>
                                                                )}
                                                                <input {...getInputProps()} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Album Details */}
                            <div className="relative album-title">
                                <FormField
                                    name="albumTitle"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Album Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter album title"
                                                    type="text"
                                                    className="mt-1"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Genre */}
                            <div className="relative genre">
                                <FormField
                                    name="genre"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Genre</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a genre" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {GENRE_OPTIONS.map((genre) => (
                                                            <SelectItem key={genre} value={genre}>
                                                                {genre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="!mt-10 flex gap-2">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create"}
                                </Button>
                                <Button type="button" asChild variant="outline" disabled={isSubmitting}>
                                    <a href="/dashboard/discography">Cancel</a>
                                </Button>
                            </div>
                        </div>

                        {/* Songs List */}
                        <div className="relative songs">
                            <FormLabel className="text-base mb-2 block">Songs</FormLabel>

                            {fields.map((field, index) => (
                                <div key={field.id} className="mb-4 p-4 border rounded-md bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">Song {index + 1}</h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            disabled={isSubmitting}
                                        >
                                            Remove
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name={`songs.${index}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Song Title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={isSubmitting} />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="text-sm text-gray-500">
                                            {form.getValues(`songs.${index}.file.name`)}
                                            <span className="text-xs ml-2">
                                                ({(form.getValues(`songs.${index}.file.size`) / 1024 / 1024).toFixed(2)}{" "}
                                                MB)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Song Button */}
                            <FormField
                                control={form.control}
                                name="songs"
                                render={() => (
                                    <Dropzone
                                        accept={{
                                            "audio/*": [".mp3", ".wav", ".ogg", ".flac"],
                                        }}
                                        onDropAccepted={(acceptedFiles) => {
                                            acceptedFiles.forEach((file) => {
                                                append({
                                                    file: file,
                                                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension as default title
                                                });
                                            });
                                        }}
                                        multiple={true}
                                        maxSize={20000000} // 20MB
                                        disabled={isSubmitting}
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <div
                                                {...getRootProps({
                                                    className: cn(
                                                        "p-4 mb-4 flex flex-col items-center justify-center w-full rounded-md cursor-pointer border border-dashed border-gray-300 hover:border-primary transition-colors",
                                                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                                                    ),
                                                })}
                                            >
                                                <div className="flex items-center gap-x-3 py-2">
                                                    <Music className="h-6 w-6 text-gray-400" />
                                                    <label
                                                        htmlFor="songs"
                                                        className="text-sm cursor-pointer focus:outline-none focus:underline"
                                                        tabIndex={0}
                                                    >
                                                        Add song files (MP3, WAV, OGG)
                                                        <input {...getInputProps()} />
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </Dropzone>
                                )}
                            />
                            {form.formState.errors.songs?.message && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.songs.message}</p>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
