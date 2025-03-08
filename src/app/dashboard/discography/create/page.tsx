"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music, Upload } from "lucide-react";
import Dropzone from "react-dropzone";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { createRelease } from "@/actions/release";
import { toast } from "sonner";
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

const RELEASE_TYPES = ["SINGLE", "EP", "LP", "COMPILATION", "MIXTAPE"];

const validationSchema = z.object({
  releaseTitle: z.string().min(1, {
    message: "Release title is required",
  }),
  releaseType: z.enum(["SINGLE", "EP", "LP", "COMPILATION", "MIXTAPE"], {
    required_error: "Release type is required",
  }),
  genre: z.string().min(1, {
    message: "Genre is required",
  }),
  coverUrl: z.any().refine((val) => val?.length > 0, {
    message: "Cover image is required",
  }),
  tracks: z
    .array(
      z.object({
        file: z.any(),
        title: z.string().min(1, { message: "Track title is required" }),
      })
    )
    .nonempty({ message: "At least one track is required" }),
});

type FormValues = z.infer<typeof validationSchema>;

export default function ReleaseUploadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      releaseTitle: "",
      releaseType: "SINGLE",
      genre: "",
      coverUrl: undefined,
      tracks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "tracks",
    control: form.control,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      toast.loading("Creating your release...");

      // Create FormData object
      const formData = new FormData();

      // Add text fields
      formData.append("releaseTitle", values.releaseTitle);
      formData.append("releaseType", values.releaseType);
      formData.append("genre", values.genre);

      // Add cover image
      if (values.coverUrl?.[0]) {
        formData.append("coverUrl", values.coverUrl[0]);
      }

      // Add tracks (with their titles)
      values.tracks.forEach((track, index) => {
        formData.append(`trackFile${index}`, track.file);
        formData.append(`trackTitle${index}`, track.title);
      });

      // Add track count so server knows how many to process
      formData.append("trackCount", values.tracks.length.toString());

      // Call the server action with FormData
      await createRelease(formData);

      toast.success("Release created successfully!");
      router.push("/dashboard/discography");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create release. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Release</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="releaseTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter release title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="releaseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a release type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RELEASE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENRE_OPTIONS.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverUrl"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <Dropzone
                    accept={{
                      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
                    }}
                    maxFiles={1}
                    onDrop={(acceptedFiles) => onChange(acceptedFiles)}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <div
                        {...getRootProps()}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
                          isDragActive && "border-primary bg-primary/10"
                        )}
                      >
                        <input {...getInputProps()} {...field} />
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">
                          Drag & drop a cover image here, or click to select one
                        </p>
                      </div>
                    )}
                  </Dropzone>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tracks</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: "", file: null })}
              >
                Add Track
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium">Track {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`tracks.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Track Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter track title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`tracks.${index}.file`}
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Audio File</FormLabel>
                      <FormControl>
                        <Dropzone
                          accept={{
                            "audio/*": [".mp3", ".wav", ".m4a", ".aac"],
                          }}
                          maxFiles={1}
                          onDrop={(acceptedFiles) => onChange(acceptedFiles[0])}
                        >
                          {({ getRootProps, getInputProps, isDragActive }) => (
                            <div
                              {...getRootProps()}
                              className={cn(
                                "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer",
                                isDragActive && "border-primary bg-primary/10"
                              )}
                            >
                              <input {...getInputProps()} {...field} />
                              <Music className="mx-auto h-8 w-8 text-muted-foreground" />
                              <p className="mt-2 text-sm text-muted-foreground">
                                Drag & drop an audio file here, or click to
                                select one
                              </p>
                            </div>
                          )}
                        </Dropzone>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            Create Release
          </Button>
        </form>
      </Form>
    </div>
  );
}
